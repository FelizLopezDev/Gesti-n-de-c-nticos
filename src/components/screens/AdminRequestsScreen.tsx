import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Sparkles,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequestStatusBadge } from '../common/Badge';
import { AccessRequest, RequestStatus } from '../../types';

interface AdminRequestsScreenProps {
  isUserViewOnly?: boolean; // When rendered under 'my-requests' for regular user
}

export const AdminRequestsScreen: React.FC<AdminRequestsScreenProps> = ({ isUserViewOnly = false }) => {
  const {
    requests,
    currentUser,
    openApprovalModal,
    rejectSongAccess,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>(isUserViewOnly ? 'PENDING' : 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingSong, setRejectingSong] = useState<{
    requestId: string;
    songId: string;
    songTitle: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('No corresponde al orden del servicio de hoy');

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        // If user view, only show their own
        if (isUserViewOnly && currentUser) {
          if (req.userId !== currentUser.id) return false;
        }

        // Status filter
        if (statusFilter !== 'ALL' && req.overallStatus !== statusFilter) {
          return false;
        }

        // Search filter (requester name, meeting purpose, or song titles - no request code)
        const matchesSearch =
          req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.meetingPurpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.items.some((i) => i.songTitle.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesSearch;
      })
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [requests, isUserViewOnly, currentUser, statusFilter, searchTerm]);

  const handleOpenApproval = (req: AccessRequest, songId: string, songTitle: string) => {
    openApprovalModal({
      requestId: req.id,
      songId,
      songTitle,
      userId: req.userId,
      userName: req.userName,
      userEmail: req.userEmail,
    });
  };

  const handleConfirmReject = () => {
    if (!rejectingSong) return;
    rejectSongAccess(rejectingSong.requestId, rejectingSong.songId, rejectionReason);
    setRejectingSong(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            {isUserViewOnly ? 'Mis Solicitudes' : 'Solicitudes de Acceso'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {filteredRequests.length} solicitudes registradas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status tabs */}
          <div className="flex items-center gap-1">
            {!isUserViewOnly && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                Todas
              </button>
            )}
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'APPROVED'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'REJECTED'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              Rechazadas
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9.5 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No hay solicitudes registradas</h3>
          <p className="text-xs text-stone-500 mt-1">
            No hay registros que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              id={`request-card-${req.id}`}
              className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden"
            >
              {/* Request Header Banner */}
              <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {!isUserViewOnly ? (
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span className="font-semibold text-stone-900">{req.userName}</span>
                      <span className="text-stone-400">({req.userEmail})</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-stone-900 text-sm">
                      {req.meetingPurpose}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-stone-500 text-[11px]">
                    Fecha: {new Date(req.requestDate).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <RequestStatusBadge status={req.overallStatus} />
                </div>
              </div>

              {/* Request Details Info */}
              <div className="p-4 border-b border-stone-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {!isUserViewOnly ? (
                  <div>
                    <span className="text-stone-500 block text-[11px]">Propósito / Servicio:</span>
                    <span className="font-semibold text-stone-800">{req.meetingPurpose}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-stone-500 block text-[11px]">Fecha requerida:</span>
                    <span className="font-semibold text-stone-800">
                      {new Date(req.meetingDate).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {req.notes && (
                  <div>
                    <span className="text-stone-500 block text-[11px]">Notas del solicitante:</span>
                    <span className="text-stone-600 italic">"{req.notes}"</span>
                  </div>
                )}
              </div>

              {/* Individual Songs in Request (Each independently approvable/rejectable) */}
              <div className="p-4 bg-white">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Canciones solicitadas ({req.items.length})
                </div>

                <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                  {req.items.map((item) => (
                    <div
                      key={item.songId}
                      className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-600 text-xs shrink-0">
                          ♪
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{item.songTitle}</div>
                          {item.status === 'APPROVED' && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Aprobada por {item.reviewedBy} (Vigencia: {item.grantedDuration})
                            </span>
                          )}
                          {item.status === 'REJECTED' && (
                            <span className="text-[11px] text-rose-700">
                              Rechazada: {item.rejectionReason}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Song Status and Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <RequestStatusBadge status={item.status} />

                        {/* Admin Action Buttons (only shown if not in user-only view and status is PENDING) */}
                        {!isUserViewOnly && currentUser?.role !== 'USER' && item.status === 'PENDING' && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <button
                              id={`approve-song-btn-${item.songId}`}
                              onClick={() => handleOpenApproval(req, item.songId, item.songTitle)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>

                            <button
                              id={`reject-song-btn-${item.songId}`}
                              onClick={() =>
                                setRejectingSong({
                                  requestId: req.id,
                                  songId: item.songId,
                                  songTitle: item.songTitle,
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {rejectingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Rechazar Solicitud de Alabanza</span>
            </h3>
            <p className="text-xs text-stone-600">
              Vas a denegar el acceso a <strong>"{rejectingSong.songTitle}"</strong>. Por favor indica
              el motivo para registro en auditoría:
            </p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50"
            >
              <option value="No corresponde al orden del servicio de hoy">
                No corresponde al orden del servicio de hoy
              </option>
              <option value="Reservado para servicio de Santa Cena">
                Reservado para servicio de Santa Cena
              </option>
              <option value="Requiere autorización pastoral especial">
                Requiere autorización pastoral especial
              </option>
              <option value="Material en revisión por el ministerio de música">
                Material en revisión por el ministerio de música
              </option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingSong(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
