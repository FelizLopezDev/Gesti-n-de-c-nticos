import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  Lock,
  X,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleBadge, UserStatusBadge } from '../common/Badge';
import { User, Role } from '../../types';

export const UserManagementScreen: React.FC = () => {
  const {
    users,
    currentUser,
    createUser,
    updateUser,
    toggleUserStatus,
    changeUserRole,
    resetUserPassword,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmingRoleChange, setConfirmingRoleChange] = useState<{ user: User; newRole: Role } | null>(null);
  const [confirmingStatusToggle, setConfirmingStatusToggle] = useState<User | null>(null);
  const [managingPasswordUser, setManagingPasswordUser] = useState<User | null>(null);

  // Create/Edit form fields
  const [formUsername, setFormUsername] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('USER');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setFormUsername('');
    setFormDisplayName('');
    setFormEmail('');
    setFormRole('USER');
    setEditingUser(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormDisplayName(user.displayName);
    setFormEmail(user.email);
    setFormRole(user.role);
    setIsCreateModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim() || !formEmail.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        displayName: formDisplayName.trim(),
        email: formEmail.trim(),
        role: formRole,
      });
    } else {
      createUser({
        username: formUsername.trim() || formEmail.split('@')[0],
        displayName: formDisplayName.trim(),
        email: formEmail.trim(),
        role: formRole,
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleConfirmRoleChange = () => {
    if (!confirmingRoleChange) return;
    changeUserRole(confirmingRoleChange.user.id, confirmingRoleChange.newRole);
    setConfirmingRoleChange(null);
  };

  const handleConfirmStatusToggle = () => {
    if (!confirmingStatusToggle) return;
    toggleUserStatus(confirmingStatusToggle.id);
    setConfirmingStatusToggle(null);
  };

  const handleConfirmResetPassword = () => {
    if (!managingPasswordUser) return;
    resetUserPassword(managingPasswordUser.id);
    setManagingPasswordUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                Superadministrador Exclusivo
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Users className="w-5 sm:w-6 h-5 sm:h-6 text-stone-700 shrink-0" />
              <span>Gestión de Usuarios</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {users.length} cuentas
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Control de identidades congregacionales. Crea colaboradores, asigna privilegios de
              administración, administra contraseñas o deshabilita cuentas en desuso.
            </p>
          </div>

          <button
            id="create-user-modal-btn"
            onClick={handleOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs shrink-0 cursor-pointer min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>

        {/* Protection alert */}
        <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            <strong>Protección de Cuentas Principales:</strong> Las cuentas con rol Superadministrador
            cuentan con protección contra auto-deshabilitación y bloqueo de privilegios.
          </span>
        </div>

        {/* Filters and search */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, correo institucional o usuario..."
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 text-stone-700"
            >
              <option value="ALL">Todos los roles</option>
              <option value="SUPERADMIN">Superadministradores</option>
              <option value="ADMIN">Administradores</option>
              <option value="USER">Usuarios estándar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nombre / Correo</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Estado de Cuenta</th>
                <th className="py-3.5 px-4">Fecha Creación</th>
                <th className="py-3.5 px-4 text-right">Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredUsers.map((user) => {
                const isSuperAdminAccount = user.role === 'SUPERADMIN';
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Display name and email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                          {user.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>{user.displayName}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded font-medium">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3.5 px-4 font-mono text-stone-700">{user.username}</td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <UserStatusBadge status={user.status} />
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Change Role User <-> Admin button */}
                        {!isSuperAdminAccount && (
                          <button
                            id={`change-role-btn-${user.id}`}
                            onClick={() =>
                              setConfirmingRoleChange({
                                user,
                                newRole: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                              })
                            }
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                            title={`Cambiar a ${user.role === 'ADMIN' ? 'Usuario' : 'Administrador'}`}
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          id={`edit-user-btn-${user.id}`}
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Reset password button */}
                        <button
                          id={`reset-pwd-btn-${user.id}`}
                          onClick={() => setManagingPasswordUser(user)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                          title="Administrar contraseña"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Enable / Disable toggle button (Protected on self and superadmin) */}
                        {!isSuperAdminAccount && !isSelf && (
                          <button
                            id={`toggle-status-btn-${user.id}`}
                            onClick={() => setConfirmingStatusToggle(user)}
                            className={`p-1.5 rounded-md transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'ACTIVE' ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                          >
                            {user.status === 'ACTIVE' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-stone-700" />
                <span>{editingUser ? 'Editar Datos de Usuario' : 'Crear Nueva Cuenta'}</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Ej. Andrés Morales"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Correo Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="andres.morales@iglesia.org"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nombre de Usuario Único
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="andres.morales"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Rol en el Sistema *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                >
                  <option value="USER">Usuario (Explora biblioteca y solicita)</option>
                  <option value="ADMIN">Administrador (Aprueba/Rechaza y gestiona canciones)</option>
                  <option value="SUPERADMIN">Superadministrador (Acceso total y usuarios)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Dialog */}
      {confirmingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-stone-700" />
              <span>Confirmar Cambio de Rol</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              ¿Deseas cambiar el rol de{' '}
              <strong className="text-stone-900">{confirmingRoleChange.user.displayName}</strong> de{' '}
              <span className="font-semibold">{confirmingRoleChange.user.role}</span> a{' '}
              <span className="font-semibold text-stone-900">{confirmingRoleChange.newRole}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmingRoleChange(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                id="confirm-role-change-btn"
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
              >
                Confirmar Cambio de Rol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle (Enable/Disable) Confirmation Dialog */}
      {confirmingStatusToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>
                {confirmingStatusToggle.status === 'ACTIVE'
                  ? 'Deshabilitar Cuenta'
                  : 'Habilitar Cuenta'}
              </span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {confirmingStatusToggle.status === 'ACTIVE' ? (
                <>
                  ¿Confirmas la inhabilitación del acceso de{' '}
                  <strong className="text-stone-900">{confirmingStatusToggle.displayName}</strong>?
                  El usuario no podrá iniciar sesión ni reproducir videos hasta que se restablezca.
                </>
              ) : (
                <>
                  ¿Deseas reactivar la cuenta de{' '}
                  <strong className="text-stone-900">{confirmingStatusToggle.displayName}</strong>?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmingStatusToggle(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                id="confirm-toggle-status-btn"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs ${
                  confirmingStatusToggle.status === 'ACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {confirmingStatusToggle.status === 'ACTIVE'
                  ? 'Deshabilitar Cuenta'
                  : 'Habilitar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Management Dialog */}
      {managingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-stone-700" />
              <span>Administrar Contraseña de Usuario</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Vas a restablecer la clave de acceso de{' '}
              <strong className="text-stone-900">{managingPasswordUser.displayName}</strong>. Se
              generará una contraseña temporal segura que el usuario deberá renovar en su próximo
              inicio de sesión.
            </p>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
              <span className="text-stone-500 block">Clave provisional sugerida:</span>
              <span className="font-mono font-bold text-stone-800 text-sm">Iglesia$2026#Temp</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setManagingPasswordUser(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                id="confirm-reset-pwd-btn"
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
              >
                Aplicar Restablecimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
