import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const AuthLayout: React.FC = () => {
  // TODO: Replace with actual auth selector once auth slice is implemented
  const isAuthenticated = useAppSelector(() => false);

  if (isAuthenticated) {
    return <Navigate to="/decks" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            MTG Theme Generator
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Transform your decks with unique themes
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;