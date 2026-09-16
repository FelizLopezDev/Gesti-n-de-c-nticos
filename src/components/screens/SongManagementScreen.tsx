import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  UploadCloud,
  FileVideo,
  X,
  Play,
  Loader2,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Song } from '../../types';
import { extractVideoMetadata, formatFileSize } from '../../services/videoService';

export const SongManagementScreen: React.FC = () => {
  const {
    songs,
    uploadSongWithFile,
    updateSong,
    deleteSong,
    openPlayer,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);

  // Upload modal state: ONLY MP4 file + Song name
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [songName, setSongName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoDuration, setVideoDuration] = useState<string | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSongName('');
    setVideoDuration(null);
    setVideoDurationSec(0);
    setIsProcessing(false);
    setEditingSong(null);
  };

  const handleOpenUpload = () => {
    resetUploadForm();
    setIsUploadModalOpen(true);
  };

  const handleOpenEdit = (song: Song) => {
    setEditingSong(song);
    setSongName(song.title);
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
      showToast('Por favor selecciona un archivo en formato MP4.', 'warning');
    }

    setSelectedFile(file);

    // Auto-fill song name from filename if empty
    if (!songName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setSongName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Extract duration in browser
    try {
      const meta = await extractVideoMetadata(file);
      setVideoDuration(meta.durationFormatted);
      setVideoDurationSec(meta.durationSeconds);
    } catch {
      setVideoDuration(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!songName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setSongName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    try {
      const meta = await extractVideoMetadata(file);
      setVideoDuration(meta.durationFormatted);
      setVideoDurationSec(meta.durationSeconds);
    } catch {
      setVideoDuration(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!songName.trim()) {
      showToast('Por favor ingresa el nombre de la canción.', 'warning');
      return;
    }

    // Editing existing song
    if (editingSong) {
      updateSong(editingSong.id, {
        title: songName.trim(),
      });
      setIsUploadModalOpen(false);
      resetUploadForm();
      return;
    }

    // Uploading new song
    if (!selectedFile) {
      showToast('Por favor selecciona un archivo MP4.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      await uploadSongWithFile(selectedFile, {
        title: songName.trim(),
        durationFormatted: videoDuration || '03:30',
        durationSeconds: videoDurationSec || 210,
      });
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch (err) {
      showToast('Ocurrió un error al procesar el archivo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [songs, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Gestión de Canciones
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {songs.length} canciones registradas en la biblioteca.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canción..."
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <button
            id="open-upload-modal-btn"
            onClick={handleOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Subir canción</span>
          </button>
        </div>
      </div>

      {/* Songs Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Canción</th>
              <th className="py-3 px-4 hidden sm:table-cell">Archivo / Duración</th>
              <th className="py-3 px-4 hidden md:table-cell">Fecha de subida</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredSongs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-stone-500">
                  No se encontraron canciones.
                </td>
              </tr>
            ) : (
              filteredSongs.map((song) => (
                <tr key={song.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900 text-sm">{song.title}</div>
                    {song.videoFileName && (
                      <div className="text-[11px] text-stone-500 truncate max-w-xs sm:hidden">
                        {song.videoFileName}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <span className="text-stone-700 font-medium">
                      {song.duration || '—'}
                    </span>
                    {song.videoFileName && (
                      <span className="text-stone-500 text-[11px] block truncate max-w-xs">
                        {song.videoFileName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell text-stone-500">
                    {new Date(song.uploadedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPlayer(song)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                        title="Reproducir video"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Reproducir</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(song)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                        title="Editar nombre"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSong(song)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Eliminar canción"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* UPLOAD / EDIT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200">
              <h3 className="text-sm font-semibold text-stone-900">
                {editingSong ? 'Editar Canción' : 'Subir Canción'}
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form: ONLY MP4 File + Song Name */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* 1. MP4 File Picker (only if new upload) */}
              {!editingSong && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Seleccionar MP4 *
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-stone-300 hover:border-stone-500 rounded-xl text-center cursor-pointer bg-stone-50/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,.mp4"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-1.5">
                        <FileVideo className="w-8 h-8 text-stone-700 mx-auto" />
                        <p className="font-semibold text-stone-900 text-sm">{selectedFile.name}</p>
                        {/* Automatic technical metadata (read-only) */}
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100 text-[11px] text-stone-600 font-mono">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          <span>•</span>
                          <span>{selectedFile.type || 'video/mp4'}</span>
                          {videoDuration && (
                            <>
                              <span>•</span>
                              <span>{videoDuration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-8 h-8 text-stone-400 mx-auto" />
                        <p className="font-medium text-stone-700">
                          Haz clic para seleccionar o arrastra un archivo MP4
                        </p>
                        <p className="text-[11px] text-stone-400">Formato: MP4</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Song Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nombre de la canción *
                </label>
                <input
                  id="upload-song-name-input"
                  type="text"
                  required
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="Ej. Cuan Grande Es Dios"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-xs text-stone-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="submit-upload-btn"
                  type="submit"
                  disabled={isProcessing || (!editingSong && !selectedFile)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Procesando video...</span>
                    </>
                  ) : (
                    <span>{editingSong ? 'Guardar cambios' : 'Subir canción'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-stone-200 p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-stone-900">¿Eliminar canción?</h3>
            <p className="text-stone-600">
              ¿Estás seguro de que deseas eliminar <strong>"{deletingSong.title}"</strong> de la biblioteca?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSong(null)}
                className="px-3 py-1.5 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteSong(deletingSong.id);
                  setDeletingSong(null);
                }}
                className="px-3 py-1.5 rounded-lg font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
