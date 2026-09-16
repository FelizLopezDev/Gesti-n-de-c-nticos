import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const { activePlayerSong, closePlayer, setIsPlayerFullscreen } = useApp();

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
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls in fullscreen after inactivity (2.5 seconds)
  const resetControlsTimer = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Only auto-hide if in fullscreen mode
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  }, [isFullscreen]);

  // Handle activity inside fullscreen
  const handleUserActivity = () => {
    if (isFullscreen) {
      resetControlsTimer();
    }
  };

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

  // Fullscreen change listener across browsers
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFs);
      setIsPlayerFullscreen(isFs);
      if (isFs) {
        resetControlsTimer();
      } else {
        setIsControlsVisible(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      setIsPlayerFullscreen(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimer, setIsPlayerFullscreen]);

  // Keyboard shortcut handler (Space for play/pause, F for fullscreen, Esc handled by browser)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
        handleUserActivity();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setIsPlayerFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, setIsPlayerFullscreen]);

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
      const doc = document as any;
      const elem = containerRef.current as any;

      const isCurrentlyFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isCurrentlyFs) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
          setIsFullscreen(true);
          setIsPlayerFullscreen(true);
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
          setIsFullscreen(true);
          setIsPlayerFullscreen(true);
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
          setIsFullscreen(true);
          setIsPlayerFullscreen(true);
        } else {
          // Viewport fullscreen fallback
          setIsFullscreen(true);
          setIsPlayerFullscreen(true);
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setIsFullscreen(false);
        setIsPlayerFullscreen(false);
      }
    } catch (err) {
      console.warn('Native fullscreen not available or permitted, using viewport fullscreen:', err);
      setIsFullscreen((prev) => {
        const next = !prev;
        setIsPlayerFullscreen(next);
        return next;
      });
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
      className={
        isFullscreen
          ? 'fixed inset-0 z-[100] bg-black p-0 overflow-hidden select-none'
          : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs select-none'
      }
    >
      <div
        ref={containerRef}
        id="video-player-container"
        onMouseMove={handleUserActivity}
        onTouchStart={handleUserActivity}
        className={
          isFullscreen
            ? `relative w-screen h-screen max-w-none rounded-none bg-black flex flex-col justify-center items-center overflow-hidden z-[100] ${
                !isControlsVisible ? 'cursor-none' : 'cursor-default'
              }`
            : 'relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col cursor-default'
        }
      >
        {/* Top Header: ONLY Title and Close Button (Completely HIDDEN in fullscreen) */}
        {!isFullscreen && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 text-white z-10">
            <h3 className="text-xs font-semibold tracking-wide truncate pr-4">
              {activePlayerSong.title}
            </h3>
            <button
              id="close-player-btn"
              onClick={closePlayer}
              className="p-1 rounded text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Video Canvas - Fills full container in fullscreen */}
        <div
          className={
            isFullscreen
              ? 'relative w-full h-full flex-1 bg-black flex items-center justify-center overflow-hidden'
              : 'relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden'
          }
        >
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
                onClick={() => {
                  handleTogglePlay();
                  handleUserActivity();
                }}
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
              onClick={() => {
                handleTogglePlay();
                handleUserActivity();
              }}
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

        {/* Playback Controls Bar:
            In fullscreen: Overlays the bottom of the screen, auto-hiding after inactivity.
            Outside fullscreen: Static bar below the video player. */}
        <div
          onMouseEnter={() => {
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            if (isFullscreen) {
              resetControlsTimer();
            }
          }}
          className={
            isFullscreen
              ? `absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300 ${
                  isControlsVisible
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                } bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 sm:px-6 pb-3 sm:pb-6 pt-10 sm:pt-12 text-white space-y-2 sm:space-y-3`
              : 'px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-900 border-t border-stone-800 text-white space-y-2'
          }
        >
          {/* Timeline / Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-mono text-stone-300">
            <span className="w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 sm:h-2.5 bg-white/20 rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                handleSeek(Math.floor(pos * totalSeconds));
                handleUserActivity();
              }}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="w-8 sm:w-10">{formatTime(totalSeconds)}</span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left: Play/Pause & Volume */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                id="player-play-pause-btn"
                onClick={() => {
                  handleTogglePlay();
                  handleUserActivity();
                }}
                className="p-2 sm:p-1.5 rounded-md hover:bg-white/10 text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    handleUserActivity();
                  }}
                  className="p-2 sm:p-1.5 rounded-md hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
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
                    handleUserActivity();
                  }}
                  className="w-14 sm:w-20 accent-white h-1 bg-white/30 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Fullscreen Toggle */}
            <div>
              <button
                id="player-fullscreen-btn"
                onClick={toggleFullscreen}
                className="p-2 sm:p-1.5 rounded-md hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
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
