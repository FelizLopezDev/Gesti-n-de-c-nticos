import React from 'react';
import {
  X,
  Play,
  Lock,
  Clock,
  Shield,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  FileText,
  Music,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccessStatusBadge } from '../common/Badge';
import { Song } from '../../types';

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
}

export const SongDetailScreen: React.FC<SongDetailModalProps> = ({ song, onClose }) => {
  const {
    getUserSongAccessStatus,
    openPlayer,
    toggleSongSelectionForRequest,
    setIsRequestModalOpen,
  } = useApp();

  if (!song) return null;

  const { status, permission } = getUserSongAccessStatus(song.id);
  const hasActivePermission = status === 'AVAILABLE' && !!permission;

  const expiryDate = permission ? new Date(permission.expiresAt) : null;
  const expiryTimeStr = expiryDate
    ? expiryDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      id="song-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="song-detail-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header Preview Banner */}
        <div className="bg-stone-900 p-6 flex flex-col justify-between text-white relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-stone-800">
              Video MP4
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-xs">
              {song.title}
            </h2>
            {song.videoFileName && (
              <p className="text-xs text-stone-400 mt-1 font-mono">{song.videoFileName}</p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* STATE A: ACTIVE PERMISSION */}
          {hasActivePermission ? (
            <div
              id="song-detail-state-a"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-sm text-emerald-950">
                    Permiso de Reproducción Activo
                  </span>
                </div>
                <AccessStatusBadge status="AVAILABLE" />
              </div>

              {/* Expiration requirement notice */}
              <div className="text-xs bg-white p-3 rounded-lg border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-sm">
                    Acceso disponible hasta: Hoy, {expiryTimeStr}
                  </span>
                </div>
                <span className="text-stone-500 text-[11px]">
                  Autorizado por: <strong>{permission.grantedBy}</strong>
                </span>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  id="modal-play-now-btn"
                  onClick={() => {
                    onClose();
                    openPlayer(song);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Abrir Reproductor para Google Meet</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: NO PERMISSION / PENDING / EXPIRED / REVOKED */
            <div
              id="song-detail-state-b"
              className="p-5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-stone-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900">
                      No tienes permiso para reproducir este video
                    </h4>
                    <AccessStatusBadge status={status} />
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Los archivos MP4 de la congregación están protegidos contra reproducciones no
                    autorizadas. Para compartir esta pista en la sala virtual de Google Meet, debes
                    enviar una solicitud previa indicando la fecha y propósito del servicio.
                  </p>
                </div>
              </div>

              {/* Action according to specific status */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                {status === 'PENDING' ? (
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 w-full">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Solicitud en revisión por los administradores.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-stone-500">
                      ¿Requieres este tema para tu reunión?
                    </span>
                    <button
                      id="modal-request-access-btn"
                      onClick={() => {
                        onClose();
                        toggleSongSelectionForRequest(song.id);
                        setIsRequestModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{status === 'EXPIRED' ? 'Solicitar nuevamente' : 'Solicitar acceso'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Song Technical Metadata */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Información del Video
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Duración</span>
                <span className="font-semibold font-mono text-stone-900">{song.duration || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Formato</span>
                <span className="font-semibold text-stone-900">{song.mimeType || 'video/mp4'}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 col-span-2 sm:col-span-1">
                <span className="text-stone-500 block text-[11px]">Tamaño</span>
                <span className="font-semibold font-mono text-stone-900">
                  {song.fileSizeBytes ? `${(song.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '—'}
                </span>
              </div>
            </div>
            {song.videoFileName && (
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span>Archivo MP4: <strong className="font-mono text-stone-800">{song.videoFileName}</strong></span>
              </div>
            )}
          </div>

          {/* Security & Private Storage Badge */}
          <div className="p-3 rounded-lg bg-stone-100/70 border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-stone-500 shrink-0" />
            <span>
              Archivo de video MP4 alojado de forma privada. Por seguridad y derechos ministeriales,
              no se proveen enlaces de descarga directa ni URLs de almacenamiento técnico.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
