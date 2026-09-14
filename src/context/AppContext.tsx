import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  User,
  Role,
  Song,
  Permission,
  AccessRequest,
  RequestItem,
  AuditLogEntry,
  ScreenId,
  AccessStatus,
  RequestStatus,
  PermissionStatus,
  UserStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SONGS,
  INITIAL_PERMISSIONS,
  INITIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
} from '../mockData';
import { uploadVideo, getVideoSource } from '../services/videoService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface ApprovalTarget {
  requestId: string;
  songId: string;
  songTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
}

interface AppContextType {
  // Authentication & Current User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRolePersona: (role: Role) => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;

  // Navigation
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;

  // Data
  users: User[];
  songs: Song[];
  permissions: Permission[];
  requests: AccessRequest[];
  auditLogs: AuditLogEntry[];

  // Player state
  activePlayerSong: Song | null;
  activePlayerPermission: Permission | null;
  openPlayer: (song: Song) => void;
  closePlayer: () => void;

  // Detail screen state
  selectedSongDetail: Song | null;
  openSongDetail: (song: Song) => void;
  closeSongDetail: () => void;

  // Multi-request cart / selection
  selectedSongIdsForRequest: string[];
  toggleSongSelectionForRequest: (songId: string) => void;
  selectAllEligibleSongs: (songIds: string[]) => void;
  clearSongSelectionForRequest: () => void;
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;

  // Approval modal
  approvalTarget: ApprovalTarget | null;
  openApprovalModal: (target: ApprovalTarget) => void;
  closeApprovalModal: () => void;

  // Actions
  getUserSongAccessStatus: (songId: string, targetUserId?: string) => {
    status: AccessStatus;
    permission?: Permission;
    pendingRequestId?: string;
  };
  submitAccessRequest: (
    songIds: string[],
    meetingPurpose: string,
    meetingDate?: string,
    notes?: string
  ) => boolean;
  approveSongAccess: (
    requestId: string,
    songId: string,
    durationLabel: string,
    startsAt: string,
    expiresAt: string
  ) => void;
  rejectSongAccess: (requestId: string, songId: string, reason?: string) => void;
  revokePermission: (permissionId: string, reason?: string) => void;

  // Song management
  addSong: (song: Omit<Song, 'id' | 'uploadedAt' | 'uploadedBy' | 'isPrivate'>) => Song;
  uploadSongWithFile: (
    file: File,
    metadata: {
      title: string;
      artist: string;
      category: string;
      description?: string;
      musicalKey?: string;
      tempoBpm?: number;
      durationFormatted?: string;
      durationSeconds?: number;
      recommendedUse?: string;
    }
  ) => Promise<Song>;
  getVideoPlaybackUrl: (songId: string) => Promise<string | null>;
  updateSong: (songId: string, updates: Partial<Song>) => void;
  deleteSong: (songId: string) => void;

  // User management
  createUser: (user: { username: string; displayName: string; email: string; role: Role }) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  changeUserRole: (userId: string, newRole: Role) => void;
  resetUserPassword: (userId: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to User Carlos Mora for realistic initial view, or superadmin
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[3]); // Carlos Mora (USER)
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Player state
  const [activePlayerSong, setActivePlayerSong] = useState<Song | null>(null);
  const [activePlayerPermission, setActivePlayerPermission] = useState<Permission | null>(null);

  // Song Detail modal/screen state
  const [selectedSongDetail, setSelectedSongDetail] = useState<Song | null>(null);

  // Multi-request selection
  const [selectedSongIdsForRequest, setSelectedSongIdsForRequest] = useState<string[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);

