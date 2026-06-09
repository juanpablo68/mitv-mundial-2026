import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type NormalizedResult = {
  externalFixtureId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  source: string;
};

type ResultUpsertRow = {
  match_id: string;
  home_score: number | null;
  away_score: number | null;
  status: NormalizedResult["status"];
  source: string;
  updated_at: string;
};

function normalizeStatus(status?: string): NormalizedResult["status"] {
  const value = (status || "").toUpperCase();
  if (["FT", "AET", "PEN", "FINISHED", "FINAL", "COMPLETED"].includes(value)) return "finished";
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "IN_PLAY"].includes(value)) return "live";
  if (["PST", "POSTPONED"].includes(value)) return "postponed";
  if (["CANC", "CANCELLED"].includes(value)) return "cancelled";
  return "scheduled";
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeApiFootball(payload: unknown): NormalizedResult[] {
  const data = payload as { response?: unknown[] };
  const rows = Array.isArray(data?.response) ? data.response : [];
  return rows
    .map((row) => {
      const item = row as {
        fixture?: { id?: string | number; status?: { short?: string } };
        goals?: { home?: unknown; away?: unknown };
      };
      return {
        externalFixtureId: String(item?.fixture?.id || ""),
        homeScore: numberOrNull(item?.goals?.home),
        awayScore: numberOrNull(item?.goals?.away),
        status: normalizeStatus(item?.fixture?.status?.short),
        source: "api-football"
      };
    })
    .filter((item) => item.externalFixtureId);
}

function normalizeGeneric(payload: unknown): NormalizedResult[] {
  const data = payload as { response?: unknown[]; matches?: unknown[] };
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(data?.response)
      ? data.response
      : Array.isArray(data?.matches)
        ? data.matches
        : [];

  return rows
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        externalFixtureId: String(item.external_fixture_id || item.fixture_id || item.id || ""),
        homeScore: numberOrNull(item.home_score ?? item.homeScore ?? item.goals_home),
        awayScore: numberOrNull(item.away_score ?? item.awayScore ?? item.goals_away),
        status: normalizeStatus(String(item.status || "")),
        source: String(item.source || "generic-api")
      };
    })
    .filter((item) => item.externalFixtureId);
}

async function fetchProviderResults() {
  const provider = process.env.RESULTS_API_PROVIDER || "generic";

  if (provider === "mock") {
    return [] as NormalizedResult[];
  }

  if (provider === "api-football") {
    const key = process.env.RESULTS_API_KEY;
    const league = process.env.RESULTS_API_LEAGUE_ID;
    const season = process.env.RESULTS_API_SEASON || "2026";
    if (!key || !league) throw new Error("Faltan RESULTS_API_KEY o RESULTS_API_LEAGUE_ID para API-Football.");

    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("league", league);
    url.searchParams.set("season", season);

    const response = await fetch(url.toString(), {
      headers: { "x-apisports-key": key },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`API-Football respondió ${response.status}`);
    return normalizeApiFootball(await response.json());
  }

  const url = process.env.RESULTS_API_URL;
  if (!url) throw new Error("Falta RESULTS_API_URL para sincronizar resultados.");

  const headerName = process.env.RESULTS_API_HEADER || "Authorization";
  const apiKey = process.env.RESULTS_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) headers[headerName] = headerName.toLowerCase() === "authorization" ? `Bearer ${apiKey}` : apiKey;

  const response = await fetch(url, { headers, cache: "no-store" });
  if (!response.ok) throw new Error(`La API de resultados respondió ${response.status}`);
  return normalizeGeneric(await response.json());
}

async function isAuthorized(request: NextRequest, admin: SupabaseClient) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!token) return process.env.NODE_ENV !== "production" && !cronSecret;

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return false;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) return false;
  return profile?.role === "admin";
}

async function syncResults(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ error: "Falta configurar NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const authorized = await isAuthorized(request, admin);
  if (!authorized) {
    return NextResponse.json({ error: "No autorizado para sincronizar resultados." }, { status: 401 });
  }

  try {
    const providerResults = await fetchProviderResults();

    if (providerResults.length === 0) {
      return NextResponse.json({ synced: 0, message: "La API no devolvió resultados para sincronizar." });
    }

    const externalIds = providerResults.map((result) => result.externalFixtureId);
    const { data: mappedMatches, error: matchError } = await admin
      .from("matches")
      .select("id,external_fixture_id")
      .in("external_fixture_id", externalIds);

    if (matchError) throw matchError;

    const matchByExternal = new Map((mappedMatches || []).map((match) => [String(match.external_fixture_id), match.id]));
    const rows: ResultUpsertRow[] = providerResults
      .map((result) => {
        const matchId = matchByExternal.get(result.externalFixtureId);
        if (!matchId) return null;
        return {
          match_id: matchId,
          home_score: result.homeScore,
          away_score: result.awayScore,
          status: result.status,
          source: result.source,
          updated_at: new Date().toISOString()
        };
      })
      .filter((row): row is ResultUpsertRow => row !== null);

    if (rows.length === 0) {
      return NextResponse.json({ synced: 0, message: "No hubo coincidencias entre external_fixture_id y la API." });
    }

    const { error: upsertError } = await admin.from("results").upsert(rows, { onConflict: "match_id" });
    if (upsertError) throw upsertError;

    return NextResponse.json({ synced: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return syncResults(request);
}

export async function GET(request: NextRequest) {
  return syncResults(request);
}
