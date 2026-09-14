export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

export type AccessStatus = 'AVAILABLE' | 'NO_ACCESS' | 'PENDING' | 'EXPIRED' | 'REVOKED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type PermissionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string; // e.g. "04:25"
  durationSeconds: number;
  musicalKey: string; // e.g. "Sol Mayor (G)"
  tempoBpm: number;
  thumbnailGradient: string;
  description: string;
  recommendedUse: string; // e.g. "Apertura reunión Google Meet"
  uploadedAt: string;
  uploadedBy: string;
  isPrivate: boolean;
  videoUrl?: string; // Direct playable blob URL or source
  fileName?: string;
  fileSizeBytes?: number;
  thumbnailUrl?: string;
}

export interface Permission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  songId: string;
  songTitle: string;
  grantedBy: string; // Name of Admin/Superadmin
  grantedById: string;
  grantedAt: string; // ISO string
  startsAt: string; // ISO string
  expiresAt: string; // ISO string
  status: PermissionStatus;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
}

export interface RequestItem {
  songId: string;
  songTitle: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  grantedDuration?: string;
}

export interface AccessRequest {
  id: string; // e.g. "REQ-2026-081"
  userId: string;
  userName: string;
  userEmail: string;
  requestDate: string;
  meetingPurpose: string;
  meetingDate?: string;
  notes?: string;
  items: RequestItem[];
  overallStatus: RequestStatus;
}

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_DISABLED'
  | 'USER_ENABLED'
  | 'ROLE_CHANGED'
  | 'PASSWORD_RESET'
  | 'VIDEO_UPLOADED'
  | 'VIDEO_UPDATED'
  | 'VIDEO_DELETED'
  | 'REQUEST_CREATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'PERMISSION_REVOKED'
  | 'LOGIN_SUCCESS';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: AuditAction;
  actionLabel: string;
  affectedUser?: string;
  resourceName: string;
  details: string;
}

export type ScreenId =
  | 'dashboard'
  | 'library'
  | 'my-requests'
  | 'my-permissions'
  | 'admin-requests'
  | 'admin-permissions'
  | 'admin-songs'
  | 'admin-users'
  | 'admin-audit';