  // Approval modal state
  const [approvalTarget, setApprovalTarget] = useState<ApprovalTarget | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: log audit event
  const logAudit = (
    action: AuditLogEntry['action'],
    actionLabel: string,
    resourceName: string,
    details: string,
    affectedUser?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser ? currentUser.displayName : 'Sistema',
      actorRole: currentUser ? currentUser.role : 'USER',
      action,
      actionLabel,
      affectedUser,
      resourceName,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Switch persona conveniently for testing
  const switchRolePersona = (role: Role) => {
    const matched = users.find((u) => u.role === role && u.status === 'ACTIVE');
    if (matched) {
      setCurrentUser(matched);
      clearSongSelectionForRequest();
      // Adjust screen if current screen is not permitted for the new role
      if (
        role === 'USER' &&
        ['admin-requests', 'admin-permissions', 'admin-songs', 'admin-users', 'admin-audit'].includes(
          currentScreen
        )
      ) {
        setCurrentScreen('dashboard');
      } else if (
        (role === 'ADMIN' || role === 'SUPERADMIN') &&
        ['library', 'my-requests', 'my-permissions'].includes(currentScreen)
      ) {
        setCurrentScreen('dashboard');
      } else if (
        role === 'ADMIN' &&
        ['admin-users', 'admin-audit'].includes(currentScreen)
      ) {
        setCurrentScreen('dashboard');
      }
      showToast(`Cambiado a rol: ${role} (${matched.displayName})`, 'info', 'Simulación de rol');
    }
  };

  const login = (email: string) => {
    const matched = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
    );
    if (!matched) {
      return { success: false, error: 'Credenciales inválidas o usuario no registrado en el sistema parroquial.' };
    }
    if (matched.status === 'DISABLED') {
      return {
        success: false,
        error: 'Esta cuenta ha sido deshabilitada por la administración. Comunícate con el Superadministrador.',
      };
    }
    setCurrentUser(matched);
    setCurrentScreen('dashboard');
    logAudit('LOGIN_SUCCESS', 'Inicio de sesión', matched.email, `Sesión iniciada con rol ${matched.role}.`, matched.displayName);
    showToast(`Bienvenido de nuevo, ${matched.displayName}`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePlayerSong(null);
    setSelectedSongDetail(null);
    setSelectedSongIdsForRequest([]);
  };

  // Check access status of a song for a user
  const getUserSongAccessStatus = (songId: string, targetUserId?: string) => {
    const uid = targetUserId || currentUser?.id;
    if (!uid) return { status: 'NO_ACCESS' as AccessStatus };

    // 1. Check for active permissions
    const now = new Date().toISOString();
    const activePerm = permissions.find(
      (p) => p.userId === uid && p.songId === songId && p.status === 'ACTIVE' && p.expiresAt > now
    );
    if (activePerm) {
      return { status: 'AVAILABLE' as AccessStatus, permission: activePerm };
    }

    // 2. Check for pending requests
    const pendingReq = requests.find(
      (r) =>
        r.userId === uid &&
        r.overallStatus === 'PENDING' &&
        r.items.some((item) => item.songId === songId && item.status === 'PENDING')
    );
    if (pendingReq) {
      return { status: 'PENDING' as AccessStatus, pendingRequestId: pendingReq.id };
    }

    // 3. Check for recently revoked permissions
    const revokedPerm = permissions.find(
      (p) => p.userId === uid && p.songId === songId && p.status === 'REVOKED'
    );
    if (revokedPerm) {
      return { status: 'REVOKED' as AccessStatus, permission: revokedPerm };
    }

    // 4. Check for expired permissions
    const expiredPerm = permissions.find(
      (p) => p.userId === uid && p.songId === songId && (p.status === 'EXPIRED' || p.expiresAt <= now)
    );
    if (expiredPerm) {
      return { status: 'EXPIRED' as AccessStatus, permission: expiredPerm };
    }

    // 5. Otherwise, no access
    return { status: 'NO_ACCESS' as AccessStatus };
  };

  // Player handlers
  const openPlayer = (song: Song) => {
    // Admin and Superadmin manage songs and can play them directly
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
      setActivePlayerSong(song);
      setActivePlayerPermission(null);
      return;
    }

    const { status, permission } = getUserSongAccessStatus(song.id);
    if (status === 'AVAILABLE' && permission) {
      setActivePlayerSong(song);
      setActivePlayerPermission(permission);
    } else {
      // Open song detail showing state B (locked)
      setSelectedSongDetail(song);
    }
  };

  const closePlayer = () => {
    setActivePlayerSong(null);
    setActivePlayerPermission(null);
  };

  const openSongDetail = (song: Song) => {
    setSelectedSongDetail(song);
  };

  const closeSongDetail = () => {
    setSelectedSongDetail(null);
  };

