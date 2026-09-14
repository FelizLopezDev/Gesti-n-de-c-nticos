import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Filter,
  Ban,
  Clock,
  User,
  Shield,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PermissionStatusBadge } from '../common/Badge';
import { Permission } from '../../types';

interface PermissionsScreenProps {
  isUserViewOnly?: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ isUserViewOnly = false }) => {
  const { permissions, currentUser, revokePermission, songs, openPlayer } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [revokingPerm, setRevokingPerm] = useState<Permission | null>(null);
  const [revocationReason, setRevocationReason] = useState('Reunión virtual concluida');

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return permissions
      .filter((p) => {
        if (isUserViewOnly && currentUser) {
          if (p.userId !== currentUser.id) return false;
        }

        if (statusFilter !== 'ALL' && p.status !== statusFilter) {
          return false;
        }

        const matchesSearch =
          p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.songTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.grantedBy.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime());
  }, [permissions, isUserViewOnly, currentUser, statusFilter, searchTerm]);

  const handleConfirmRevoke = () => {
    if (!revokingPerm) return;
    revokePermission(revokingPerm.id, revocationReason);
    setRevokingPerm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <KeyRound className="w-6 h-6 text-stone-700" />
              <span>{isUserViewOnly ? 'Mis Permisos de Reproducción' : 'Control y Registro de Permisos'}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {filteredPermissions.length} registros
              </span>
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {isUserViewOnly
                ? 'Listado de tus autorizaciones activas, vencidas o revocadas para reuniones en Google Meet.'
                : 'Auditoría clara de accesos: Permite responder exactamente quién otorgó acceso a cada colaborador y hasta qué hora.'}
            </p>
          </div>

          {/* Quick Filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'EXPIRED'
                  ? 'bg-stone-700 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Expirados
            </button>
            <button
              onClick={() => setStatusFilter('REVOKED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'REVOKED'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Revocados
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, canción o administrador que otorgó..."
            className="w-full pl-9.5 pr-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* Permissions Management Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Canción Autorizada</th>
                <th className="py-3.5 px-4">Concedido por</th>
                <th className="py-3.5 px-4">Inicio</th>
                <th className="py-3.5 px-4">Expira</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-500">
                    No se encontraron permisos registrados con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((perm) => {
                  const song = songs.find((s) => s.id === perm.songId);
                  const isCurrentlyActive = perm.status === 'ACTIVE';

                  return (
                    <tr
                      key={perm.id}
                      id={`perm-row-${perm.id}`}
                      className="hover:bg-stone-50/80 transition-colors"
                    >
                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{perm.userName}</div>
                        <div className="text-[11px] text-stone-500">{perm.userEmail}</div>
                      </td>

                      {/* Song */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{perm.songTitle}</span>
                        </div>
                        {song && (
                          <span className="text-[11px] text-stone-500">
                            {song.category} · {song.duration}
                          </span>
                        )}
                      </td>

                      {/* Granted By */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                          <Shield className="w-3 h-3 text-stone-500" />
                          <span>{perm.grantedBy}</span>
                        </span>
                      </td>

                      {/* Starts At */}
                      <td className="py-3.5 px-4 font-mono text-stone-600">
                        {new Date(perm.startsAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(perm.startsAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Expires At */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-stone-900">
                          {new Date(perm.expiresAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {new Date(perm.expiresAt).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <PermissionStatusBadge status={perm.status} />
                        {perm.revocationReason && (
                          <div className="text-[10px] text-rose-600 italic mt-0.5">
                            Motivo: {perm.revocationReason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Play button if current user and active */}
                          {isCurrentlyActive && song && (
                            <button
                              id={`perm-play-btn-${perm.id}`}
                              onClick={() => openPlayer(song)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Reproducir</span>
                            </button>
                          )}

                          {/* Revoke button for Admin/Superadmin on active permissions */}
                          {currentUser?.role !== 'USER' && isCurrentlyActive && (
                            <button
                              id={`perm-revoke-btn-${perm.id}`}
                              onClick={() => setRevokingPerm(perm)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Revocar acceso inmediatamente"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Revocar acceso</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Dialog */}
      {revokingPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Confirmar Revocación Inmediata</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ¿Estás seguro de que deseas revocar el acceso de{' '}
              <strong className="text-stone-900">{revokingPerm.userName}</strong> a la canción{' '}
              <strong className="text-stone-900">"{revokingPerm.songTitle}"</strong>?
              El reproductor se deshabilitará al instante.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Motivo de la revocación:
              </label>
              <select
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50"
              >
                <option value="Reunión virtual concluida">Reunión virtual concluida</option>
                <option value="Cambio de orden en la reunión de Google Meet">
                  Cambio de orden en la reunión de Google Meet
                </option>
                <option value="Solicitud cancelada por el usuario">
                  Solicitud cancelada por el usuario
                </option>
                <option value="Cancelación de servicio dominical">
                  Cancelación de servicio dominical
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokingPerm(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                id="confirm-revoke-btn"
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
              >
                Revocar Acceso Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
