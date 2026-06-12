"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Tv } from "lucide-react";

function WatchPlayerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const name = searchParams.get("name") || "Transmisión";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setError("No se proporcionó una URL de transmisión válida.");
      setLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Cargar Hls.js de forma dinámica
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      if (typeof Hls !== "undefined" && Hls.isSupported()) {
        // @ts-ignore
        const hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(
          // @ts-ignore
          Hls.Events.MANIFEST_PARSED,
          () => {
            setLoading(false);
            video.play().catch(() => {
              // El auto-play puede fallar por políticas del navegador
            });
          }
        );
        hls.on(
          // @ts-ignore
          Hls.Events.ERROR,
          (event: any, data: any) => {
            if (data.fatal) {
              console.error("HLS fatal error:", data);
              setError("Error cargando la transmisión. Por favor, verifica el enlace.");
              setLoading(false);
            }
          }
        );
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Soporte nativo de HLS (Safari/iOS)
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        video.addEventListener("error", () => {
          setError("Error en la reproducción nativa del stream.");
          setLoading(false);
        });
      } else {
        setError("Tu navegador no soporta la reproducción de este tipo de stream (HLS).");
        setLoading(false);
      }
    };

    script.onerror = () => {
      setError("No se pudo cargar el reproductor de video.");
      setLoading(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [url]);

  return (
    <main className="page-shell watch-page">
      <section className="admin-top card watch-card-header">
        <a href="/" className="back-link"><ArrowLeft size={16} /> Volver a la parrilla</a>
        <div style={{ marginTop: "12px" }}>
          <p className="eyebrow">Reproductor en vivo</p>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}><Tv size={28} /> {name}</h1>
          <p style={{ wordBreak: "break-all", fontSize: "0.9rem", color: "var(--muted)", margin: "0" }}>Enlace: {url}</p>
        </div>
      </section>

      <div className="video-container-card card">
        {error ? (
          <div className="player-error">
            <p>{error}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
              <a href={url} target="_blank" rel="noreferrer" className="actions button">Abrir link directamente</a>
              <a href={`vlc://${url}`} className="actions button secondary">Abrir en VLC App</a>
            </div>
          </div>
        ) : (
          <div className="player-wrapper">
            {loading && <div className="player-loader">Cargando reproductor en vivo...</div>}
            <video
              ref={videoRef}
              controls
              playsInline
              className="hls-video-player"
              poster="/logos/mitv.webp"
              style={{ width: "100%", borderRadius: "24px", background: "#000", maxHeight: "70vh" }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <a href={url} target="_blank" rel="noreferrer" className="actions button">
          Abrir enlace original
        </a>
        <a href={`vlc://${url}`} className="actions button secondary">
          📺 Abrir en VLC (Celular / App)
        </a>
      </div>

      <div className="footer-note" style={{ marginTop: "20px" }}>
        <strong>Nota de compatibilidad móvil:</strong> Este reproductor soporta transmisión adaptativa HLS (M3U8). Si experimentas problemas en tu celular (como con enlaces HTTP/CORS), presiona el botón **"Abrir en VLC"** para reproducirlo directamente en la app VLC instalada en tu móvil.
      </div>
    </main>
  );
}

export default function WatchPlayerPage() {
  return (
    <Suspense fallback={<div className="page-shell">Cargando...</div>}>
      <WatchPlayerContent />
    </Suspense>
  );
}