  // Multi-request handlers
  const toggleSongSelectionForRequest = (songId: string) => {
    const { status } = getUserSongAccessStatus(songId);
    if (status === 'PENDING') {
      showToast('Esta canción ya tiene una solicitud pendiente en revisión.', 'warning', 'No disponible');
      return;
    }
    setSelectedSongIdsForRequest((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const selectAllEligibleSongs = (songIds: string[]) => {
    const eligible = songIds.filter((id) => {
      const { status } = getUserSongAccessStatus(id);
      return status !== 'PENDING' && status !== 'AVAILABLE';
    });
    setSelectedSongIdsForRequest(eligible);
  };

  const clearSongSelectionForRequest = () => {
    setSelectedSongIdsForRequest([]);
  };

  // Submit Access Request (User)
  const submitAccessRequest = (
    songIds: string[],
    meetingPurpose: string,
    meetingDate?: string,
    notes?: string
  ): boolean => {
    if (!currentUser) return false;
    if (songIds.length === 0) {
      showToast('Selecciona al menos una canción para solicitar acceso.', 'warning');
      return false;
    }

    const items: RequestItem[] = songIds.map((sid) => {
      const song = songs.find((s) => s.id === sid);
      return {
        songId: sid,
        songTitle: song?.title || 'Canción',
        status: 'PENDING',
      };
    });

    const newReqId = `REQ-2026-${String(requests.length + 82).padStart(3, '0')}`;
    const newRequest: AccessRequest = {
      id: newReqId,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userEmail: currentUser.email,
      requestDate: new Date().toISOString(),
      meetingPurpose: meetingPurpose || 'Reunión de Google Meet',
      meetingDate: meetingDate || new Date().toISOString(),
      notes: notes || '',
      items,
      overallStatus: 'PENDING',
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSelectedSongIdsForRequest([]);
    setIsRequestModalOpen(false);

    logAudit(
      'REQUEST_CREATED',
      'Solicitud creada',
      newReqId,
      `${currentUser.displayName} solicitó acceso a ${songIds.length} canción(es) para "${meetingPurpose}".`,
      currentUser.displayName
    );

    showToast(
      `Solicitud ${newReqId} enviada con éxito. Los administradores revisarán el acceso.`,
      'success',
      'Solicitud Registrada'
    );
    return true;
  };

  // Open Approval Modal
  const openApprovalModal = (target: ApprovalTarget) => {
    setApprovalTarget(target);
  };

  const closeApprovalModal = () => {
    setApprovalTarget(null);
  };

  // Approve Song Access (Admin / Superadmin)
  const approveSongAccess = (
    requestId: string,
    songId: string,
    durationLabel: string,
    startsAt: string,
    expiresAt: string
  ) => {
    if (!currentUser) return;

    // Update request item
    let targetUser: { id: string; name: string; email: string } = {
      id: '',
      name: '',
      email: '',
    };
    let songTitle = '';

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetUser = { id: req.userId, name: req.userName, email: req.userEmail };
          const updatedItems = req.items.map((item) => {
            if (item.songId === songId) {
              songTitle = item.songTitle;
              return {
                ...item,
                status: 'APPROVED' as RequestStatus,
                reviewedBy: currentUser.displayName,
                reviewedAt: new Date().toISOString(),
                grantedDuration: durationLabel,
              };
            }
            return item;
          });

          // Check if all items are decided
          const allDecided = updatedItems.every((i) => i.status !== 'PENDING');
          const hasApproved = updatedItems.some((i) => i.status === 'APPROVED');
          const overallStatus: RequestStatus = allDecided
            ? hasApproved
              ? 'APPROVED'
              : 'REJECTED'
            : 'PENDING';

          return {
            ...req,
            items: updatedItems,
            overallStatus,
          };
        }
        return req;
      })
    );

    // Create active permission
    const newPerm: Permission = {
      id: `perm_${Date.now()}`,
      userId: targetUser.id || 'usr_unknown',
      userName: targetUser.name || 'Usuario',
      userEmail: targetUser.email || '',
      songId,
      songTitle: songTitle || 'Canción',
      grantedBy: currentUser.displayName,
      grantedById: currentUser.id,
      grantedAt: new Date().toISOString(),
      startsAt,
      expiresAt,
      status: 'ACTIVE',
    };

    setPermissions((prev) => [newPerm, ...prev]);

    logAudit(
      'REQUEST_APPROVED',
      'Acceso aprobado',
      songTitle,
      `${currentUser.displayName} aprobó acceso para ${targetUser.name} (${durationLabel}) hasta ${new Date(
        expiresAt
      ).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
      targetUser.name
    );

    showToast(
      `Acceso concedido a ${targetUser.name} para "${songTitle}" (${durationLabel}).`,
      'success',
      'Permiso Otorgado'
    );

    closeApprovalModal();
  };

  // Reject Song Access
  const rejectSongAccess = (requestId: string, songId: string, reason = 'No autorizado para esta reunión') => {
    if (!currentUser) return;

    let targetUserName = '';
    let songTitle = '';

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetUserName = req.userName;
          const updatedItems = req.items.map((item) => {
            if (item.songId === songId) {
              songTitle = item.songTitle;
              return {
                ...item,
                status: 'REJECTED' as RequestStatus,
                reviewedBy: currentUser.displayName,
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason,
              };
            }
            return item;
          });

          const allDecided = updatedItems.every((i) => i.status !== 'PENDING');
          const hasApproved = updatedItems.some((i) => i.status === 'APPROVED');
          const overallStatus: RequestStatus = allDecided
            ? hasApproved
              ? 'APPROVED'
              : 'REJECTED'
            : 'PENDING';

          return {
            ...req,
            items: updatedItems,
            overallStatus,
          };
        }
        return req;
      })
    );

    logAudit(
      'REQUEST_REJECTED',
      'Solicitud rechazada',
      songTitle,
      `${currentUser.displayName} rechazó solicitud de ${targetUserName} para "${songTitle}". Motivo: ${reason}`,
      targetUserName
    );

    showToast(`Solicitud de "${songTitle}" rechazada.`, 'info', 'Solicitud Actualizada');
  };

  // Revoke Permission
  const revokePermission = (permissionId: string, reason = 'Revocado administrativamente') => {
    if (!currentUser) return;

    const targetPerm = permissions.find((p) => p.id === permissionId);
    if (!targetPerm) return;

    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId
          ? {
              ...p,
              status: 'REVOKED' as PermissionStatus,
              revokedAt: new Date().toISOString(),
              revokedBy: currentUser.displayName,
              revocationReason: reason,
            }
          : p
      )
    );

    logAudit(
      'PERMISSION_REVOKED',
      'Permiso revocado',
      targetPerm.songTitle,
      `${currentUser.displayName} revocó permiso a ${targetPerm.userName}. Motivo: ${reason}`,
      targetPerm.userName
    );

    showToast(`Permiso para "${targetPerm.songTitle}" revocado.`, 'warning', 'Acceso Revocado');

    // If currently playing, close player
    if (activePlayerPermission?.id === permissionId) {
      closePlayer();
    }
  };

  // Song Management (Admin/Superadmin)
  const addSong = (songData: Omit<Song, 'id' | 'uploadedAt' | 'uploadedBy' | 'isPrivate'>): Song => {
    const newSong: Song = {
      ...songData,
      id: `song_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser ? currentUser.displayName : 'Administrador',
      isPrivate: true,
    };
    setSongs((prev) => [newSong, ...prev]);

    if (currentUser) {
      logAudit(
        'VIDEO_UPLOADED',
        'Video subido',
        newSong.title,
        `${currentUser.displayName} subió archivo protegido "${newSong.title}" (${newSong.category}).`
      );
    }

    showToast(`Canción "${newSong.title}" agregada con éxito.`, 'success', 'Video Guardado');
    return newSong;
  };

