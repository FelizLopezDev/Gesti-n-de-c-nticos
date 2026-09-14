import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Music,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song } from '../../types';

export const RequestAccessModal: React.FC = () => {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    selectedSongIdsForRequest,
    toggleSongSelectionForRequest,
    clearSongSelectionForRequest,
    songs,
    submitAccessRequest,
    getUserSongAccessStatus,
  } = useApp();

  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-09-14');
  const [meetingTime, setMeetingTime] = useState('19:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  if (!isRequestModalOpen) return null;

  const selectedSongs = songs.filter((s) => selectedSongIdsForRequest.includes(s.id));

  // Eligible songs that can be added (not already selected, not currently pending, not currently available)
  const availableToAddSongs = songs.filter((s) => {
    if (selectedSongIdsForRequest.includes(s.id)) return false;
    const { status } = getUserSongAccessStatus(s.id);
    return status !== 'PENDING' && status !== 'AVAILABLE';
  });

  const predefinedPurposes = [
    'Reunión de Oración Virtual Google Meet',
    'Culto Dominical Virtual',
    'Escuela Bíblica de Niños',
    'Grupo de Discipulado y Jóvenes',
    'Reunión de Matrimonios',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSongs.length === 0) return;

    const finalPurpose = meetingPurpose.trim() || 'Reunión de Oración Virtual Google Meet';

    setIsSubmitting(true);
    setTimeout(() => {
      const fullDateTime = `${meetingDate}T${meetingTime}:00Z`;
      submitAccessRequest(
        selectedSongIdsForRequest,
        finalPurpose,
        fullDateTime,
        notes.trim()
      );
      setIsSubmitting(false);
      setSubmittedRequestId(`REQ-2026-${Math.floor(100 + Math.random() * 899)}`);
    }, 450);
  };

  const handleClose = () => {
    setIsRequestModalOpen(false);
    setSubmittedRequestId(null);
  };

  return (
    <div
      id="request-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="request-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">
              Solicitar Acceso a Canciones
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Puedes agrupar varias canciones en una sola solicitud para tu reunión de Google Meet
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {submittedRequestId ? (
          /* Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">¡Solicitud Enviada con Éxito!</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
              Tu solicitud ha sido registrada en el sistema. Los administradores recibirán la
              notificación para evaluar la duración de acceso solicitada antes de la reunión.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Reunión:</span>
                <span className="font-semibold text-stone-800">{meetingPurpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Canciones solicitadas:</span>
                <span className="font-semibold text-stone-800">{selectedSongs.length} temas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estado:</span>
                <span className="font-semibold text-amber-700">Pendiente de Aprobación</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
              >
                Entendido y volver a la biblioteca
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
            {/* Selected songs list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Canciones Seleccionadas ({selectedSongs.length})
                </label>
                {selectedSongs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSongSelectionForRequest}
                    className="text-xs text-stone-400 hover:text-stone-700"
                  >
                    Quitar todas
                  </button>
                )}
              </div>

              {selectedSongs.length === 0 ? (
                <div className="p-4 rounded-xl border-2 border-dashed border-stone-200 text-center bg-stone-50/50">
                  <Music className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700">
                    No has seleccionado ninguna canción aún
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Elige una o más de la lista desplegable abajo para añadirlas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <span className="font-bold text-stone-900 block">{song.title}</span>
                          <span className="text-stone-500 text-[11px]">
                            {song.artist} · {song.category} ({song.duration})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSongSelectionForRequest(song.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 transition-colors"
                        title="Quitar de la solicitud"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add more eligible songs fillable input */}
              {availableToAddSongs.length > 0 && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="+ Escribe o selecciona una canción para añadirla a esta solicitud..."
                    list="available-songs-datalist"
                    onChange={(e) => {
                      const val = e.target.value.trim().toLowerCase();
                      const found = availableToAddSongs.find(
                        (s) =>
                          s.title.toLowerCase() === val ||
                          `${s.title} — ${s.category}`.toLowerCase() === val ||
                          `${s.title} (${s.artist})`.toLowerCase() === val
                      );
                      if (found) {
                        toggleSongSelectionForRequest(found.id);
                        e.target.value = '';
                      }
                    }}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-dashed border-stone-300 bg-stone-50/40 text-stone-800 placeholder:text-stone-500 focus:ring-2 focus:ring-stone-900"
                  />
                  <datalist id="available-songs-datalist">
                    {availableToAddSongs.map((s) => (
                      <option key={s.id} value={`${s.title} — ${s.category}`} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            {/* Meeting Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Propósito o Servicio de Google Meet *
              </label>
              <input
                id="request-meeting-purpose-input"
                type="text"
                required
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                placeholder="Escribe el propósito (ej. Reunión de Oración, Culto Dominical, Escuela Bíblica, etc.)..."
                list="purpose-suggestions"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-800"
              />
              <datalist id="purpose-suggestions">
                {predefinedPurposes.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {/* Meeting Date & Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Fecha de la Reunión
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Hora de Inicio Estimada
                </label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-800"
                />
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Notas para los Administradores (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ej. Requerimos la pista para guiar el momento de alabanza congregacional."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400"
              />
            </div>

            {/* Actions footer */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={selectedSongs.length === 0 || isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Enviando solicitud...</span>
                ) : (
                  <span>Enviar Solicitud ({selectedSongs.length} temas)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
