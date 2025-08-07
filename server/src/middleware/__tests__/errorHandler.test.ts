import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { errorHandler, notFoundHandler } from '../errorHandler';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';

// Skip MongoDB setup for these tests as they don't need database access
jest.mock('../../test/setup', () => ({}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn().mockReturnThis() as jest.MockedFunction<Response['json']>
    };
    nextFunction = jest.fn();
  });

  it('should handle AppError correctly', async () => {
    const error = new AppError('test_error', 'Test error message', 400);

    await errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'test_error',
        message: 'Test error message'
      }
    });
  });

  it('should handle unexpected errors as internal server error', async () => {
    const error = new Error('Unexpected error');

    await errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'internal_server_error',
        message: 'An unexpected error occurred'
      }
    });
  });

  it('should include validation errors when present', async () => {
    const error = new AppError(
      'validation_error',
      'Validation failed',
      400,
      [{ field: 'email', message: 'Invalid email format' }]
    );

    await errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'validation_error',
        message: 'Validation failed',
        validation: [
          { field: 'email', message: 'Invalid email format' }
        ]
      }
    });
  });
});

describe('Not Found Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn().mockReturnThis() as jest.MockedFunction<Response['json']>
    };
    nextFunction = jest.fn();
  });

  it('should create a not found error and pass it to next', () => {
    notFoundHandler(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction as unknown as NextFunction
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
    const error = nextFunction.mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });
});