import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song, AccessStatus } from '../../types';

export const LibraryScreen: React.FC = () => {
  const {
    songs,
    getUserSongAccessStatus,
    openPlayer,
    selectedSongIdsForRequest,
    toggleSongSelectionForRequest,
    setIsRequestModalOpen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filter songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
      const { status } = getUserSongAccessStatus(song.id);
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'AVAILABLE' && status === 'AVAILABLE') ||
        (filterStatus === 'PENDING' && status === 'PENDING');

      return matchesSearch && matchesStatus;
    });
  }, [songs, searchTerm, filterStatus, getUserSongAccessStatus]);

  const handleRequestSingleSong = (songId: string) => {
    if (!selectedSongIdsForRequest.includes(songId)) {
      toggleSongSelectionForRequest(songId);
    }
    setIsRequestModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Biblioteca de Canciones
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {songs.length} canciones disponibles en el catálogo.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="library-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de canción..."
            className="w-full pl-9.5 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Filter Tabs: Horizontal scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-stone-900 text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterStatus('AVAILABLE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            filterStatus === 'AVAILABLE'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            filterStatus === 'PENDING'
              ? 'bg-amber-600 text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          En revisión
        </button>
      </div>

      {/* Songs List: Song Name + Availability + Action */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredSongs.length === 0 ? (
          <div className="p-10 text-center text-xs text-stone-500">
            No se encontraron canciones que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredSongs.map((song) => {
              const { status } = getUserSongAccessStatus(song.id);
              const isAvailable = status === 'AVAILABLE';
              const isPending = status === 'PENDING';
              const isSelected = selectedSongIdsForRequest.includes(song.id);

              return (
                <div
                  key={song.id}
                  id={`song-row-${song.id}`}
                  className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  {/* Song Name & Selection */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {!isAvailable && !isPending && (
                      <button
                        type="button"
                        onClick={() => toggleSongSelectionForRequest(song.id)}
                        className={`w-4 h-4 mt-0.5 sm:mt-0 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 border-stone-900 text-white'
                            : 'border-stone-300 hover:border-stone-500 bg-white'
                        }`}
                        title="Seleccionar para solicitar"
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-stone-900 break-words line-clamp-2 sm:truncate">
                        {song.title}
                      </h3>
                      {song.videoFileName && (
                        <span className="text-[11px] text-stone-500 block truncate">
                          {song.videoFileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability + Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* Availability state */}
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Disponible</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>En revisión</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        <span>Sin acceso</span>
                      </span>
                    )}

                    {/* Action */}
                    {isAvailable ? (
                      <button
                        id={`play-song-${song.id}`}
                        onClick={() => openPlayer(song)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-2xs cursor-pointer min-h-[38px] sm:min-h-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Reproducir</span>
                      </button>
                    ) : isPending ? (
                      <button
                        disabled
                        className="px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed min-h-[38px] sm:min-h-0"
                      >
                        Solicitada
                      </button>
                    ) : (
                      <button
                        id={`request-song-${song.id}`}
                        onClick={() => handleRequestSingleSong(song.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer min-h-[38px] sm:min-h-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Solicitar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Request Bar if multiple songs selected */}
      {selectedSongIdsForRequest.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-30 bg-stone-900 text-white px-4 sm:px-5 py-3 rounded-xl shadow-xl flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-xs animate-fadeIn">
          <span className="truncate">
            <strong>{selectedSongIdsForRequest.length}</strong> seleccionada(s)
          </span>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-3.5 py-2 sm:py-1.5 rounded-lg bg-white text-stone-900 font-semibold hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
          >
            Completar solicitud
          </button>
        </div>
      )}
    </div>
  );
};
