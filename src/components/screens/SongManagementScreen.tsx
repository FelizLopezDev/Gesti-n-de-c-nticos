import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  UploadCloud,
  FileVideo,
  Shield,
  Clock,
  Music,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  File,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song } from '../../types';
import { extractVideoMetadata, formatFileSize } from '../../services/videoService';

export const SongManagementScreen: React.FC = () => {
  const {
    songs,
    addSong,
    uploadSongWithFile,
    updateSong,
    deleteSong,
    openSongDetail,
    openPlayer,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);

  // Real file upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    durationSeconds: number;
    durationFormatted: string;
    width: number;
    height: number;
    thumbnailDataUrl?: string;
  } | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formCategory, setFormCategory] = useState('Alabanza');
  const [formDescription, setFormDescription] = useState('');
  const [formRecommendedUse, setFormRecommendedUse] = useState('Apertura de reunión Google Meet');
  const [formMusicalKey, setFormMusicalKey] = useState('Sol Mayor (G)');
  const [formTempoBpm, setFormTempoBpm] = useState<number>(85);

  const categories = [
    'Alabanza',
    'Adoración',
    'Himno Clásico',
    'Especial Niños',
    'Comunión',
    'Apertura',
  ];

  const resetForm = () => {
    setFormTitle('');
    setFormArtist('');
    setFormCategory('Alabanza');
    setFormDescription('');
    setFormRecommendedUse('Apertura de reunión Google Meet');
    setFormMusicalKey('Sol Mayor (G)');
    setFormTempoBpm(85);
    setSelectedFile(null);
    setExtractedInfo(null);
    setEditingSong(null);
    setIsProcessingVideo(false);
  };

  const handleOpenUpload = () => {
    resetForm();
    setIsUploadModalOpen(true);
  };

  const handleOpenEdit = (song: Song) => {
    setEditingSong(song);
    setFormTitle(song.title);
    setFormArtist(song.artist);
    setFormCategory(song.category);
    setFormDescription(song.description);
    setFormRecommendedUse(song.recommendedUse);
    setFormMusicalKey(song.musicalKey);
    setFormTempoBpm(song.tempoBpm);
    setSelectedFile(null);
    setExtractedInfo(null);
    setIsUploadModalOpen(true);
  };

  // Handle Real MP4 File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      showToast('Por favor selecciona un archivo de video en formato MP4.', 'warning', 'Formato no soportado');
    }

    setSelectedFile(file);
    setIsProcessingVideo(true);

    // Auto-populate title from filename if empty
    if (!formTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      // Capitalize first letter
      setFormTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    try {
      const meta = await extractVideoMetadata(file);
      setExtractedInfo(meta);
    } catch (err) {
      console.warn('Metadata extraction note:', err);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Drag and drop handlers
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessingVideo(true);

    if (!formTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setFormTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    try {
      const meta = await extractVideoMetadata(file);
      setExtractedInfo(meta);
    } catch (err) {
      console.warn('Metadata extraction note:', err);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingSong) {
      updateSong(editingSong.id, {
        title: formTitle.trim(),
        artist: formArtist.trim() || 'Comunidad Cristiana',
        category: formCategory.trim() || 'Alabanza',
        description: formDescription.trim(),
        recommendedUse: formRecommendedUse.trim(),
        musicalKey: formMusicalKey.trim(),
        tempoBpm: formTempoBpm,
      });
      setIsUploadModalOpen(false);
      resetForm();
      return;
    }

    // New Video Upload
    if (!selectedFile) {
      showToast('Por favor selecciona un archivo de video MP4 para subir.', 'error', 'Archivo Requerido');
      return;
    }

    setIsProcessingVideo(true);

    try {
      const durationSeconds = extractedInfo?.durationSeconds || 180;
      const durationFormatted = extractedInfo?.durationFormatted || '03:00';

      const newUploadedSong = await uploadSongWithFile(selectedFile, {
        title: formTitle.trim(),
        artist: formArtist.trim() || 'Comunidad Cristiana',
        category: formCategory.trim() || 'Alabanza',
        description: formDescription.trim(),
        recommendedUse: formRecommendedUse.trim(),
        musicalKey: formMusicalKey.trim(),
        tempoBpm: formTempoBpm,
        durationSeconds,
        durationFormatted,
        thumbnailUrl: extractedInfo?.thumbnailDataUrl,
      });

      setIsUploadModalOpen(false);
      resetForm();

      // Offer immediate test play
      openPlayer(newUploadedSong);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Ocurrió un error al procesar el archivo en el navegador.', 'error', 'Error al Subir');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingSong) return;
    deleteSong(deletingSong.id);
    setDeletingSong(null);
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.musicalKey.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [songs, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-stone-700" />
              <span>Gestión de Canciones y Archivos de Video</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {songs.length} pistas en inventario
              </span>
            </h1>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Sube archivos MP4 reales desde tu computadora y administra el material protegido para las reuniones de Google Meet.
            </p>
          </div>

          <button
            id="open-upload-song-modal-btn"
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Video MP4</span>
          </button>
        </div>

        {/* Private storage assurance banner */}
        <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Reproductor y Almacenamiento Local del Prototipo:</strong> Los archivos MP4 se procesan y almacenan en el navegador para reproducirse de forma fluida y privada en el reproductor web.
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-song-inventory-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canción por título, autor o tonalidad..."
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-700"
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Canción / Archivo</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Tonalidad / BPM</th>
                <th className="py-3.5 px-4">Duración</th>
                <th className="py-3.5 px-4">Subido por</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredSongs.map((song) => (
                <tr key={song.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={() => openPlayer(song)}
                        className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        title="Probar reproducción"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <div
                          onClick={() => openSongDetail(song)}
                          className="font-bold text-stone-900 cursor-pointer hover:underline flex items-center gap-1.5"
                        >
                          <span>{song.title}</span>
                          {song.videoUrl && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                              MP4 Real
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {song.artist}
                          {song.fileName && <span className="ml-1 text-stone-400">· {song.fileName}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                      {song.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {song.musicalKey} · {song.tempoBpm} BPM
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-stone-800">
                    {song.duration}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <div>{song.uploadedBy}</div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(song.uploadedAt).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPlayer(song)}
                        className="p-1.5 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Reproducir video"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(song)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        title="Editar metadatos"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSong(song)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Eliminar canción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload & Edit Video Modal */}
      {isUploadModalOpen && (
        <div
          id="upload-song-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div
            id="upload-song-modal-container"
            className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-stone-200 relative my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileVideo className="w-5 h-5 text-stone-700" />
                <span>{editingSong ? 'Editar Canción' : 'Subir y Registrar Video MP4'}</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSong} className="mt-4 space-y-4 text-xs">
              {/* Real File Upload Dropzone (when creating new) */}
              {!editingSong && (
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Archivo de Video MP4 *
                  </label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    id="real-video-file-input"
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    id="video-dropzone-area"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                      selectedFile
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-stone-300 bg-stone-50 hover:bg-stone-100/70'
                    }`}
                  >
                    {isProcessingVideo ? (
                      <div className="py-2 flex flex-col items-center justify-center gap-2 text-stone-600">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <span className="font-semibold text-xs">Analizando archivo MP4 y extrayendo metadatos...</span>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-emerald-700 font-bold text-sm flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Video Seleccionado y Listo</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 text-left space-y-1 inline-block w-full max-w-md">
                          <div className="flex justify-between">
                            <span className="text-stone-500 font-medium">Nombre de archivo:</span>
                            <span className="font-mono text-stone-900 font-bold truncate max-w-[200px]" title={selectedFile.name}>
                              {selectedFile.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500 font-medium">Tamaño del archivo:</span>
                            <span className="font-mono text-stone-900">{formatFileSize(selectedFile.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500 font-medium">Duración detectada:</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              {extractedInfo?.durationFormatted || 'Calculando...'} ({extractedInfo?.durationSeconds || 0}s)
                            </span>
                          </div>
                          {extractedInfo?.width ? (
                            <div className="flex justify-between">
                              <span className="text-stone-500 font-medium">Resolución:</span>
                              <span className="font-mono text-stone-700">
                                {extractedInfo.width} × {extractedInfo.height} px
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Haz clic si deseas seleccionar otro archivo de video MP4.
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-1.5" />
                        <span className="font-semibold text-stone-800 block text-sm">
                          Haz clic para seleccionar o arrastra un archivo MP4
                        </span>
                        <span className="text-[11px] text-stone-500 mt-0.5 block">
                          Admite cualquier video MP4 de tu computadora. Se reproducirá directamente en el reproductor.
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Título de la Canción / Video *</label>
                  <input
                    id="video-title-input"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. Gracia Sublime Es Su Amor"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Intérprete / Autor</label>
                  <input
                    id="video-artist-input"
                    type="text"
                    value={formArtist}
                    onChange={(e) => setFormArtist(e.target.value)}
                    placeholder="Ej. Phil Wickham / Comunidad"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Category, Key & Tempo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoría</label>
                  <input
                    id="video-category-input"
                    list="category-suggestions"
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ej. Alabanza, Adoración"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                  <datalist id="category-suggestions">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tonalidad Musical</label>
                  <input
                    id="video-key-input"
                    type="text"
                    value={formMusicalKey}
                    onChange={(e) => setFormMusicalKey(e.target.value)}
                    placeholder="Ej. Sol Mayor (G)"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tempo (BPM)</label>
                  <input
                    id="video-tempo-input"
                    type="number"
                    min="40"
                    max="240"
                    value={formTempoBpm}
                    onChange={(e) => setFormTempoBpm(parseInt(e.target.value, 10) || 85)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descripción / Notas</label>
                <textarea
                  id="video-description-input"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles sobre el arreglo, letra sincronizada o momento sugerido..."
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              {/* Optional Recommended Use */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Uso Recomendado en Google Meet</label>
                <input
                  id="video-recommended-use-input"
                  type="text"
                  value={formRecommendedUse}
                  onChange={(e) => setFormRecommendedUse(e.target.value)}
                  placeholder="Ej. Apertura de reunión general o tiempo de adoración pastoral"
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-save-video-btn"
                  type="submit"
                  disabled={isProcessingVideo || (!editingSong && !selectedFile)}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    isProcessingVideo || (!editingSong && !selectedFile)
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800'
                  }`}
                >
                  {isProcessingVideo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : editingSong ? (
                    'Guardar Cambios'
                  ) : (
                    'Subir video'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Confirmar Eliminación Permanente</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la canción{' '}
              <strong className="text-stone-900">"{deletingSong.title}"</strong>? Esta acción revocará
              todos los accesos activos vinculados a este video.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSong(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-song-btn"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs cursor-pointer"
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
