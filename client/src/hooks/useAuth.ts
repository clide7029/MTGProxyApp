import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  login,
  logout,
  register,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  type LoginCredentials,
  type RegisterData,
} from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await dispatch(login(credentials)).unwrap();
        dispatch(
          showToast({
            message: 'Welcome back!',
            type: 'success',
          })
        );
        navigate('/decks');
        return result;
      } catch (error) {
        dispatch(
          showToast({
            message: error instanceof Error ? error.message : 'Login failed',
            type: 'error',
          })
        );
        return false;
      }
    },
    [dispatch, navigate]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      try {
        const result = await dispatch(register(data)).unwrap();
        dispatch(
          showToast({
            message: 'Registration successful! Welcome!',
            type: 'success',
          })
        );
        navigate('/decks');
        return result;
      } catch (error) {
        dispatch(
          showToast({
            message: error instanceof Error ? error.message : 'Registration failed',
            type: 'error',
          })
        );
        return false;
      }
    },
    [dispatch, navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(
        showToast({
          message: 'Successfully logged out',
          type: 'success',
        })
      );
      navigate('/login');
    } catch (error) {
      dispatch(
        showToast({
          message: error instanceof Error ? error.message : 'Logout failed',
          type: 'error',
        })
      );
    }
  }, [dispatch, navigate]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
}