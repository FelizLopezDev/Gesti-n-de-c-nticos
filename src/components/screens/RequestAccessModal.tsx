import React, { useState } from 'react';
import {
  X,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RequestAccessModal: React.FC = () => {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    selectedSongIdsForRequest,
    toggleSongSelectionForRequest,
    songs,
    submitAccessRequest,
    getUserSongAccessStatus,
  } = useApp();

  const [purpose, setPurpose] = useState('');
  const [dateNeeded, setDateNeeded] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isRequestModalOpen) return null;

  const selectedSongs = songs.filter((s) => selectedSongIdsForRequest.includes(s.id));

  // Eligible songs that can be added
  const availableToAddSongs = songs.filter((s) => {
    if (selectedSongIdsForRequest.includes(s.id)) return false;
    const { status } = getUserSongAccessStatus(s.id);
    return status !== 'PENDING' && status !== 'AVAILABLE';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSongs.length === 0 || !purpose.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitAccessRequest(
        selectedSongIdsForRequest,
        purpose.trim(),
        `${dateNeeded}T19:00:00Z`,
        ''
      );
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 300);
  };

  const handleClose = () => {
    setIsRequestModalOpen(false);
    setIsSubmitted(false);
    setPurpose('');
  };

  return (
    <div
      id="request-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="request-modal-container"
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200">
          <h3 className="text-sm font-semibold text-stone-900">
            Solicitar Acceso a Canciones
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          /* Clean Success State */
          <div className="p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-stone-900">Solicitud enviada</h4>
              <p className="text-xs text-stone-500 mt-1">
                La solicitud ha sido registrada y está pendiente de revisión.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Selected songs */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Canciones seleccionadas ({selectedSongs.length})
              </label>
              {selectedSongs.length === 0 ? (
                <p className="text-stone-500 italic py-2">
                  No hay canciones seleccionadas. Elige una abajo.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 border border-stone-200"
                    >
                      <span className="font-medium text-stone-900 truncate">{song.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleSongSelectionForRequest(song.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Quitar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add another song option */}
              {availableToAddSongs.length > 0 && (
                <div className="mt-2">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleSongSelectionForRequest(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="">+ Añadir otra canción...</option>
                    {availableToAddSongs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 1. Purpose (Required) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Propósito *
              </label>
              <input
                id="request-purpose-input"
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ej. Reunión dominical, servicio de oración..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-xs text-stone-900"
              />
            </div>

            {/* 2. Date Needed (Required) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Fecha requerida *
              </label>
              <input
                id="request-date-input"
                type="date"
                required
                value={dateNeeded}
                onChange={(e) => setDateNeeded(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-xs text-stone-900"
              />
            </div>

            {/* Actions footer */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={selectedSongs.length === 0 || !purpose.trim() || isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
