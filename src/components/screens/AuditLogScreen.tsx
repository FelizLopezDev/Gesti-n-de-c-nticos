import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  FileText,
  KeyRound,
  Play,
  CheckCircle2,
  XCircle,
  Ban,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';

export const AuditLogScreen: React.FC = () => {
  const { auditLogs, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = [
    { value: 'ALL', label: 'Todas las acciones' },
    { value: 'PLAY_VIDEO', label: 'Reproducción de Video' },
    { value: 'APPROVE_REQUEST', label: 'Aprobación de Permiso' },
    { value: 'REJECT_REQUEST', label: 'Rechazo de Solicitud' },
    { value: 'REVOKE_PERMISSION', label: 'Revocación de Acceso' },
    { value: 'REQUEST_ACCESS', label: 'Solicitud de Acceso' },
    { value: 'CREATE_SONG', label: 'Canción Creada' },
    { value: 'UPDATE_SONG', label: 'Canción Modificada' },
    { value: 'DELETE_SONG', label: 'Canción Eliminada' },
    { value: 'CREATE_USER', label: 'Usuario Creado' },
    { value: 'CHANGE_ROLE', label: 'Cambio de Rol' },
    { value: 'TOGGLE_USER_STATUS', label: 'Estado de Cuenta' },
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PLAY_VIDEO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            <Play className="w-3 h-3 fill-current" />
            <span>Reproducción</span>
          </span>
        );
      case 'APPROVE_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aprobación</span>
          </span>
        );
      case 'REJECT_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>Rechazo</span>
          </span>
        );
      case 'REVOKE_PERMISSION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
            <Ban className="w-3 h-3" />
            <span>Revocación</span>
          </span>
        );
      case 'REQUEST_ACCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            <Sparkles className="w-3 h-3" />
            <span>Solicitud</span>
          </span>
        );
      case 'CREATE_SONG':
      case 'UPDATE_SONG':
      case 'DELETE_SONG':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
            <Layers className="w-3 h-3" />
            <span>Canción</span>
          </span>
        );
      case 'CREATE_USER':
      case 'CHANGE_ROLE':
      case 'TOGGLE_USER_STATUS':
      case 'RESET_PASSWORD':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
            <User className="w-3 h-3" />
            <span>Usuarios</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
            {action}
          </span>
        );
    }
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesSearch =
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [auditLogs, actionFilter, searchTerm]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Fecha,Actor,Rol,Acción,Objetivo,Detalles']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.target}","${l.details}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_ministerio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Reporte de auditoría exportado correctamente en formato CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                Superadministrador Exclusivo
              </span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-stone-700" />
              <span>Registro Cronológico de Auditoría y Seguridad</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {filteredLogs.length} eventos
              </span>
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Trazabilidad inmutable de todas las operaciones realizadas en el sistema: reproducciones
              en salas de Google Meet, autorizaciones, denegaciones, altas de canciones y cambios de
              privilegios.
            </p>
          </div>

          <button
            id="export-audit-log-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Exportar Registro (CSV)</span>
          </button>
        </div>

        {/* Filter and Search */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por actor, destinatario, título o detalle de evento..."
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-700"
            >
              {actionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Chronological Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Tipo de Evento</th>
                <th className="py-3.5 px-4">Objetivo / Recurso</th>
                <th className="py-3.5 px-4">Detalles Registrados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedDate = dateObj.toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-stone-800 font-medium">{formattedTime}</div>
                      <div className="text-[10px] text-stone-400">{formattedDate}</div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{log.actorName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        Rol: {log.actorRole}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>

                    {/* Target */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-800 block truncate max-w-xs">
                        {log.target}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-stone-600 text-[11px] leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
