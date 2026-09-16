import React from 'react';
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
import { SongManagementScreen } from './components/screens/SongManagementScreen';
import { UserManagementScreen } from './components/screens/UserManagementScreen';
import { AuditLogScreen } from './components/screens/AuditLogScreen';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentScreen,
    selectedSongForDetail,
    closeSongDetail,
    isPlayerFullscreen,
  } = useApp();

  // If user is not logged in or screen is explicitly 'login', show LoginScreen
  if (!currentUser || currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col justify-center">
        <LoginScreen />
        <ToastContainer />
      </div>
    );
  }

  // Render active screen based on navigation and role permissions
  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <UserDashboard />;

      case 'library':
        if (currentUser.role !== 'USER') {
          return <SongManagementScreen />;
        }
        return <LibraryScreen />;

      case 'my-requests':
        if (currentUser.role !== 'USER') {
          return <AdminRequestsScreen />;
        }
        return <AdminRequestsScreen isUserViewOnly={true} />;

      case 'my-permissions':
        if (currentUser.role !== 'USER') {
          return <PermissionsScreen />;
        }
        return <PermissionsScreen isUserViewOnly={true} />;

      case 'admin-requests':
        if (currentUser.role === 'USER') {
          return <AdminRequestsScreen isUserViewOnly={true} />;
        }
        return <AdminRequestsScreen />;

      case 'admin-permissions':
      case 'permissions':
        if (currentUser.role === 'USER') {
          return <PermissionsScreen isUserViewOnly={true} />;
        }
        return <PermissionsScreen />;

      case 'admin-songs':
        if (currentUser.role === 'USER') {
          return <LibraryScreen />;
        }
        return <SongManagementScreen />;

      case 'admin-users':
        if (currentUser.role !== 'SUPERADMIN') {
          return <UserDashboard />;
        }
        return <UserManagementScreen />;

      case 'admin-audit':
        if (currentUser.role !== 'SUPERADMIN') {
          return <UserDashboard />;
        }
        return <AuditLogScreen />;

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

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