  /**
   * Functional upload of a real File (e.g. MP4) in the browser
   */
  const uploadSongWithFile = async (
    file: File,
    metadata: {
      title: string;
      artist: string;
      category: string;
      description?: string;
      musicalKey?: string;
      tempoBpm?: number;
      durationFormatted?: string;
      durationSeconds?: number;
      recommendedUse?: string;
      thumbnailGradient?: string;
      thumbnailUrl?: string;
    }
  ): Promise<Song> => {
    const songId = `song_real_${Date.now()}`;
    const uploadResult = await uploadVideo(file, songId);

    const gradients = [
      'from-amber-700 to-stone-900',
      'from-blue-700 to-slate-900',
      'from-emerald-700 to-teal-950',
      'from-indigo-800 to-slate-950',
      'from-purple-800 to-stone-950',
    ];

    const newSong: Song = {
      id: songId,
      title: metadata.title.trim(),
      artist: metadata.artist.trim() || 'Comunidad Cristiana',
      category: metadata.category || 'Alabanza',
      duration: metadata.durationFormatted || '03:45',
      durationSeconds: metadata.durationSeconds || 225,
      musicalKey: metadata.musicalKey || 'Sol Mayor (G)',
      tempoBpm: metadata.tempoBpm || 85,
      thumbnailGradient: metadata.thumbnailGradient || gradients[Math.floor(Math.random() * gradients.length)],
      thumbnailUrl: metadata.thumbnailUrl,
      description: metadata.description?.trim() || 'Video MP4 subido para proyección congregacional en Google Meet.',
      recommendedUse: metadata.recommendedUse || 'Apertura de reunión Google Meet',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser ? currentUser.displayName : 'Administrador',
      isPrivate: true,
      videoUrl: uploadResult.blobUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
    };

    setSongs((prev) => [newSong, ...prev]);

    // If current user is Admin or Superadmin, grant immediate active permission so they can test playback immediately
    if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN')) {
      const now = new Date();
      const expires = new Date();
      expires.setHours(23, 59, 59, 999);

      const adminPerm: Permission = {
        id: `perm_auto_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.displayName,
        userEmail: currentUser.email,
        songId: newSong.id,
        songTitle: newSong.title,
        grantedBy: 'Sistema (Propietario / Admin)',
        grantedById: currentUser.id,
        grantedAt: now.toISOString(),
        startsAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        status: 'ACTIVE',
      };
      setPermissions((prev) => [adminPerm, ...prev]);
    }

    if (currentUser) {
      logAudit(
        'VIDEO_UPLOADED',
        'Video MP4 subido',
        newSong.title,
        `${currentUser.displayName} subió archivo MP4 "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB).`
      );
    }

