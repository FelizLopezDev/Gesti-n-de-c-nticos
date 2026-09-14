import React, { useState } from 'react';
import {
  Church,
  Shield,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Video,
  KeyRound,
  FileText,
  Users,
  History,
  Layers,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
import { ScreenId, Role } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentScreen,
    setCurrentScreen,
    logout,
    switchRolePersona,
    selectedSongIdsForRequest,
    setIsRequestModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  // Determine navigation items by role
  const getNavItems = (): { id: ScreenId; label: string; icon: React.ReactNode }[] => {
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return [
          { id: 'dashboard', label: 'Inicio', icon: <Church className="w-4 h-4" /> },
          { id: 'library', label: 'Biblioteca', icon: <Video className="w-4 h-4" /> },
          { id: 'admin-requests', label: 'Solicitudes', icon: <FileText className="w-4 h-4" /> },
          { id: 'admin-permissions', label: 'Permisos', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'admin-songs', label: 'Canciones', icon: <Layers className="w-4 h-4" /> },
          { id: 'admin-users', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
          { id: 'admin-audit', label: 'Auditoría', icon: <History className="w-4 h-4" /> },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Inicio', icon: <Church className="w-4 h-4" /> },
          { id: 'library', label: 'Biblioteca', icon: <Video className="w-4 h-4" /> },
          { id: 'admin-requests', label: 'Solicitudes', icon: <FileText className="w-4 h-4" /> },
          { id: 'admin-permissions', label: 'Permisos', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'admin-songs', label: 'Canciones', icon: <Layers className="w-4 h-4" /> },
        ];
      case 'USER':
      default:
        return [
          { id: 'dashboard', label: 'Inicio', icon: <Church className="w-4 h-4" /> },
          { id: 'library', label: 'Biblioteca', icon: <Video className="w-4 h-4" /> },
          { id: 'my-requests', label: 'Mis solicitudes', icon: <FileText className="w-4 h-4" /> },
          { id: 'my-permissions', label: 'Mis permisos', icon: <KeyRound className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/90 shadow-xs">
      {/* Top Prototype Testing Banner (Role Switcher for reviewers) */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-stone-200">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Prototipo UX / Rol activo:</span>
          </span>
          <span className="font-semibold text-white uppercase tracking-wider">{currentUser.role}</span>
          <span className="hidden sm:inline text-stone-400">({currentUser.displayName})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-stone-400 hidden md:inline">Simular vista como:</span>
          <div className="inline-flex rounded-md shadow-xs p-0.5 bg-stone-800 border border-stone-700">
            <button
              id="switch-to-user-btn"
              onClick={() => switchRolePersona('USER')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                currentUser.role === 'USER'
                  ? 'bg-stone-600 text-white font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Usuario
            </button>
            <button
              id="switch-to-admin-btn"
              onClick={() => switchRolePersona('ADMIN')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                currentUser.role === 'ADMIN'
                  ? 'bg-stone-600 text-white font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              id="switch-to-superadmin-btn"
              onClick={() => switchRolePersona('SUPERADMIN')}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                currentUser.role === 'SUPERADMIN'
                  ? 'bg-purple-800 text-white font-semibold'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Superadmin
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div
              id="app-brand-logo"
              className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs border border-stone-800 cursor-pointer"
              onClick={() => setCurrentScreen('dashboard')}
            >
              <Church className="w-5 h-5 text-amber-300" />
            </div>
            <div className="cursor-pointer" onClick={() => setCurrentScreen('dashboard')}>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 tracking-tight">Church Media Manager</h1>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Biblioteca y control de reproducción Meet</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Multi-Request Floating Cart if songs selected */}
            {selectedSongIdsForRequest.length > 0 && (
              <button
                id="open-request-drawer-btn"
                onClick={() => setIsRequestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-xs animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solicitar ({selectedSongIdsForRequest.length})</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-colors text-left"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-semibold text-xs border border-stone-300">
                  {currentUser.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-stone-900 leading-tight">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[11px] text-stone-500 leading-none mt-0.5">
                    {currentUser.role === 'SUPERADMIN'
                      ? 'Superadmin'
                      : currentUser.role === 'ADMIN'
                      ? 'Administrador'
                      : 'Usuario'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-fadeIn"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
                    <p className="text-xs text-stone-500 font-medium">Conectado como</p>
                    <p className="text-sm font-semibold text-stone-900 truncate mt-0.5">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                    <div className="mt-2">
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>

                  <div className="px-2 py-1.5">
                    <button
                      id="menu-goto-library"
                      onClick={() => setCurrentScreen('library')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                    >
                      <Video className="w-4 h-4 text-stone-500" />
                      <span>Explorar biblioteca</span>
                    </button>
                    <button
                      id="menu-goto-dashboard"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                    >
                      <UserIcon className="w-4 h-4 text-stone-500" />
                      <span>Mi panel principal</span>
                    </button>
                  </div>

                  <div className="border-t border-stone-100 px-2 pt-1.5">
                    <button
                      id="menu-logout-btn"
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation collapse */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
