import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store/Provider';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DeckListPage from './pages/deck/DeckListPage';
import DeckDetailPage from './pages/deck/DeckDetailPage';
import CreateDeckPage from './pages/deck/CreateDeckPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// TODO: Replace with actual auth check from store
const isAuthenticated = true;

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const AuthRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return !isAuthenticated ? element : <Navigate to="/decks" replace />;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={<AuthRoute element={<LoginPage />} />}
            />
            <Route
              path="/register"
              element={<AuthRoute element={<RegisterPage />} />}
            />
          </Route>

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route path="/decks">
              <Route
                index
                element={<PrivateRoute element={<DeckListPage />} />}
              />
              <Route
                path="new"
                element={<PrivateRoute element={<CreateDeckPage />} />}
              />
              <Route
                path=":id"
                element={<PrivateRoute element={<DeckDetailPage />} />}
              />
            </Route>

            {/* Redirect root to decks */}
            <Route path="/" element={<Navigate to="/decks" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/decks" replace />} />
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;