import React from 'react';
import {
  ShieldCheck,
  Lock,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { AccessStatus, PermissionStatus, RequestStatus, Role, UserStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
}

export const AccessStatusBadge: React.FC<{ status: AccessStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Disponible</span>
        </span>
      );
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Solicitud pendiente</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-orange-50 text-orange-800 border border-orange-200/80 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>Acceso expirado</span>
        </span>
      );
    case 'REVOKED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}
        >
          <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Acceso revocado</span>
        </span>
      );
    case 'NO_ACCESS':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-stone-100 text-stone-700 border border-stone-200 ${className}`}
        >
          <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>Sin acceso</span>
        </span>
      );
  }
};

export const PermissionStatusBadge: React.FC<{ status: PermissionStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Activo</span>
        </span>
      );
    case 'EXPIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          <span>Expirado</span>
        </span>
      );
    case 'REVOKED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
        >
          <Ban className="w-3.5 h-3.5 text-rose-600" />
          <span>Revocado</span>
        </span>
      );
  }
};

export const RequestStatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pendiente</span>
        </span>
      );
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Aprobada</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rechazada</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 ${className}`}
        >
          <Ban className="w-3.5 h-3.5 text-stone-500" />
          <span>Cancelada</span>
        </span>
      );
  }
};

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({ role, className = '' }) => {
  switch (role) {
    case 'SUPERADMIN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200 ${className}`}
        >
          <ShieldCheck className="w-3 h-3 text-purple-700" />
          <span>Superadministrador</span>
        </span>
      );
    case 'ADMIN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-900 border border-sky-200 ${className}`}
        >
          <UserCheck className="w-3 h-3 text-sky-700" />
          <span>Administrador</span>
        </span>
      );
    case 'USER':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 ${className}`}
        >
          <span>Usuario</span>
        </span>
      );
  }
};

export const UserStatusBadge: React.FC<{ status: UserStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  if (status === 'ACTIVE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        <span>Activo</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600 border border-stone-300 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
      <span>Deshabilitado</span>
    </span>
  );
};
