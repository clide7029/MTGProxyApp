export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public validation?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(errors: Array<{ field: string; message: string }>) {
    return new AppError('validation_error', 'Validation failed', 400, errors);
  }

  static unauthorized(message: string = 'Not authorized') {
    return new AppError('auth_error', message, 401);
  }

  static notFound(resource: string = 'Resource') {
    return new AppError('not_found', `${resource} not found`, 404);
  }

  static internal(message: string = 'An unexpected error occurred') {
    return new AppError('internal_server_error', message, 500);
  }

  static forbidden(message: string = 'Access denied') {
    return new AppError('forbidden', message, 403);
  }

  static badRequest(message: string = 'Invalid request') {
    return new AppError('bad_request', message, 400);
  }

  static conflict(message: string = 'Resource already exists') {
    return new AppError('conflict', message, 409);
  }
}