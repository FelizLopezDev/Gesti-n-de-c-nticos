import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVideoSource } from '../../services/videoService';

export const VideoPlayerModal: React.FC = () => {
  const { activePlayerSong, closePlayer } = useApp();

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoadingSrc, setIsLoadingSrc] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video source
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
          setVideoSrc(source || null);
          setIsLoadingSrc(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setVideoError('No se pudo cargar el video.');
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
  const totalSeconds = duration > 0 ? duration : activePlayerSong?.durationSeconds || 210;

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

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!activePlayerSong) return null;

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.round(videoRef.current.duration);
      if (dur > 0 && !isNaN(dur)) {
        setDuration(dur);
      }
      setIsBuffering(false);
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

  const handleTogglePlay = () => {
    if (videoRef.current && videoSrc) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error('Play error:', err));
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

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen not supported or allowed:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

  return (
    <div
      id="video-player-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs select-none"
    >
      <div
        ref={containerRef}
        id="video-player-container"
        className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Top Header: ONLY Title and Close Button */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 text-white z-10">
          <h3 className="text-xs font-semibold tracking-wide truncate pr-4">
            {activePlayerSong.title}
          </h3>
          <button
            id="close-player-btn"
            onClick={closePlayer}
            className="p-1 rounded text-stone-400 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {isLoadingSrc ? (
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Cargando video...</span>
            </div>
          ) : videoSrc ? (
            /* Real HTML5 Video */
            <>
              <video
                ref={videoRef}
                id="main-html5-video-player"
                src={videoSrc}
                playsInline
                className="w-full h-full object-contain bg-black cursor-pointer"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onError={() => setVideoError('Error al reproducir el formato de video.')}
                onClick={handleTogglePlay}
              />
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </>
          ) : (
            /* Minimal fallback for items without video file */
            <div
              onClick={handleTogglePlay}
              className="relative w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-300 cursor-pointer p-6"
            >
              <h2 className="text-xl font-semibold text-white tracking-tight text-center">
                {activePlayerSong.title}
              </h2>
              <p className="text-xs text-stone-400 mt-1">Reproducción de audio</p>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="text-center text-rose-400 space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p className="text-xs">{videoError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls Bar */}
        <div className="px-4 py-3 bg-stone-900 border-t border-stone-800 text-white space-y-2">
          {/* Timeline / Progress Bar */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-stone-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(Math.floor(pos * totalSeconds));
              }}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="w-10">{formatTime(totalSeconds)}</span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left: Play/Pause & Volume */}
            <div className="flex items-center gap-3">
              <button
                id="player-play-pause-btn"
                onClick={handleTogglePlay}
                className="p-1.5 rounded-md hover:bg-stone-800 text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 sm:w-20 accent-white h-1 bg-stone-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Fullscreen */}
            <div>
              <button
                id="player-fullscreen-btn"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-md hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
