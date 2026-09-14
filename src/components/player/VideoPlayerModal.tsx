import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Clock,
  Shield,
  RotateCcw,
  Loader2,
  AlertCircle,
  Video,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVideoSource } from '../../services/videoService';

export const VideoPlayerModal: React.FC = () => {
  const { activePlayerSong, activePlayerPermission, closePlayer } = useApp();

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoadingSrc, setIsLoadingSrc] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video source (memory, blob URL, or IndexedDB)
  useEffect(() => {
    let isCancelled = false;

    async function loadSource() {
      if (!activePlayerSong) return;
      setIsLoadingSrc(true);
      setVideoError(null);

      try {
        if (activePlayerSong.videoUrl) {
          if (!isCancelled) {
            setVideoSrc(activePlayerSong.videoUrl);
            setIsLoadingSrc(false);
          }
          return;
        }

        const source = await getVideoSource(activePlayerSong.id);
        if (!isCancelled) {
          if (source) {
            setVideoSrc(source);
          } else {
            // No real video uploaded for this default mock item
            setVideoSrc(null);
          }
          setIsLoadingSrc(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading video source:', err);
          setVideoError('No se pudo cargar el stream del video.');
          setIsLoadingSrc(false);
        }
      }
    }

    loadSource();

    return () => {
      isCancelled = true;
    };
  }, [activePlayerSong]);

  // Sync volume with HTML5 video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Fallback timer if no real MP4 source exists (for initial mock songs)
  const totalSeconds = duration > 0 ? duration : activePlayerSong?.durationSeconds || 240;

  useEffect(() => {
    let interval: any;
    if (!videoSrc && isPlaying && activePlayerSong) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoSrc, isPlaying, activePlayerSong, totalSeconds]);

  // HTML5 Video Event Handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.round(videoRef.current.duration);
      if (dur > 0 && !isNaN(dur)) {
        setDuration(dur);
      }
      setIsBuffering(false);
      // Autoplay attempt
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(Math.round(videoRef.current.currentTime));
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err);
            setIsPlaying(false);
          });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (newSeconds: number) => {
    const clamped = Math.max(0, Math.min(newSeconds, totalSeconds));
    setCurrentTime(clamped);
    if (videoRef.current && videoSrc) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleReset = () => {
    handleSeek(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

  if (!activePlayerSong || !activePlayerPermission) return null;

  const expiryDate = new Date(activePlayerPermission.expiresAt);
  const expiryTimeStr = expiryDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="video-player-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fadeIn select-none"
    >
      <div
        ref={containerRef}
        id="video-player-container"
        className="relative w-full max-w-5xl bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col"
      >
        {/* Top Floating Security & Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900/90 backdrop-blur-xs border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {activePlayerSong.title}
                </h3>
                {videoSrc && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    MP4 Nativo
                  </span>
                )}
              </div>
              <span className="text-stone-400 text-xs">
                {activePlayerSong.artist} · {activePlayerSong.category} ({activePlayerSong.musicalKey})
              </span>
            </div>
          </div>

          {/* Clear Expiration Display */}
          <div className="flex items-center gap-4">
            <div
              id="player-expiration-badge"
              className="px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5 shadow-xs text-xs"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Acceso disponible hasta: Hoy, {expiryTimeStr}</span>
            </div>

            <button
              id="close-player-btn"
              onClick={closePlayer}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Cerrar reproductor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Real Player Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          {isLoadingSrc ? (
            <div className="flex flex-col items-center justify-center text-stone-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-medium">Cargando stream de video protegido...</span>
            </div>
          ) : videoSrc ? (
            /* REAL HTML5 VIDEO ELEMENT */
            <>
              <video
                ref={videoRef}
                id="main-html5-video-player"
                src={videoSrc}
                playsInline
                className="w-full h-full object-contain bg-black"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={() => setVideoError('Error al reproducir el formato de video en el navegador.')}
                onClick={handleTogglePlay}
              />

              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                </div>
              )}

              {/* Watermark notice */}
              <div className="absolute top-4 right-4 z-10 text-[10px] text-white/50 font-mono pointer-events-none bg-black/40 px-2 py-1 rounded backdrop-blur-xs">
                PROYECCIÓN GOOGLE MEET · REPRODUCCIÓN NATIVA
              </div>

              {/* Central Play/Pause click overlay on hover */}
              <button
                id="video-screen-overlay-btn"
                onClick={handleTogglePlay}
                className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-stone-900/80 text-white flex items-center justify-center shadow-lg border border-stone-700 hover:scale-105 transition-transform">
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1 text-amber-400" />
                  )}
                </div>
              </button>
            </>
          ) : (
            /* FALLBACK FOR DEFAULT MOCK TRACKS (Church Projection Demo) */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div
                className={`absolute inset-0 opacity-40 transition-opacity duration-1000 bg-gradient-to-tr ${activePlayerSong.thumbnailGradient}`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

              <div className="relative z-10 text-center px-8 py-6 max-w-2xl">
                <div className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-amber-300 font-medium tracking-wider uppercase mb-3 border border-amber-500/30">
                  Pista Pre-Cargada · Proyección para Google Meet
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md leading-relaxed">
                  "{activePlayerSong.title}"
                </h2>

                <p className="text-xs text-stone-300 mt-2 font-mono">
                  {activePlayerSong.artist} · {activePlayerSong.musicalKey} ({activePlayerSong.tempoBpm} BPM)
                </p>

                <div className="mt-5 p-3 rounded-xl bg-black/50 border border-stone-800 text-xs text-stone-300 inline-flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Para reproducir un video real de tu computadora, sube un archivo <strong>.MP4</strong> en la pestaña "Canciones".
                  </span>
                </div>
              </div>

              {/* Watermark notice */}
              <div className="absolute top-4 right-4 z-10 text-[10px] text-stone-500 font-mono pointer-events-none">
                REPRODUCCIÓN PRIVADA Y PROTEGIDA
              </div>

              {/* Central Play/Pause button */}
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 z-20 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-stone-900/80 text-white flex items-center justify-center shadow-lg border border-stone-700">
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1 text-amber-400" />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Error display */}
          {videoError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 z-30">
              <div className="max-w-md bg-stone-900 border border-rose-800 rounded-xl p-4 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Error de reproducción</h4>
                <p className="text-xs text-stone-400">{videoError}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 px-3 py-1.5 bg-stone-800 text-stone-200 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Reintentar desde el inicio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
          {/* Seekable Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-400 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              id="player-progress-bar-container"
              className="flex-1 h-2.5 bg-stone-800 rounded-full overflow-hidden cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(Math.floor(pos * totalSeconds));
              }}
            >
              <div
                id="player-progress-bar-fill"
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-stone-400 w-12">
              {formatTime(totalSeconds)}
            </span>
          </div>

          {/* Control Buttons row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play / Pause button */}
              <button
                id="player-play-pause-btn"
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-lg bg-stone-100 text-stone-900 hover:bg-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5 text-stone-950" />
                )}
              </button>

              {/* Reset / Rewind */}
              <button
                id="player-rewind-btn"
                onClick={handleReset}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
                title="Reiniciar desde el inicio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2 pl-2">
                <button
                  id="player-mute-btn"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  id="player-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 sm:w-24 accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>
            </div>

            {/* Right Controls: Permission Info & Fullscreen */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-stone-400">
                Permiso otorgado por: <strong className="text-stone-300">{activePlayerPermission.grantedBy}</strong>
              </span>

              <button
                id="player-fullscreen-btn"
                onClick={toggleFullscreen}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Security / Compliance Notice at footer */}
        <div className="bg-stone-900 px-5 py-2.5 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-stone-400" />
            <span>
              Material protegido para uso exclusivo en servicios de la congregación. Prohibida la descarga y redistribución externa.
            </span>
          </div>
          <span className="font-mono text-stone-500">ID: {activePlayerSong.id}</span>
        </div>
      </div>
    </div>
  );
};
