import React from 'react';
import {
  Play,
  ArrowRight,
  Plus,
  Users,
  Clock,
  Shield,
  History,
  CheckCircle2,
  FileText,
  AlertCircle,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequestStatusBadge, RoleBadge } from '../common/Badge';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    permissions,
    requests,
    songs,
    users,
    auditLogs,
    setCurrentScreen,
    openPlayer,
    openApprovalModal,
  } = useApp();

  if (!currentUser) return null;

  const now = new Date().toISOString();

  // Active permissions for current user
  const myActivePermissions = permissions.filter(
    (p) => p.userId === currentUser.id && p.status === 'ACTIVE' && p.expiresAt > now
  );

  // All pending requests across the system
  const allPendingRequests = requests.filter((r) => r.overallStatus === 'PENDING');

  // Active permissions across the system
  const allActivePermissions = permissions.filter((p) => p.status === 'ACTIVE' && p.expiresAt > now);

  // My requests (for User)
  const myRequests = requests.filter((r) => r.userId === currentUser.id);
  const myPendingRequests = myRequests.filter((r) => r.overallStatus === 'PENDING');
  const myRecentActivity = myRequests.filter((r) => r.overallStatus !== 'PENDING');

  // ---------------------------------------------------------------------------
  // 1. SUPERADMIN DASHBOARD
  // Focus: System overview, Pending requests, User/account activity, Recent admin audit actions
  // ---------------------------------------------------------------------------
  if (currentUser.role === 'SUPERADMIN') {
    const disabledUsers = users.filter((u) => u.status === 'DISABLED');
    const recentAudit = auditLogs.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
              Panel de Control General
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Supervisión de solicitudes de usuarios, catálogo, cuentas del sistema y auditoría.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('admin-songs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Subir video MP4</span>
            </button>
          </div>
        </div>

        {/* System Overview Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => setCurrentScreen('admin-requests')}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs cursor-pointer hover:border-stone-400 transition-colors"
          >
            <span className="text-xs font-medium text-stone-500 block">Solicitudes Pendientes</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {allPendingRequests.length}
            </span>
          </div>

          <div
            onClick={() => setCurrentScreen('admin-permissions')}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs cursor-pointer hover:border-stone-400 transition-colors"
          >
            <span className="text-xs font-medium text-stone-500 block">Permisos Activos</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">
              {allActivePermissions.length}
            </span>
          </div>

          <div
            onClick={() => setCurrentScreen('admin-songs')}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs cursor-pointer hover:border-stone-400 transition-colors"
          >
            <span className="text-xs font-medium text-stone-500 block">Canciones Registradas</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">{songs.length}</span>
          </div>

          <div
            onClick={() => setCurrentScreen('admin-users')}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs cursor-pointer hover:border-stone-400 transition-colors"
          >
            <span className="text-xs font-medium text-stone-500 block">Usuarios Registrados</span>
            <span className="text-2xl font-bold text-stone-900 mt-1 block">{users.length}</span>
          </div>
        </div>

        {/* 1. Pending Requests Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-900">
                Solicitudes de Acceso Pendientes
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {allPendingRequests.length}
              </span>
            </div>
            <button
              onClick={() => setCurrentScreen('admin-requests')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allPendingRequests.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No hay solicitudes pendientes en el sistema.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {allPendingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{req.userName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-600">{req.meetingPurpose}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {req.items.length} canción(es): {req.items.map((i) => i.songTitle).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.items.filter((i) => i.status === 'PENDING').slice(0, 1).map((item) => (
                      <button
                        key={item.songId}
                        onClick={() =>
                          openApprovalModal({
                            requestId: req.id,
                            songId: item.songId,
                            songTitle: item.songTitle,
                            userId: req.userId,
                            userName: req.userName,
                            userEmail: req.userEmail,
                          })
                        }
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                      >
                        Revisar y Aprobar
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentScreen('admin-requests')}
                      className="px-2.5 py-1 rounded-md text-xs text-stone-600 hover:text-stone-900 border border-stone-200"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. User/Account Activity & Recent Administrative Audit side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* User / Account Status */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Gestión de Cuentas de Usuario
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {users.length} usuarios registrados ({disabledUsers.length} inactivos)
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('admin-users')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Administrar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {users.slice(0, 4).map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900 block">{u.displayName}</span>
                    <span className="text-[11px] text-stone-500">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} />
                    {u.status === 'DISABLED' && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded">
                        Deshabilitado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Administrative Audit Actions */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Acciones Administrativas Recientes
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Registro de auditoría del sistema
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('admin-audit')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Ver historial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {recentAudit.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-medium text-stone-900 block">{log.actionLabel}</span>
                    <span className="text-[11px] text-stone-500">
                      Por {log.actorName} · {log.resourceName}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ADMIN DASHBOARD
  // Focus: Pending access requests, Recently managed songs, Active permissions requiring attention
  // ---------------------------------------------------------------------------
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Gestión de solicitudes de acceso, catálogo de canciones y permisos activos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('admin-songs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Subir video MP4</span>
            </button>
          </div>
        </div>

        {/* 1. Pending Requests Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-900">
                Solicitudes de Acceso Pendientes
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {allPendingRequests.length}
              </span>
            </div>
            <button
              onClick={() => setCurrentScreen('admin-requests')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allPendingRequests.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No hay solicitudes pendientes de aprobación.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {allPendingRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">{req.userName}</span>
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-600">{req.meetingPurpose}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {req.items.length} canción(es): {req.items.map((i) => i.songTitle).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.items.filter((i) => i.status === 'PENDING').slice(0, 1).map((item) => (
                      <button
                        key={item.songId}
                        onClick={() =>
                          openApprovalModal({
                            requestId: req.id,
                            songId: item.songId,
                            songTitle: item.songTitle,
                            userId: req.userId,
                            userName: req.userName,
                            userEmail: req.userEmail,
                          })
                        }
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                      >
                        Revisar y Aprobar
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentScreen('admin-requests')}
                      className="px-2.5 py-1 rounded-md text-xs text-stone-600 hover:text-stone-900 border border-stone-200"
                    >
                      Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Recently Managed Songs & Active Permissions side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Songs Overview */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Canciones en la Biblioteca
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {songs.length} canciones registradas
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('admin-songs')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Administrar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {songs.slice(0, 5).map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-stone-800 truncate mr-2">{s.title}</span>
                  <button
                    onClick={() => openPlayer(s)}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    Reproducir
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Permissions Overview */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Permisos Activos
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {allActivePermissions.length} accesos vigentes actualmente
                </p>
              </div>
              <button
                onClick={() => setCurrentScreen('admin-permissions')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {allActivePermissions.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No hay permisos vigentes en este momento.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {allActivePermissions.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-stone-900 block">{p.songTitle}</span>
                      <span className="text-[11px] text-stone-500">{p.userName}</span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Hasta {new Date(p.expiresAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. USER DASHBOARD
  // Focus: Songs available to play, Pending personal requests, Recent personal activity
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Inicio
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Canciones habilitadas para reproducir y estado de tus solicitudes.
          </p>
        </div>
        <button
          onClick={() => setCurrentScreen('library')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors self-start sm:self-auto"
        >
          <span>Ir a la biblioteca</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. Songs Available to Play */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-900">
            Canciones Disponibles para Reproducir ({myActivePermissions.length})
          </h2>
          {myActivePermissions.length > 0 && (
            <button
              onClick={() => setCurrentScreen('my-permissions')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Ver vigencias
            </button>
          )}
        </div>

        {myActivePermissions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-stone-600 font-medium">
              No tienes canciones habilitadas en este momento.
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              Puedes solicitar acceso a las canciones necesarias desde la biblioteca.
            </p>
            <button
              onClick={() => setCurrentScreen('library')}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {myActivePermissions.map((perm) => {
              const song = songs.find((s) => s.id === perm.songId);
              if (!song) return null;
              return (
                <div
                  key={perm.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-semibold text-stone-900 block text-sm">{song.title}</span>
                    <span className="text-[11px] text-stone-500">
                      Permiso vigente hasta {new Date(perm.expiresAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    id={`user-dashboard-play-${song.id}`}
                    onClick={() => openPlayer(song)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-2xs shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reproducir</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Pending Personal Requests & Recent Personal Activity side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pending Personal Requests */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">
              Mis Solicitudes Pendientes ({myPendingRequests.length})
            </h2>
            <button
              onClick={() => setCurrentScreen('my-requests')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myPendingRequests.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No tienes solicitudes pendientes de aprobación.
            </p>
          ) : (
            <div className="divide-y divide-stone-100 text-xs">
              {myPendingRequests.map((req) => (
                <div key={req.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-stone-900 block">{req.meetingPurpose}</span>
                    <span className="text-[11px] text-stone-500">
                      {req.items.length} canción(es): {req.items.map((i) => i.songTitle).join(', ')}
                    </span>
                  </div>
                  <RequestStatusBadge status={req.overallStatus} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Personal Activity */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">
              Actividad Reciente
            </h2>
            <button
              onClick={() => setCurrentScreen('my-requests')}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>Historial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myRecentActivity.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              No hay actividad reciente registrada.
            </p>
          ) : (
            <div className="divide-y divide-stone-100 text-xs">
              {myRecentActivity.slice(0, 5).map((req) => (
                <div key={req.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-stone-900 block">{req.meetingPurpose}</span>
                    <span className="text-[11px] text-stone-500">
                      {req.items.map((i) => i.songTitle).join(', ')}
                    </span>
                  </div>
                  <RequestStatusBadge status={req.overallStatus} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