    showToast(`Video "${newSong.title}" subido y listo para reproducir.`, 'success', 'Subida Completada');
    return newSong;
  };

  /**
   * Retrieves playback URL for song
   */
  const getVideoPlaybackUrl = async (songId: string): Promise<string | null> => {
    // 1. Check if song already has in-memory videoUrl
    const song = songs.find((s) => s.id === songId);
    if (song?.videoUrl) {
      return song.videoUrl;
    }
    // 2. Query videoService (IndexedDB / cache)
    return await getVideoSource(songId);
  };

  const updateSong = (songId: string, updates: Partial<Song>) => {
    if (!currentUser) return;
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, ...updates } : s))
    );
    const updated = songs.find((s) => s.id === songId);
    logAudit(
      'VIDEO_UPDATED',
      'Video actualizado',
      updates.title || updated?.title || 'Canción',
      `${currentUser.displayName} actualizó los metadatos de la canción.`
    );
    showToast('Canción actualizada correctamente.', 'success');
  };

  const deleteSong = (songId: string) => {
    if (!currentUser) return;
    const target = songs.find((s) => s.id === songId);
    if (!target) return;

    setSongs((prev) => prev.filter((s) => s.id !== songId));
    // Revoke any permissions for this song
    setPermissions((prev) =>
      prev.map((p) =>
        p.songId === songId
          ? {
              ...p,
              status: 'REVOKED' as PermissionStatus,
              revokedAt: new Date().toISOString(),
              revokedBy: currentUser.displayName,
              revocationReason: 'Video eliminado de la biblioteca',
            }
          : p
      )
    );

    logAudit(
      'VIDEO_DELETED',
      'Video eliminado',
      target.title,
      `${currentUser.displayName} eliminó permanentemente el video "${target.title}".`
    );

    showToast(`Canción "${target.title}" eliminada de la biblioteca.`, 'warning');
  };

  // User Management (Superadmin only)
  const createUser = (userData: { username: string; displayName: string; email: string; role: Role }) => {
    if (!currentUser || currentUser.role !== 'SUPERADMIN') return;
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: 'Nunca',
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit(
      'USER_CREATED',
      'Usuario creado',
      newUser.email,
      `${currentUser.displayName} creó la cuenta para ${newUser.displayName} con rol ${newUser.role}.`,
      newUser.displayName
    );
    showToast(`Usuario "${newUser.displayName}" creado exitosamente.`, 'success', 'Usuario Registrado');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    if (!currentUser || currentUser.role !== 'SUPERADMIN') return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    showToast('Datos de usuario actualizados.', 'success');
  };

  const toggleUserStatus = (userId: string) => {
    if (!currentUser || currentUser.role !== 'SUPERADMIN') return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Protection rule: Cannot disable self or main superadmin
    if (target.id === currentUser.id) {
      showToast('No puedes deshabilitar tu propia cuenta de Superadministrador.', 'error', 'Acción bloqueada');
      return;
    }

    const nextStatus: UserStatus = target.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));

    const action = nextStatus === 'ACTIVE' ? 'USER_ENABLED' : 'USER_DISABLED';
    const actionLabel = nextStatus === 'ACTIVE' ? 'Usuario habilitado' : 'Usuario deshabilitado';

    logAudit(
      action,
      actionLabel,
      target.email,
      `${currentUser.displayName} cambió estado de ${target.displayName} a ${nextStatus === 'ACTIVE' ? 'Habilitado' : 'Deshabilitado'}.`,
      target.displayName
    );

    showToast(
      `Cuenta de ${target.displayName} ahora está ${nextStatus === 'ACTIVE' ? 'Habilitada' : 'Deshabilitada'}.`,
      nextStatus === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const changeUserRole = (userId: string, newRole: Role) => {
    if (!currentUser || currentUser.role !== 'SUPERADMIN') return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.id === currentUser.id && newRole !== 'SUPERADMIN') {
      showToast('No puedes remover tus propios privilegios de Superadministrador.', 'error', 'Acción bloqueada');
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

    logAudit(
      'ROLE_CHANGED',
      'Rol modificado',
      target.email,
      `${currentUser.displayName} cambió el rol de ${target.displayName} de ${target.role} a ${newRole}.`,
      target.displayName
    );

    showToast(`Rol de ${target.displayName} actualizado a ${newRole}.`, 'success');
  };

  const resetUserPassword = (userId: string) => {
    if (!currentUser || currentUser.role !== 'SUPERADMIN') return;
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    logAudit(
      'PASSWORD_RESET',
      'Contraseña administrada',
      target.email,
      `${currentUser.displayName} restableció la clave de acceso temporal para ${target.displayName}.`,
      target.displayName
    );

    showToast(
      `Clase temporal generada para ${target.displayName}. Se requerirá cambio en próximo inicio.`,
      'info',
      'Clave Restablecida'
    );
  };

  const contextValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      switchRolePersona,
      login,
      logout,
      currentScreen,
      setCurrentScreen,
      users,
      songs,
      permissions,
      requests,
      auditLogs,
      activePlayerSong,
      activePlayerPermission,
      openPlayer,
      closePlayer,
      selectedSongDetail,
      openSongDetail,
      closeSongDetail,
      selectedSongIdsForRequest,
      toggleSongSelectionForRequest,
      selectAllEligibleSongs,
      clearSongSelectionForRequest,
      isRequestModalOpen,
      setIsRequestModalOpen,
      approvalTarget,
      openApprovalModal,
      closeApprovalModal,
      getUserSongAccessStatus,
      submitAccessRequest,
      approveSongAccess,
      rejectSongAccess,
      revokePermission,
      addSong,
      uploadSongWithFile,
      getVideoPlaybackUrl,
      updateSong,
      deleteSong,
      createUser,
      updateUser,
      toggleUserStatus,
      changeUserRole,
      resetUserPassword,
      toasts,
      showToast,
      removeToast,
    }),
    [
      currentUser,
      currentScreen,
      users,
      songs,
      permissions,
      requests,
      auditLogs,
      activePlayerSong,
      activePlayerPermission,
      selectedSongDetail,
      selectedSongIdsForRequest,
      isRequestModalOpen,
      approvalTarget,
      toasts,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
