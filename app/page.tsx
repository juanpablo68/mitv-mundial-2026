"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, RefreshCw, Search, Send, ShieldAlert, Trophy, Tv, XCircle } from "lucide-react";
import { AuthBar } from "../components/AuthBar";
import { demoMatches, demoMedia } from "../lib/demoData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { AppMatch, DbMedia, DbResult, MediaSelection, Prediction, Profile, Winner } from "../lib/types";

type PickValue = {
  winner: Winner;
  homeScore: string;
  awayScore: string;
};

type SelectedMedia = Record<string, string>;
type Picks = Record<string, PickValue>;

const DEFAULT_PICK: PickValue = { winner: "", homeScore: "", awayScore: "" };

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function normalizeTime(value: string) {
  return value.length === 5 ? value : value.slice(0, 5);
}

function toDateTime(match: AppMatch) {
  return new Date(`${match.match_date}T${normalizeTime(match.match_time)}:00-06:00`);
}

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function getWinner(homeScore: number, awayScore: number): "home" | "draw" | "away" {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function brandNames(match: AppMatch) {
  return match.media.map((media) => media.name).join(", ");
}

function buildCalendarText(match: AppMatch, selectedMediaName?: string) {
  const start = toDateTime(match);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const summary = `Mundial 2026: ${match.home_team} vs ${match.away_team}`;
  const description = [
    `Medio seleccionado: ${selectedMediaName || brandNames(match) || "Por confirmar"}`,
    `Medios disponibles: ${brandNames(match) || "Por confirmar"}`,
    `${match.round}${match.group_code ? ` - Grupo ${match.group_code}` : ""}`
  ].join("\n");
  return { start, end, summary, description };
}

function downloadIcs(match: AppMatch, selectedMediaName?: string) {
  const { start, end, summary, description } = buildCalendarText(match, selectedMediaName);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MiTV Ufinet//Mundial 2026//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${match.id}@mitv-mundial-2026`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${match.match_date}-${match.home_team}-vs-${match.away_team}.ics`.replace(/\s+/g, "-").toLowerCase();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(match: AppMatch, selectedMediaName?: string) {
  const { start, end, summary, description } = buildCalendarText(match, selectedMediaName);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
    details: description
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatTelegramMessage(match: AppMatch, selectedMediaName?: string) {
  return `⚽ ${match.home_team} vs ${match.away_team}\n📅 ${match.day_label} - ${normalizeTime(match.match_time)} h\n📺 Ver en: ${selectedMediaName || brandNames(match) || "Por confirmar"}\n🏆 Mundial 2026 - ${match.round}${match.group_code ? ` - Grupo ${match.group_code}` : ""}`;
}

function evaluatePick(pick?: PickValue, result?: DbResult | null) {
  if (!pick || pick.winner === "" || result?.home_score === null || result?.away_score === null || result?.home_score === undefined || result?.away_score === undefined) {
    return { label: "Pendiente", className: "status neutral", points: 0 };
  }

  const actualWinner = getWinner(result.home_score, result.away_score);
  const pickHome = Number(pick.homeScore);
  const pickAway = Number(pick.awayScore);

  if (pick.homeScore !== "" && pick.awayScore !== "" && pickHome === result.home_score && pickAway === result.away_score) {
    return { label: "Marcador exacto", className: "status success", points: 3 };
  }

  if (pick.winner === actualWinner) {
    return { label: "Acierto", className: "status success", points: 1 };
  }

  return { label: "No acertó", className: "status danger", points: 0 };
}

function resultLabel(match: AppMatch) {
  const result = match.result;
  if (!result || result.home_score === null || result.away_score === null) return "Resultado pendiente";
  const status = result.status === "finished" ? "Final" : result.status === "live" ? "En vivo" : result.status;
  return `${status}: ${result.home_score} - ${result.away_score}`;
}

function composeMatches(matches: AppMatch[], media: DbMedia[], transmissions: { match_id: string; media_id: string }[], results: DbResult[]) {
  const resultMap = new Map(results.map((result) => [result.match_id, result]));
  const mediaMap = new Map(media.map((item) => [item.id, item]));
  const mediaByMatch = transmissions.reduce<Record<string, DbMedia[]>>((acc, item) => {
    const channel = mediaMap.get(item.media_id);
    if (!channel) return acc;
    acc[item.match_id] = acc[item.match_id] || [];
    acc[item.match_id].push(channel);
    return acc;
  }, {});

  return matches
    .map((match) => ({
      ...match,
      media: mediaByMatch[match.id] || [],
      result: resultMap.get(match.id) || null
    }))
    .sort((a, b) => `${a.match_date} ${a.match_time}`.localeCompare(`${b.match_date} ${b.match_time}`));
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allMatches, setAllMatches] = useState<AppMatch[]>(demoMatches);
  const [allMedia, setAllMedia] = useState<DbMedia[]>(demoMedia);
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedMediaFilter, setSelectedMediaFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia>({});
  const [picks, setPicks] = useState<Picks>({});
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramStatus, setTelegramStatus] = useState("");
  const [loadStatus, setLoadStatus] = useState("");

  const loadData = useCallback(async (currentUserId?: string | null) => {
    if (!supabase) {
      setAllMatches(demoMatches);
      setAllMedia(demoMedia);
      setSelectedMedia(loadState<SelectedMedia>("mitv:selectedMedia:demo", {}));
      setPicks(loadState<Picks>("mitv:picks:demo", {}));
      setTelegramChatId(loadState<string>("mitv:telegramChatId", ""));
      return;
    }

    setLoadStatus("Cargando datos...");
    const [matchesRes, mediaRes, transmissionsRes, resultsRes] = await Promise.all([
      supabase.from("matches").select("*").order("match_date", { ascending: true }).order("match_time", { ascending: true }),
      supabase.from("media_channels").select("*").order("name", { ascending: true }),
      supabase.from("transmissions").select("match_id,media_id"),
      supabase.from("results").select("*")
    ]);

    const error = matchesRes.error || mediaRes.error || transmissionsRes.error || resultsRes.error;
    if (error) {
      setLoadStatus(`Error cargando datos: ${error.message}`);
      return;
    }

    const composed = composeMatches(
      (matchesRes.data || []) as AppMatch[],
      (mediaRes.data || []) as DbMedia[],
      (transmissionsRes.data || []) as { match_id: string; media_id: string }[],
      (resultsRes.data || []) as DbResult[]
    );

    setAllMatches(composed);
    setAllMedia((mediaRes.data || []) as DbMedia[]);

    if (currentUserId) {
      const [picksRes, selectionsRes] = await Promise.all([
        supabase.from("predictions").select("match_id,winner,home_score,away_score").eq("user_id", currentUserId),
        supabase.from("user_media_selection").select("match_id,media_id").eq("user_id", currentUserId)
      ]);

      if (!picksRes.error) {
        const nextPicks = ((picksRes.data || []) as Prediction[]).reduce<Picks>((acc, item) => {
          acc[item.match_id] = {
            winner: item.winner,
            homeScore: item.home_score ?? "",
            awayScore: item.away_score ?? ""
          };
          return acc;
        }, {});
        setPicks(nextPicks);
      }

      if (!selectionsRes.error) {
        const nextSelections = ((selectionsRes.data || []) as MediaSelection[]).reduce<SelectedMedia>((acc, item) => {
          acc[item.match_id] = item.media_id;
          return acc;
        }, {});
        setSelectedMedia(nextSelections);
      }
    } else {
      setPicks({});
      setSelectedMedia({});
    }

    setLoadStatus("");
  }, []);

  useEffect(() => {
    loadData(userId);
  }, [loadData, userId]);

  useEffect(() => saveState("mitv:selectedMedia:demo", selectedMedia), [selectedMedia]);
  useEffect(() => saveState("mitv:picks:demo", picks), [picks]);
  useEffect(() => saveState("mitv:telegramChatId", telegramChatId), [telegramChatId]);

  const dates = useMemo(() => Array.from(new Set(allMatches.map((match) => match.match_date))), [allMatches]);

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allMatches.filter((match) => {
      const matchDate = selectedDate === "all" || match.match_date === selectedDate;
      const matchMedia = selectedMediaFilter === "all" || match.media.some((media) => media.id === selectedMediaFilter);
      const matchQuery =
        normalizedQuery === "" ||
        `${match.home_team} ${match.away_team} ${match.day_label} ${match.round}`.toLowerCase().includes(normalizedQuery);
      return matchDate && matchMedia && matchQuery;
    });
  }, [allMatches, selectedDate, selectedMediaFilter, query]);

  const grouped = useMemo(() => {
    return filteredMatches.reduce<Record<string, AppMatch[]>>((acc, match) => {
      acc[match.match_date] = acc[match.match_date] || [];
      acc[match.match_date].push(match);
      return acc;
    }, {});
  }, [filteredMatches]);

  const stats = useMemo(() => {
    const withResult = allMatches.filter((match) => match.result?.home_score !== null && match.result?.home_score !== undefined && match.result?.away_score !== null && match.result?.away_score !== undefined).length;
    const points = allMatches.reduce((sum, match) => sum + evaluatePick(picks[match.id], match.result).points, 0);
    const exact = allMatches.filter((match) => evaluatePick(picks[match.id], match.result).label === "Marcador exacto").length;
    const hit = allMatches.filter((match) => evaluatePick(picks[match.id], match.result).label === "Acierto").length;
    return { totalMatches: allMatches.length, withResult, points, exact, hit };
  }, [allMatches, picks]);

  async function updatePick(matchId: string, partial: Partial<PickValue>) {
    const nextPick = { ...(picks[matchId] || DEFAULT_PICK), ...partial };
    setPicks((prev) => ({ ...prev, [matchId]: nextPick }));

    if (!supabase || !userId) return;
    await supabase.from("predictions").upsert({
      user_id: userId,
      match_id: matchId,
      winner: nextPick.winner,
      home_score: nextPick.homeScore,
      away_score: nextPick.awayScore
    });
  }

  async function updateSelectedMedia(matchId: string, mediaId: string) {
    setSelectedMedia((prev) => ({ ...prev, [matchId]: mediaId }));

    if (!supabase || !userId) return;
    await supabase.from("user_media_selection").upsert({
      user_id: userId,
      match_id: matchId,
      media_id: mediaId
    });
  }

  async function sendTelegram(match: AppMatch, selectedMediaName?: string) {
    setTelegramStatus("Enviando mensaje...");
    const text = formatTelegramMessage(match, selectedMediaName);

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, chatId: telegramChatId || undefined })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Error de envío");
      setTelegramStatus("Mensaje enviado por Telegram.");
    } catch {
      const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      setTelegramStatus("No se pudo enviar por Bot API. Se abrió el modo compartir de Telegram.");
    }
  }

  const handleAuthChange = useCallback((nextUserId: string | null, nextProfile: Profile | null) => {
    setUserId(nextUserId);
    setProfile(nextProfile);
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="brand-panel logo-panel">
          <img src="/logos/ufinet.webp" alt="Ufinet" className="brand-logo ufinet-logo" />
          <span className="brand-x">×</span>
          <img src="/logos/mitv.webp" alt="MiTV" className="brand-logo mitv-logo" />
          <small>Parrilla Mundial 2026</small>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Mundial 2026 · Fase de grupos</p>
          <h1>Partidos, medios, calendario y pronósticos recreativos.</h1>
          <p>
            Consulta la transmisión por día, selecciona dónde ver el partido, agenda el evento, comparte avisos por Telegram y valida tus pronósticos contra resultados sincronizados por API.
          </p>
        </div>
        <div className="hero-stats">
          <article><strong>{stats.totalMatches}</strong><span>partidos cargados</span></article>
          <article><strong>{stats.withResult}</strong><span>con resultado API</span></article>
          <article><strong>{stats.points}</strong><span>puntos personales</span></article>
        </div>
      </section>

      <AuthBar onAuthChange={handleAuthChange} />

      {isSupabaseConfigured && !userId && (
        <section className="warning-card">
          <ShieldAlert size={20} />
          <p>La parrilla se puede consultar sin ingresar. Para guardar medio elegido y pronósticos por usuario, ingresa con correo.</p>
        </section>
      )}

      <section className="toolbar card">
        <label>
          Día
          <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
            <option value="all">Todos los días</option>
            {dates.map((date) => {
              const sample = allMatches.find((match) => match.match_date === date);
              return <option key={date} value={date}>{sample?.day_label || date}</option>;
            })}
          </select>
        </label>
        <label>
          Medio
          <select value={selectedMediaFilter} onChange={(event) => setSelectedMediaFilter(event.target.value)}>
            <option value="all">Todos los medios</option>
            {allMedia.map((media) => <option key={media.id} value={media.id}>{media.name}</option>)}
          </select>
        </label>
        <label className="search-field">
          Buscar selección
          <span><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="México, Colombia, Argentina..." /></span>
        </label>
        <label>
          Chat ID Telegram
          <input value={telegramChatId} onChange={(event) => setTelegramChatId(event.target.value)} placeholder="Opcional si ya está en .env" />
        </label>
      </section>

      {loadStatus && <p className="inline-status">{loadStatus}</p>}
      {telegramStatus && <p className="telegram-status">{telegramStatus}</p>}

      <section className="scoreboard card">
        <div>
          <p className="eyebrow">Pronósticos recreativos</p>
          <h2>Resumen de aciertos</h2>
        </div>
        <div className="score-items">
          <span><Trophy size={18} /> {stats.points} puntos</span>
          <span><CheckCircle2 size={18} /> {stats.exact} exactos</span>
          <span><CheckCircle2 size={18} /> {stats.hit} ganador/empate</span>
        </div>
      </section>

      <section className="matches-list">
        {Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date} className="day-block">
            <header className="day-header">
              <CalendarDays size={20} />
              <h2>{dayMatches[0].day_label}</h2>
              <span>{dayMatches.length} partidos</span>
            </header>

            <div className="grid">
              {dayMatches.map((match) => {
                const pick = picks[match.id] || DEFAULT_PICK;
                const evaluation = evaluatePick(pick, match.result);
                const chosenMediaId = selectedMedia[match.id] || match.media[0]?.id || "";
                const chosenMediaName = match.media.find((media) => media.id === chosenMediaId)?.name || match.media[0]?.name;
                const canEditUserData = !isSupabaseConfigured || Boolean(userId);

                return (
                  <article className="match-card" key={match.id}>
                    <div className="match-head">
                      <span className="round-badge">{match.round}{match.group_code ? ` · Grupo ${match.group_code}` : ""}</span>
                      <span className="time"><Clock size={16} /> {normalizeTime(match.match_time)}</span>
                    </div>

                    <h3>{match.home_team} <span>vs</span> {match.away_team}</h3>

                    <div className="result-banner">
                      <RefreshCw size={16} /> {resultLabel(match)}
                    </div>

                    <div className="media-row">
                      <Tv size={16} />
                      {match.media.length > 0 ? (
                        match.media.map((media) => {
                          if (typeof media.url === "string") {
                            const isStream = media.url.includes(".m3u8") || media.url.includes(".mp4");
                            const targetUrl = isStream
                              ? `/watch?url=${encodeURIComponent(media.url)}&name=${encodeURIComponent(media.name)}`
                              : media.url;
                            return (
                              <a
                                key={media.id}
                                href={targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="media-badge clickable-badge"
                                title={`Ir a la transmisión de ${media.name}`}
                              >
                                {media.name}
                              </a>
                            );
                          } else {
                            return (
                              <span key={media.id} className="media-badge">
                                {media.name}
                              </span>
                            );
                          }
                        })
                      ) : (
                        <span className="media-badge muted">Medio por confirmar</span>
                      )}
                    </div>

                    <label className="compact-label">
                      Medio elegido para verlo
                      <select value={chosenMediaId} disabled={!canEditUserData || match.media.length === 0} onChange={(event) => updateSelectedMedia(match.id, event.target.value)}>
                        {match.media.map((media) => <option key={media.id} value={media.id}>{media.name}</option>)}
                      </select>
                      {chosenMediaId && (
                        (() => {
                          const selectedMediaItem = match.media.find(m => m.id === chosenMediaId);
                          if (selectedMediaItem && typeof selectedMediaItem.url === "string") {
                            const isStream = selectedMediaItem.url.includes(".m3u8") || selectedMediaItem.url.includes(".mp4");
                            const targetUrl = isStream
                              ? `/watch?url=${encodeURIComponent(selectedMediaItem.url)}&name=${encodeURIComponent(selectedMediaItem.name)}`
                              : selectedMediaItem.url;
                            return (
                              <a
                                href={targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="watch-now-link"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginTop: "4px",
                                  color: "var(--primary-dark)",
                                  fontSize: "0.8rem",
                                  fontWeight: "900",
                                  textDecoration: "underline"
                                }}
                              >
                                ▶ Ver transmisión elegida
                              </a>
                            );
                          }
                          return null;
                        })()
                      )}
                    </label>

                    <div className="actions">
                      <button onClick={() => downloadIcs(match, chosenMediaName)}>Agregar a mi calendario</button>
                      <a href={googleCalendarUrl(match, chosenMediaName)} target="_blank" rel="noreferrer">Google Calendar</a>
                      <button className="secondary" onClick={() => sendTelegram(match, chosenMediaName)}><Send size={16} /> Telegram</button>
                    </div>

                    <div className="prediction-panel">
                      <h4>Mi pronóstico</h4>
                      <div className="three-columns">
                        <label>
                          Pronóstico
                          <select value={pick.winner} disabled={!canEditUserData} onChange={(event) => updatePick(match.id, { winner: event.target.value as PickValue["winner"] })}>
                            <option value="">Seleccionar</option>
                            <option value="home">Gana {match.home_team}</option>
                            <option value="draw">Empate</option>
                            <option value="away">Gana {match.away_team}</option>
                          </select>
                        </label>
                        <label>
                          Goles {match.home_team}
                          <input type="number" min="0" disabled={!canEditUserData} value={pick.homeScore} onChange={(event) => updatePick(match.id, { homeScore: event.target.value })} />
                        </label>
                        <label>
                          Goles {match.away_team}
                          <input type="number" min="0" disabled={!canEditUserData} value={pick.awayScore} onChange={(event) => updatePick(match.id, { awayScore: event.target.value })} />
                        </label>
                      </div>
                      <span className={evaluation.className}>{evaluation.label}</span>
                      {!canEditUserData && <p className="helper-text">Ingresa con correo para guardar tu pronóstico.</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}

        {filteredMatches.length === 0 && (
          <div className="empty card">
            <XCircle size={32} />
            <h2>No hay partidos con esos filtros.</h2>
            <p>Prueba otro día, medio de transmisión o nombre de selección.</p>
          </div>
        )}
      </section>

      <footer className="footer-note">
        <strong>Nota:</strong> Se usan únicamente los logos corporativos de Ufinet y MiTV. Los medios de transmisión se muestran como marcas en texto, sin logos externos.
        {profile?.role === "admin" && <a href="/admin">Ir al panel administrador</a>}
      </footer>
    </main>
  );
}
