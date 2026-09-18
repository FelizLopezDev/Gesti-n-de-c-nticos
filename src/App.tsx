import React, { useCallback, useEffect, useMemo } from 'react';
import { useSession, useUser } from '@clerk/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';
import { LoginScreen } from './components/screens/LoginScreen';
import { UserDashboard } from './components/screens/UserDashboard';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { SongDetailScreen } from './components/screens/SongDetailScreen';
import { VideoPlayerModal } from './components/player/VideoPlayerModal';
import { RequestAccessModal } from './components/screens/RequestAccessModal';
import { PermissionApprovalModal } from './components/screens/PermissionApprovalModal';
import { AdminRequestsScreen } from './components/screens/AdminRequestsScreen';
import { PermissionsScreen } from './components/screens/PermissionsScreen';
import { createSupabaseClient, isSupabaseConfigured } from './lib/supabase';

const MainLayout: React.FC = () => {
  const {
    currentScreen,
    selectedSongForDetail,
    closeSongDetail,
    isPlayerFullscreen,
  } = useApp();

  // Clerk gates this layout. Roles and authorization will be supplied by the
  // server-side profile layer in a later phase.
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <UserDashboard />;

      case 'library':
        return <LibraryScreen />;

      case 'my-requests':
        return <AdminRequestsScreen isUserViewOnly={true} />;

      case 'my-permissions':
        return <PermissionsScreen isUserViewOnly={true} />;

      case 'admin-requests':
      case 'admin-permissions':
      case 'permissions':
      case 'admin-songs':
      case 'admin-users':
      case 'admin-audit':
        return <UserDashboard />;

      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-amber-200 selection:text-stone-900 overflow-x-hidden">
      {/* Top Navigation - hidden in fullscreen */}
      {!isPlayerFullscreen && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {renderActiveScreen()}
      </main>

      {/* Global Modals & Overlays */}
      {selectedSongForDetail && (
        <SongDetailScreen song={selectedSongForDetail} onClose={closeSongDetail} />
      )}
      <VideoPlayerModal />
      <RequestAccessModal />
      <PermissionApprovalModal />
      <ToastContainer />
    </div>
  );
};

const MissingSupabaseConfiguration: React.FC = () => (
  <main className="min-h-screen bg-stone-100 flex items-center justify-center px-5">
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-xl">
      <h1 className="text-xl font-bold tracking-tight text-stone-900">Church Media Manager</h1>
      <p className="mt-3 text-sm text-stone-600">
        La conexión de datos aún no está configurada. Agrega la configuración pública de Supabase para continuar.
      </p>
    </div>
  </main>
);

const AuthenticatedApp: React.FC = () => {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const getClerkAccessToken = useCallback(
    async () => session?.getToken() ?? null,
    [session],
  );
  const supabase = useMemo(
    () => createSupabaseClient(getClerkAccessToken),
    [getClerkAccessToken],
  );

  useEffect(() => {
    if (import.meta.env.DEV && supabase) {
      void getClerkAccessToken().then((token) => {
        if (token) {
          console.info('Cliente de Supabase inicializado con una sesión autenticada de Clerk.');
        } else {
          console.warn('No se encontró una sesión de Clerk para la conexión de Supabase.');
        }
      }).catch(() => {
        console.warn('No se pudo preparar la sesión de Clerk para la conexión de Supabase.');
      });
    }
  }, [getClerkAccessToken, supabase]);

  if (!isUserLoaded || !isSessionLoaded || !user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <span className="text-sm text-stone-600">Cargando...</span>
      </div>
    );
  }

  if (!isSupabaseConfigured || !supabase) {
    return <MissingSupabaseConfiguration />;
  }

  return (
    <AppProvider authenticatedUser={user}>
      <MainLayout />
    </AppProvider>
  );
};

export default function App() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <span className="text-sm text-stone-600">Cargando...</span>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp />;
}
