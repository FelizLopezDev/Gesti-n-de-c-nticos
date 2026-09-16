import React from 'react';
import { SignIn } from '@clerk/react';

export const LoginScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-8 sm:py-12 px-5 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Church Media Manager</h1>
      </div>
      <div className="w-full max-w-md mx-auto flex justify-center">
        <SignIn />
      </div>
    </div>
  );
};
