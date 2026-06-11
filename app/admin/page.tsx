"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Database, Plus, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { AuthBar } from "../../components/AuthBar";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { AppMatch, DbMedia, DbResult, Profile } from "../../lib/types";

type TransmissionRow = { match_id: string; media_id: string };

type ResultDraft = {
  home_score: string;
  away_score: string;
  status: string;
  source: string;
};

const EMPTY_RESULT: ResultDraft = { home_score: "", away_score: "", status: "scheduled", source: "admin_override" };

function normalizeTime(value: string) {
  return value.length === 5 ? value : value.slice(0, 5);
}

function composeMatches(matches: AppMatch[], media: DbMedia[], transmissions: TransmissionRow[], results: DbResult[]) {
  const mediaMap = new Map(media.map((item) => [item.id, item]));
  const resultMap = new Map(results.map((result) => [result.match_id, result]));
  const mediaByMatch = transmissions.reduce<Record<string, DbMedia[]>>((acc, item) => {
    const channel = mediaMap.get(item.media_id);
    if (!channel) return acc;
    acc[item.match_id] = acc[item.match_id] || [];
    acc[item.match_id].push(channel);
    return acc;
  }, {});

  return matches
    .map((match) => ({ ...match, media: mediaByMatch[match.id] || [], result: resultMap.get(match.id) || null }))
    .sort((a, b) => `${a.match_date} ${a.match_time}`.localeCompare(`${b.match_date} ${b.match_time}`));
}

