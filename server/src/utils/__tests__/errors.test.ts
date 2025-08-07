import { jest, describe, expect, it } from '@jest/globals';
import { AppError } from '../errors';

describe('AppError', () => {
  it('should create a basic error', () => {
    const error = new AppError('test_error', 'Test message', 400);
    expect(error.code).toBe('test_error');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('should use default status code when not provided', () => {
    const error = new AppError('test_error', 'Test message');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('test_error');
    expect(error.message).toBe('Test message');
  });

  it('should create validation error', () => {
    const validationErrors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' }
    ];
    const error = AppError.validation(validationErrors);
    
    expect(error.code).toBe('validation_error');
    expect(error.statusCode).toBe(400);
    expect(error.validation).toEqual(validationErrors);
  });

  it('should create unauthorized error', () => {
    const error = AppError.unauthorized();
    expect(error.code).toBe('auth_error');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Not authorized');

    const customError = AppError.unauthorized('Custom auth message');
    expect(customError.message).toBe('Custom auth message');
  });

  it('should create not found error', () => {
    const error = AppError.notFound();
    expect(error.code).toBe('not_found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');

    const customError = AppError.notFound('User');
    expect(customError.message).toBe('User not found');
  });

  it('should create internal error', () => {
    const error = AppError.internal();
    expect(error.code).toBe('internal_server_error');
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('An unexpected error occurred');

    const customError = AppError.internal('Database error');
    expect(customError.message).toBe('Database error');
  });

  it('should create forbidden error', () => {
    const error = AppError.forbidden();
    expect(error.code).toBe('forbidden');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Access denied');

    const customError = AppError.forbidden('No permission');
    expect(customError.message).toBe('No permission');
  });

  it('should create bad request error', () => {
    const error = AppError.badRequest();
    expect(error.code).toBe('bad_request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid request');

    const customError = AppError.badRequest('Missing fields');
    expect(customError.message).toBe('Missing fields');
  });

  it('should create conflict error', () => {
    const error = AppError.conflict();
    expect(error.code).toBe('conflict');
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Resource already exists');

    const customError = AppError.conflict('Email in use');
    expect(customError.message).toBe('Email in use');
  });
});