import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const Layout: FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white shadow-inner py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          © {new Date().getFullYear()} MTG Proxy App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  return <Layout requireAuth>{children}</Layout>;
};

export const PublicRoute: FC<ProtectedRouteProps> = ({ children }) => {
  return <Layout>{children}</Layout>;
};