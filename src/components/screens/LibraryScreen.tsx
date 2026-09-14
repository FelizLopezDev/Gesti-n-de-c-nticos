import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Play,
  Lock,
  Clock,
  AlertTriangle,
  Ban,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Sparkles,
  Info,
  Shield,
  Music,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccessStatusBadge } from '../common/Badge';
import { Song, AccessStatus } from '../../types';

export const LibraryScreen: React.FC = () => {
  const {
    songs,
    getUserSongAccessStatus,
    openPlayer,
    openSongDetail,
    selectedSongIdsForRequest,
    toggleSongSelectionForRequest,
    setIsRequestModalOpen,
    selectAllEligibleSongs,
    clearSongSelectionForRequest,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'category'>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = ['ALL', 'Alabanza', 'Adoración', 'Himno Clásico', 'Especial Niños', 'Comunión'];
  const statusOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'AVAILABLE', label: 'Disponible (Puedo reproducir)' },
    { value: 'NO_ACCESS', label: 'Sin acceso' },
    { value: 'PENDING', label: 'Solicitud pendiente' },
    { value: 'EXPIRED', label: 'Acceso expirado' },
    { value: 'REVOKED', label: 'Acceso revocado' },
  ];

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        // Search filter
        const matchesSearch =
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.musicalKey.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory =
          selectedCategory === 'ALL' || song.category === selectedCategory;

        // Status filter
        const { status } = getUserSongAccessStatus(song.id);
        const matchesStatus =
          selectedStatusFilter === 'ALL' || status === selectedStatusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'duration') return b.durationSeconds - a.durationSeconds;
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return 0;
      });
  }, [songs, searchTerm, selectedCategory, selectedStatusFilter, sortBy, getUserSongAccessStatus]);

  // Count items by status
  const counts = useMemo(() => {
    let available = 0;
    let pending = 0;
    let noAccess = 0;
    let expired = 0;
    let revoked = 0;

    songs.forEach((s) => {
      const { status } = getUserSongAccessStatus(s.id);
      if (status === 'AVAILABLE') available++;
      else if (status === 'PENDING') pending++;
      else if (status === 'EXPIRED') expired++;
      else if (status === 'REVOKED') revoked++;
      else noAccess++;
    });

    return { available, pending, noAccess, expired, revoked, total: songs.length };
  }, [songs, getUserSongAccessStatus]);

  // Eligible songs for requesting in current view
  const eligibleSongIdsInView = filteredSongs
    .filter((s) => {
      const { status } = getUserSongAccessStatus(s.id);
      return status !== 'PENDING' && status !== 'AVAILABLE';
    })
    .map((s) => s.id);

  return (
    <div className="space-y-6">
      {/* Header & Core Notice */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <span>Biblioteca de Canciones y Pistas</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                {songs.length} pistas
              </span>
            </h1>
          </div>

          {/* Status summary counters pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedStatusFilter('AVAILABLE')}
              className={`px-2.5 py-1 rounded-md border font-medium transition-colors ${
                selectedStatusFilter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {counts.available} Disponibles
            </button>
            <button
              onClick={() => setSelectedStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded-md border font-medium transition-colors ${
                selectedStatusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {counts.pending} Pendientes
            </button>
            <button
              onClick={() => setSelectedStatusFilter('NO_ACCESS')}
              className={`px-2.5 py-1 rounded-md border font-medium transition-colors ${
                selectedStatusFilter === 'NO_ACCESS'
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {counts.noAccess} Sin acceso
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar when songs are selected for request */}
      {selectedSongIdsForRequest.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 text-xs animate-fadeIn border border-stone-700">
          <span className="font-semibold text-amber-300">
            {selectedSongIdsForRequest.length} canción(es) seleccionada(s)
          </span>
          <button
            onClick={clearSongSelectionForRequest}
            className="text-stone-400 hover:text-white underline cursor-pointer"
          >
            Limpiar
          </button>
          <button
            id="library-floating-submit-btn"
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solicitar ahora</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="library-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, autor, tonalidad o tema..."
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="library-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-700"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Todas las categorías' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="library-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-700"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode and bulk selection toolbar */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Ordenar:</span>
            <select
              id="library-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 border border-stone-200 rounded-md text-xs bg-stone-50 text-stone-700"
            >
              <option value="title">Título (A-Z)</option>
              <option value="duration">Mayor duración</option>
              <option value="category">Categoría</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
            <button
              id="library-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Vista cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="library-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Vista tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSongs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <Music className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No se encontraron canciones</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Prueba ajustando los términos de búsqueda o quitando los filtros de categoría y estado.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSongs.map((song) => {
            const { status, permission } = getUserSongAccessStatus(song.id);
            const isSelected = selectedSongIdsForRequest.includes(song.id);
            const isPending = status === 'PENDING';
            const isAvailable = status === 'AVAILABLE';

            return (
              <div
                key={song.id}
                id={`song-card-${song.id}`}
                className={`bg-white rounded-xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden relative ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : isAvailable
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Thumbnail / Header Gradient representation */}
                <div
                  className={`h-24 bg-gradient-to-r ${song.thumbnailGradient} p-4 flex flex-col justify-between relative text-white`}
                >
                  <div className="flex items-center justify-end">
                    {/* Multi-selection checkbox for non-pending and non-available songs */}
                    {!isAvailable && !isPending ? (
                      <button
                        id={`select-song-checkbox-${song.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSongSelectionForRequest(song.id);
                        }}
                        className="p-1 rounded bg-black/40 hover:bg-black/70 text-white transition-colors"
                        title={isSelected ? 'Deseleccionar' : 'Seleccionar para solicitud conjunta'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-300" />
                        )}
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono bg-black/50 px-2 py-0.5 rounded text-[11px] font-medium">
                      {song.duration}
                    </span>
                    <span className="text-[11px] opacity-90">{song.musicalKey}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Status Badge */}
                    <div className="mb-2.5">
                      <AccessStatusBadge status={status} />
                    </div>

                    <h3
                      onClick={() => openSongDetail(song)}
                      className="text-base font-bold text-stone-900 leading-snug hover:text-stone-700 cursor-pointer line-clamp-1 flex items-center gap-1.5"
                    >
                      <span>{song.title}</span>
                      {song.videoUrl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider shrink-0">
                          MP4
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{song.artist}</p>

                    <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {song.description}
                    </p>

                    {/* Extra metadata pills */}
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2 text-[11px] text-stone-500">
                      <span className="bg-stone-100 px-2 py-0.5 rounded">Tempo: {song.tempoBpm} BPM</span>
                      <span className="bg-stone-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                        {song.recommendedUse}
                      </span>
                    </div>

                    {/* If available, show expiration time notice */}
                    {isAvailable && permission && (
                      <div className="mt-3 p-2 rounded-md bg-emerald-50 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium border border-emerald-100">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Válido hasta hoy{' '}
                          {new Date(permission.expiresAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      id={`song-details-btn-${song.id}`}
                      onClick={() => openSongDetail(song)}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium"
                    >
                      Ver detalles
                    </button>

                    {/* Status specific action buttons */}
                    {status === 'AVAILABLE' ? (
                      <button
                        id={`song-play-btn-${song.id}`}
                        onClick={() => openPlayer(song)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Reproducir</span>
                      </button>
                    ) : status === 'PENDING' ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed opacity-80"
                        title="Ya existe una solicitud pendiente de aprobación para esta canción"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pendiente</span>
                      </button>
                    ) : status === 'EXPIRED' ? (
                      <button
                        id={`song-request-again-btn-${song.id}`}
                        onClick={() => {
                          toggleSongSelectionForRequest(song.id);
                          setIsRequestModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Solicitar nuevamente</span>
                      </button>
                    ) : (
                      <button
                        id={`song-request-btn-${song.id}`}
                        onClick={() => {
                          toggleSongSelectionForRequest(song.id);
                          setIsRequestModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Solicitar acceso</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-10">Sel.</th>
                  <th className="py-3 px-4">Canción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Tonalidad / BPM</th>
                  <th className="py-3 px-4">Duración</th>
                  <th className="py-3 px-4">Estado de Acceso</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredSongs.map((song) => {
                  const { status, permission } = getUserSongAccessStatus(song.id);
                  const isSelected = selectedSongIdsForRequest.includes(song.id);
                  const isAvailable = status === 'AVAILABLE';
                  const isPending = status === 'PENDING';

                  return (
                    <tr key={song.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        {!isAvailable && !isPending ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSongSelectionForRequest(song.id)}
                            className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                          />
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          onClick={() => openSongDetail(song)}
                          className="font-bold text-stone-900 cursor-pointer hover:underline"
                        >
                          {song.title}
                        </div>
                        <div className="text-stone-500 text-[11px]">{song.artist}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                          {song.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {song.musicalKey} · {song.tempoBpm} BPM
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-stone-800">
                        {song.duration}
                      </td>
                      <td className="py-3 px-4">
                        <AccessStatusBadge status={status} />
                        {isAvailable && permission && (
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            Hasta {new Date(permission.expiresAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isAvailable ? (
                          <button
                            onClick={() => openPlayer(song)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Reproducir</span>
                          </button>
                        ) : isPending ? (
                          <span className="text-stone-400 text-xs italic">En revisión</span>
                        ) : (
                          <button
                            onClick={() => {
                              toggleSongSelectionForRequest(song.id);
                              setIsRequestModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-900 text-white font-semibold hover:bg-stone-800"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Solicitar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
