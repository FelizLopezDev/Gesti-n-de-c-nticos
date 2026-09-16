import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ClerkProvider} from '@clerk/react';
import {esES} from '@clerk/localizations';
import App from './App.tsx';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const MissingClerkConfiguration = () => (
  <main className="min-h-screen bg-stone-100 flex items-center justify-center px-5">
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-xl">
      <h1 className="text-xl font-bold tracking-tight text-stone-900">Church Media Manager</h1>
      <p className="mt-3 text-sm text-stone-600">
        La autenticación aún no está configurada. Agrega la clave pública de Clerk para continuar.
      </p>
    </div>
  </main>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey} localization={esES}>
        <App />
      </ClerkProvider>
    ) : (
      <MissingClerkConfiguration />
    )}
  </StrictMode>,
);
