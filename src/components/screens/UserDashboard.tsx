import React from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  Video,
  FileText,
  KeyRound,
  Shield,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccessStatusBadge, RoleBadge } from '../common/Badge';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    permissions,
    requests,
    songs,
    setCurrentScreen,
    openPlayer,
    openSongDetail,
  } = useApp();

  if (!currentUser) return null;

  // Filter current user's active permissions
  const now = new Date().toISOString();
  const myActivePermissions = permissions.filter(
    (p) => p.userId === currentUser.id && p.status === 'ACTIVE' && p.expiresAt > now
  );

  // Expiring soon: within 12 hours
  const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  const myExpiringSoonPermissions = myActivePermissions.filter(
    (p) => p.expiresAt <= twelveHoursFromNow
  );

  // My pending requests
  const myPendingRequests = requests.filter(
    (r) => r.userId === currentUser.id && r.overallStatus === 'PENDING'
  );

  // Calculate pending requested songs count
  const myPendingSongsCount = myPendingRequests.reduce((acc, req) => {
    return acc + req.items.filter((i) => i.status === 'PENDING').length;
  }, 0);

  // Recent activity entries for this user
  const recentUserActivity = [
    ...myActivePermissions.map((p) => ({
      id: p.id,
      type: 'GRANTED' as const,
      title: p.songTitle,
      time: p.grantedAt,
      detail: `Permiso concedido por ${p.grantedBy}. Válido hasta ${new Date(
        p.expiresAt
      ).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
    })),
    ...requests
      .filter((r) => r.userId === currentUser.id)
      .map((r) => ({
        id: r.id,
        type: 'REQUEST' as const,
        title: `Solicitud ${r.id} (${r.items.length} canciones)`,
        time: r.requestDate,
        detail: `Propósito: ${r.meetingPurpose} - Estado: ${
          r.overallStatus === 'PENDING' ? 'En revisión' : 'Procesada'
        }`,
      })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Role Notice */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Panel de Colaborador
              </span>
              <RoleBadge role={currentUser.role} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Bienvenido, {currentUser.displayName.split(' ')[0]}
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Gestiona tus accesos temporales para reproducir canciones y pistas de alabanza
              durante las reuniones virtuales de Google Meet.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Active Permissions Card */}
        <div
          id="summary-active-permissions"
          onClick={() => setCurrentScreen('my-permissions')}
          className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Accesos Activos
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{myActivePermissions.length}</span>
            <span className="text-xs text-stone-500 font-medium">videos habilitados</span>
          </div>
          <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <span>Listos para reproducir en Meet</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Pending Requests Card */}
        <div
          id="summary-pending-requests"
          onClick={() => setCurrentScreen('my-requests')}
          className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Solicitudes Pendientes
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">{myPendingSongsCount}</span>
            <span className="text-xs text-stone-500 font-medium">
              en {myPendingRequests.length} solicitud(es)
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-700 flex items-center gap-1 font-medium">
            <span>En revisión por la administración</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* Expiring Soon Card */}
        <div
          id="summary-expiring-soon"
          className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Próximos a Expirar
            </span>
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">
              {myExpiringSoonPermissions.length}
            </span>
            <span className="text-xs text-stone-500 font-medium">en menos de 12 horas</span>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {myExpiringSoonPermissions.length > 0
              ? 'Planifica tus reuniones antes del término'
              : 'Sin vencimientos críticos inmediatos'}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Acciones Rápidas:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="quick-action-explore"
            onClick={() => setCurrentScreen('library')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Video className="w-4 h-4" />
            <span>Explorar biblioteca completa ({songs.length})</span>
          </button>
          <button
            id="quick-action-requests"
            onClick={() => setCurrentScreen('my-requests')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Ver mis solicitudes</span>
          </button>
          <button
            id="quick-action-permissions"
            onClick={() => setCurrentScreen('my-permissions')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>Mis permisos activos</span>
          </button>
        </div>
      </div>

      {/* Active Videos Section (Ready to Play) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Mis Canciones con Reproducción Habilitada</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Material con autorización vigente para transmitir en pantalla compartida de Meet
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('library')}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
          >
            <span>Ver todas las canciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myActivePermissions.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-stone-200 rounded-xl">
            <Video className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">No tienes permisos activos en este momento</p>
            <button
              onClick={() => setCurrentScreen('library')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800"
            >
              <span>Solicitar canciones en la biblioteca</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myActivePermissions.map((perm) => {
              const song = songs.find((s) => s.id === perm.songId);
              if (!song) return null;

              const expiryDate = new Date(perm.expiresAt);
              const expiryTimeStr = expiryDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={perm.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-200/80 text-stone-700">
                        {song.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Hasta hoy {expiryTimeStr}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{song.artist}</p>

                    <div className="mt-3 text-[11px] text-stone-600 space-y-1 bg-white p-2.5 rounded-lg border border-stone-200/60">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Duración:</span>
                        <span className="font-medium font-mono">{song.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Concedido por:</span>
                        <span className="font-medium">{perm.grantedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openSongDetail(song)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium"
                    >
                      Detalles
                    </button>
                    <button
                      id={`dashboard-play-${song.id}`}
                      onClick={() => openPlayer(song)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Reproducir Video</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 tracking-tight mb-4">
          Actividad Reciente en tu Cuenta
        </h2>
        <div className="space-y-3">
          {recentUserActivity.length === 0 ? (
            <p className="text-xs text-stone-500 py-3">No hay registros de actividad reciente.</p>
          ) : (
            recentUserActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between p-3 rounded-lg border border-stone-100 bg-stone-50/40 text-xs gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-stone-200 flex items-center justify-center shrink-0 mt-0.5 text-stone-600">
                    {act.type === 'GRANTED' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 block">{act.title}</span>
                    <span className="text-stone-600 leading-relaxed">{act.detail}</span>
                  </div>
                </div>
                <span className="text-[11px] text-stone-400 font-mono shrink-0 whitespace-nowrap">
                  {new Date(act.time).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
