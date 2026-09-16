import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PermissionApprovalModal: React.FC = () => {
  const { approvalTarget, closeApprovalModal, approveSongAccess } = useApp();

  const [selectedDurationOption, setSelectedDurationOption] = useState<string>('4h');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-14T16:00');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-14T20:00');

  // Predefined options
  const durationOptions = [
    { id: '1h', label: '1 hora', hours: 1 },
    { id: '2h', label: '2 horas', hours: 2 },
    { id: '4h', label: '4 horas', hours: 4 },
    { id: '8h', label: '8 horas', hours: 8 },
    { id: '24h', label: '24 horas', hours: 24 },
    { id: 'custom', label: 'Personalizado', hours: 0 },
  ];

  // Calculate start and end ISO strings based on selection
  const calculatedTimes = useMemo(() => {
    const now = new Date();
    if (selectedDurationOption === 'custom') {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return {
        startsAt: start.toISOString(),
        expiresAt: end.toISOString(),
        durationLabel: 'Personalizado',
        formattedStart: start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        formattedEnd: end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const opt = durationOptions.find((o) => o.id === selectedDurationOption) || durationOptions[2];
    const startsAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + opt.hours * 60 * 60 * 1000).toISOString();

    return {
      startsAt,
      expiresAt,
      durationLabel: opt.label,
      formattedStart: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      formattedEnd: new Date(expiresAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }, [selectedDurationOption, customStartDate, customEndDate]);

  if (!approvalTarget) return null;

  const handleConfirm = () => {
    approveSongAccess(
      approvalTarget.requestId,
      approvalTarget.songId,
      calculatedTimes.durationLabel,
      calculatedTimes.startsAt,
      calculatedTimes.expiresAt
    );
  };

  return (
    <div
      id="approval-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeApprovalModal();
      }}
    >
      <div
        id="approval-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-stone-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-50 z-10 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Aprobar Permiso de Reproducción</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Define la vigencia temporal del acceso para Google Meet
            </p>
          </div>
          <button
            onClick={closeApprovalModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Target song and user summary */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">Usuario solicitante:</span>
              <span className="font-semibold text-stone-900">{approvalTarget.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Canción:</span>
              <span className="font-semibold text-stone-900">{approvalTarget.songTitle}</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Duración del Acceso
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  id={`duration-opt-${opt.id}`}
                  onClick={() => setSelectedDurationOption(opt.id)}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                    selectedDurationOption === opt.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date & Time Picker */}
          {selectedDurationOption === 'custom' && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
              <span className="font-semibold text-stone-800 block">
                Horario Personalizado de Vigencia
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">Inicio de acceso:</label>
                  <input
                    type="datetime-local"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">Expiración:</label>
                  <input
                    type="datetime-local"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-md text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Human-Readable Confirmation Summary */}
          <div
            id="approval-dynamic-summary"
            className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Resumen de Vigencia a Otorgar:</span>
            </div>
            <p className="leading-relaxed font-medium text-xs sm:text-[13px]">
              "{approvalTarget.userName} tendrá acceso a '{approvalTarget.songTitle}' desde hoy{' '}
              {calculatedTimes.formattedStart} hasta hoy {calculatedTimes.formattedEnd}."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-50 border-t border-stone-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={closeApprovalModal}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 text-center cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="confirm-approval-btn"
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer text-center"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar y Otorgar Permiso</span>
          </button>
        </div>
      </div>
    </div>
  );
};
