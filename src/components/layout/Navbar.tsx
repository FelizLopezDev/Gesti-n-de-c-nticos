import React, { useState } from 'react';
import {
  LogOut,
  ChevronDown,
  User as UserIcon,
  Video,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../common/Badge';
import { ScreenId } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentScreen,
    setCurrentScreen,
    logout,
    selectedSongIdsForRequest,
    setIsRequestModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  // Determine navigation items by role
  const getNavItems = (): { id: ScreenId; label: string }[] => {
    switch (currentUser.role) {
      case 'SUPERADMIN':
        return [
          { id: 'dashboard', label: 'Inicio' },
          { id: 'admin-requests', label: 'Solicitudes' },
          { id: 'admin-songs', label: 'Canciones' },
          { id: 'admin-permissions', label: 'Permisos' },
          { id: 'admin-users', label: 'Usuarios' },
          { id: 'admin-audit', label: 'Auditoría' },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Inicio' },
          { id: 'admin-requests', label: 'Solicitudes' },
          { id: 'admin-songs', label: 'Canciones' },
          { id: 'admin-permissions', label: 'Permisos' },
        ];
      case 'USER':
      default:
        return [
          { id: 'dashboard', label: 'Inicio' },
          { id: 'library', label: 'Biblioteca' },
          { id: 'my-requests', label: 'Mis solicitudes' },
          { id: 'my-permissions', label: 'Mis permisos' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200/90 shadow-xs">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Name - Minimalist text without black/yellow church icon */}
          <div
            className="cursor-pointer"
            onClick={() => setCurrentScreen('dashboard')}
          >
            <span className="text-base font-semibold tracking-tight text-stone-900">
              Church Media
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Multi-Request Button only for regular User */}
            {currentUser.role === 'USER' && selectedSongIdsForRequest.length > 0 && (
              <button
                id="open-request-drawer-btn"
                onClick={() => setIsRequestModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                Solicitar ({selectedSongIdsForRequest.length})
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-left"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-medium text-xs">
                  {currentUser.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <span className="text-xs font-medium text-stone-700 hidden sm:inline">
                  {currentUser.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
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
                    {currentUser.role === 'USER' ? (
                      <>
                        <button
                          id="menu-goto-library"
                          onClick={() => setCurrentScreen('library')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                        >
                          <Video className="w-4 h-4 text-stone-500" />
                          <span>Biblioteca</span>
                        </button>
                        <button
                          id="menu-goto-dashboard"
                          onClick={() => setCurrentScreen('dashboard')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                        >
                          <UserIcon className="w-4 h-4 text-stone-500" />
                          <span>Inicio</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          id="menu-goto-admin-songs"
                          onClick={() => setCurrentScreen('admin-songs')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                        >
                          <Video className="w-4 h-4 text-stone-500" />
                          <span>Canciones</span>
                        </button>
                        <button
                          id="menu-goto-dashboard"
                          onClick={() => setCurrentScreen('dashboard')}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg text-left"
                        >
                          <UserIcon className="w-4 h-4 text-stone-500" />
                          <span>Inicio</span>
                        </button>
                      </>
                    )}
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
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
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
