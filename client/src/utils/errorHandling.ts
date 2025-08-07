import { AxiosError } from 'axios';
import { AppDispatch } from '../store/store';
import { showToast, setError } from '../store/slices/uiSlice';

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export class ApplicationError extends Error {
  code?: string;
  details?: Record<string, any>;
  status?: number;

  constructor(
    message: string,
    code?: string,
    details?: Record<string, any>,
    status?: number
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export const handleApiError = (error: unknown): ApplicationError => {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    const status = error.response?.status;
    
    return new ApplicationError(
      apiError?.message || getDefaultErrorMessage(status),
      apiError?.code || getErrorCodeFromStatus(status),
      apiError?.details || { status },
      status
    );
  }

  if (error instanceof Error) {
    return new ApplicationError(
      error.message,
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  return new ApplicationError(
    'An unexpected error occurred',
    ERROR_CODES.INTERNAL_ERROR
  );
};

export const handleError = (error: unknown): ApplicationError => {
  const appError = handleApiError(error);
  
  // Log error for debugging
  console.error('Error:', {
    message: appError.message,
    code: appError.code,
    details: appError.details,
    status: appError.status
  });

  return appError;
};

export const dispatchError = (dispatch: AppDispatch, error: unknown) => {
  const appError = handleApiError(error);
  
  dispatch(setError(appError.message));
  dispatch(
    showToast({
      message: appError.message,
      type: 'error'
    })
  );

  return appError;
};

const getDefaultErrorMessage = (status?: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'Invalid request parameters';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'Authentication required';
    case HTTP_STATUS.FORBIDDEN:
      return 'You do not have permission to perform this action';
    case HTTP_STATUS.NOT_FOUND:
      return 'The requested resource was not found';
    case HTTP_STATUS.CONFLICT:
      return 'The request conflicts with the current state';
    case HTTP_STATUS.INTERNAL_SERVER:
      return 'An internal server error occurred';
    default:
      return 'An unexpected error occurred';
  }
};

const getErrorCodeFromStatus = (status?: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_CODES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_CODES.AUTHENTICATION_ERROR;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_CODES.AUTHORIZATION_ERROR;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_CODES.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return ERROR_CODES.CONFLICT;
    case HTTP_STATUS.INTERNAL_SERVER:
      return ERROR_CODES.INTERNAL_ERROR;
    default:
      return ERROR_CODES.INTERNAL_ERROR;
  }
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
};