export default function AdminPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<AppMatch[]>([]);
  const [media, setMedia] = useState<DbMedia[]>([]);
  const [transmissions, setTransmissions] = useState<TransmissionRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [resultDraft, setResultDraft] = useState<ResultDraft>(EMPTY_RESULT);
  const [newMediaName, setNewMediaName] = useState("");
  const [newMediaCountry, setNewMediaCountry] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [status, setStatus] = useState("");

  const isAdmin = profile?.role === "admin";
  const selectedMatch = useMemo(() => matches.find((match) => match.id === selectedId) || null, [matches, selectedId]);

  const handleAuthChange = useCallback((nextUserId: string | null, nextProfile: Profile | null) => {
    setUserId(nextUserId);
    setProfile(nextProfile);
  }, []);

  const loadData = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setStatus("Cargando panel administrador...");

    const [matchesRes, mediaRes, transmissionsRes, resultsRes] = await Promise.all([
      supabase.from("matches").select("*").order("match_date", { ascending: true }).order("match_time", { ascending: true }),
      supabase.from("media_channels").select("*").order("name", { ascending: true }),
      supabase.from("transmissions").select("match_id,media_id"),
      supabase.from("results").select("*")
    ]);

    const error = matchesRes.error || mediaRes.error || transmissionsRes.error || resultsRes.error;
    if (error) {
      setStatus(`Error: ${error.message}`);
      return;
    }

    const composed = composeMatches(
      (matchesRes.data || []) as AppMatch[],
      (mediaRes.data || []) as DbMedia[],
      (transmissionsRes.data || []) as TransmissionRow[],
      (resultsRes.data || []) as DbResult[]
    );

    setMatches(composed);
    setMedia((mediaRes.data || []) as DbMedia[]);
    setTransmissions((transmissionsRes.data || []) as TransmissionRow[]);
    setSelectedId((current) => current || composed[0]?.id || "");
    setStatus("");
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedMatch) return;
    setSelectedMediaIds(selectedMatch.media.map((item) => item.id));
    setResultDraft({
      home_score: selectedMatch.result?.home_score === null || selectedMatch.result?.home_score === undefined ? "" : String(selectedMatch.result.home_score),
      away_score: selectedMatch.result?.away_score === null || selectedMatch.result?.away_score === undefined ? "" : String(selectedMatch.result.away_score),
      status: selectedMatch.result?.status || selectedMatch.status || "scheduled",
      source: selectedMatch.result?.source || "admin_override"
    });
  }, [selectedMatch]);

  async function saveMatch() {
    if (!supabase || !selectedMatch) return;
    setStatus("Guardando partido y transmisiones...");

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        round: selectedMatch.round,
        group_code: selectedMatch.group_code || null,
        match_date: selectedMatch.match_date,
        day_label: selectedMatch.day_label,
        match_time: normalizeTime(selectedMatch.match_time),
        home_team: selectedMatch.home_team,
        away_team: selectedMatch.away_team,
        status: selectedMatch.status,
        external_fixture_id: selectedMatch.external_fixture_id || null
      })
      .eq("id", selectedMatch.id);

    if (updateError) {
      setStatus(`Error guardando partido: ${updateError.message}`);
      return;
    }

    await supabase.from("transmissions").delete().eq("match_id", selectedMatch.id);
    if (selectedMediaIds.length > 0) {
      const { error: insertError } = await supabase.from("transmissions").insert(
        selectedMediaIds.map((mediaId) => ({ match_id: selectedMatch.id, media_id: mediaId }))
      );
      if (insertError) {
        setStatus(`Error guardando medios: ${insertError.message}`);
        return;
      }
    }

    setStatus("Partido actualizado.");
    await loadData();
  }

  async function saveResultOverride() {
    if (!supabase || !selectedMatch) return;
    setStatus("Guardando resultado administrativo...");

    const home = resultDraft.home_score === "" ? null : Number(resultDraft.home_score);
    const away = resultDraft.away_score === "" ? null : Number(resultDraft.away_score);

    const { error } = await supabase.from("results").upsert({
      match_id: selectedMatch.id,
      home_score: home,
      away_score: away,
      status: resultDraft.status,
      source: resultDraft.source || "admin_override",
      updated_at: new Date().toISOString()
    });

    if (error) {
      setStatus(`Error guardando resultado: ${error.message}`);
      return;
    }

    setStatus("Resultado actualizado.");
    await loadData();
  }

  async function syncResults() {
    if (!supabase) return;
    setStatus("Sincronizando resultados desde API...");

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const response = await fetch("/api/results/sync", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(`Error de sincronización: ${payload.error || "error desconocido"}`);
      return;
    }
    setStatus(`Sincronización completa. Registros actualizados: ${payload.synced || 0}.`);
    await loadData();
  }

  async function addMediaChannel() {
    if (!supabase || !newMediaName.trim()) return;
    const id = newMediaName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("media_channels").upsert({
      id,
      name: newMediaName.trim(),
      country: newMediaCountry.trim() || null,
      url: newMediaUrl.trim() || null
    });

    if (error) {
      setStatus(`Error creando medio: ${error.message}`);
      return;
    }

    setNewMediaName("");
    setNewMediaCountry("");
    setNewMediaUrl("");
    setStatus("Medio creado/actualizado.");
    await loadData();
  }

  function patchSelectedMatch(partial: Partial<AppMatch>) {
    if (!selectedMatch) return;
    setMatches((prev) => prev.map((match) => match.id === selectedMatch.id ? { ...match, ...partial } : match));
  }

  function toggleMedia(mediaId: string) {
    setSelectedMediaIds((prev) => prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]);
  }

  return (
    <main className="page-shell">
      <section className="admin-top card">
        <a href="/" className="back-link"><ArrowLeft size={16} /> Volver a la parrilla</a>
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Panel para calendario, medios, horarios y resultados</h1>
          <p>La carga de resultados operativa debe venir de una API. El override administrativo queda como respaldo controlado.</p>
        </div>
      </section>

      <AuthBar onAuthChange={handleAuthChange} />

      {!isSupabaseConfigured && (
        <section className="warning-card">
          <Database size={20} />
          <p>Configura Supabase para usar el panel administrador. Ejecuta los archivos SQL incluidos en `/supabase` y completa `.env.local`.</p>
        </section>
      )}

      {isSupabaseConfigured && userId && !isAdmin && (
        <section className="warning-card">
          <ShieldAlert size={20} />
          <p>Tu usuario no tiene rol administrador. Cambia el perfil a `admin` desde Supabase para habilitar este panel.</p>
        </section>
      )}

      {status && <p className="inline-status">{status}</p>}

      {isAdmin && (
        <section className="admin-layout">
          <aside className="card admin-list">
            <h2>Partidos</h2>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>{match.day_label} {normalizeTime(match.match_time)} · {match.home_team} vs {match.away_team}</option>
              ))}
            </select>
            <button className="full-button" onClick={syncResults}><RefreshCw size={16} /> Sincronizar resultados API</button>
          </aside>

          {selectedMatch && (
            <section className="card admin-editor">
              <h2>Editar partido</h2>
              <div className="admin-grid-two">
                <label>Fecha<input type="date" value={selectedMatch.match_date} onChange={(event) => patchSelectedMatch({ match_date: event.target.value })} /></label>
                <label>Hora<input type="time" value={normalizeTime(selectedMatch.match_time)} onChange={(event) => patchSelectedMatch({ match_time: event.target.value })} /></label>
                <label>Día visible<input value={selectedMatch.day_label} onChange={(event) => patchSelectedMatch({ day_label: event.target.value })} /></label>
                <label>Fecha/Fase<input value={selectedMatch.round} onChange={(event) => patchSelectedMatch({ round: event.target.value })} /></label>
                <label>Grupo<input value={selectedMatch.group_code || ""} onChange={(event) => patchSelectedMatch({ group_code: event.target.value || null })} /></label>
                <label>Estado<input value={selectedMatch.status} onChange={(event) => patchSelectedMatch({ status: event.target.value })} /></label>
                <label>Equipo local<input value={selectedMatch.home_team} onChange={(event) => patchSelectedMatch({ home_team: event.target.value })} /></label>
                <label>Equipo visitante<input value={selectedMatch.away_team} onChange={(event) => patchSelectedMatch({ away_team: event.target.value })} /></label>
                <label className="wide">ID externo API<input value={selectedMatch.external_fixture_id || ""} onChange={(event) => patchSelectedMatch({ external_fixture_id: event.target.value || null })} placeholder="ID de fixture de proveedor oficial/API" /></label>
              </div>

              <h3>Medios de transmisión</h3>
              <div className="media-admin-grid">
                {media.map((channel) => (
                  <label className="checkbox-row" key={channel.id}>
                    <input type="checkbox" checked={selectedMediaIds.includes(channel.id)} onChange={() => toggleMedia(channel.id)} />
                    <span>{channel.name}{channel.country ? ` · ${channel.country}` : ""}</span>
                  </label>
                ))}
              </div>
              <button onClick={saveMatch}><Save size={16} /> Guardar partido y medios</button>

              <div className="divider-line" />

              <h3>Resultado administrativo / respaldo</h3>
              <p className="helper-text">Uso recomendado solo si la API no está disponible o requiere corrección operativa.</p>
              <div className="admin-grid-two compact-result-grid">
                <label>Goles {selectedMatch.home_team}<input type="number" min="0" value={resultDraft.home_score} onChange={(event) => setResultDraft((prev) => ({ ...prev, home_score: event.target.value }))} /></label>
                <label>Goles {selectedMatch.away_team}<input type="number" min="0" value={resultDraft.away_score} onChange={(event) => setResultDraft((prev) => ({ ...prev, away_score: event.target.value }))} /></label>
                <label>Estado
                  <select value={resultDraft.status} onChange={(event) => setResultDraft((prev) => ({ ...prev, status: event.target.value }))}>
                    <option value="scheduled">Programado</option>
                    <option value="live">En vivo</option>
                    <option value="finished">Finalizado</option>
                    <option value="postponed">Pospuesto</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </label>
                <label>Fuente<input value={resultDraft.source} onChange={(event) => setResultDraft((prev) => ({ ...prev, source: event.target.value }))} /></label>
              </div>
              <button className="secondary-admin" onClick={saveResultOverride}><Save size={16} /> Guardar resultado respaldo</button>
            </section>
          )}

          <aside className="card admin-list">
            <h2>Agregar o Editar Medio</h2>
            <label>Marca / canal<input value={newMediaName} onChange={(event) => setNewMediaName(event.target.value)} placeholder="Canal 4 El Salvador" /></label>
            <label>País<input value={newMediaCountry} onChange={(event) => setNewMediaCountry(event.target.value)} placeholder="Guatemala / El Salvador" /></label>
            <label>URL (Link de transmisión)<input value={newMediaUrl} onChange={(event) => setNewMediaUrl(event.target.value)} placeholder="https://..." /></label>
            <button className="full-button" onClick={addMediaChannel}><Plus size={16} /> Guardar / Crear medio</button>

            <h2>Medios actuales</h2>
            <p className="helper-text" style={{ marginBottom: "8px" }}>Haz clic en un canal para editar su link u otros datos:</p>
            <div className="media-row admin-media-list">
              {media.map((channel) => (
                <span
                  key={channel.id}
                  className="media-badge clickable-badge"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setNewMediaName(channel.name);
                    setNewMediaCountry(channel.country || "");
                    setNewMediaUrl(channel.url || "");
                  }}
                  title={`Editar ${channel.name}`}
                >
                  {channel.name}
                </span>
              ))}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}
