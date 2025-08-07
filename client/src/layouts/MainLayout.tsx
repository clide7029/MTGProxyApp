import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Navbar from '../components/Navbar';

const MainLayout: React.FC = () => {
  // TODO: Replace with actual auth selector once auth slice is implemented
  const isAuthenticated = useAppSelector(() => false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Processing status indicator */}
        <div className="mb-4">
          {useAppSelector(state => state.processing.batchStatus).map(batch => (
            <div
              key={batch.batchId}
              className={`p-2 mb-2 rounded ${
                batch.status === 'error'
                  ? 'bg-red-100 text-red-700'
                  : batch.status === 'complete'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {batch.status === 'processing' && (
                <div className="h-1 bg-blue-200 rounded">
                  <div
                    className="h-1 bg-blue-500 rounded transition-all duration-500"
                    style={{ width: `${(batch.completed / batch.total) * 100}%` }}
                  />
                </div>
              )}
              <span className="text-sm">
                {batch.status === 'processing'
                  ? `Processing: ${batch.completed}/${batch.total}`
                  : batch.status === 'complete'
                  ? 'Complete'
                  : 'Error'}
              </span>
            </div>
          ))}
        </div>

        {/* Error notifications */}
        {useAppSelector(state => state.ui.error) && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {useAppSelector(state => state.ui.error)}
            <button
              className="ml-4 text-sm underline"
              onClick={() => {/* TODO: Add error clear action */}}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main content */}
        <div className="bg-white rounded-lg shadow p-6">
          <Outlet />
        </div>
      </main>

      {/* Loading overlay */}
      {useAppSelector(state => state.ui.isLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};

export default MainLayout;