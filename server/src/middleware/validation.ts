import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation error response
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Schema validation middleware
 */
export function validateSchema(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({ errors });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validation middleware factory
 */
export function createValidationMiddleware() {
  return {
    /**
     * Validate request body against schema
     */
    validateBody: (schema: z.ZodSchema) => validateSchema(schema),

    /**
     * Validate request query parameters against schema
     */
    validateQuery: (schema: z.ZodSchema) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          req.query = await schema.parseAsync(req.query);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors: ValidationError[] = error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            }));
            res.status(400).json({ errors });
          } else {
            next(error);
          }
        }
      };
    },

    /**
     * Validate request parameters against schema
     */
    validateParams: (schema: z.ZodSchema) => {
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          req.params = await schema.parseAsync(req.params);
          next();
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errors: ValidationError[] = error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            }));
            res.status(400).json({ errors });
          } else {
            next(error);
          }
        }
      };
    },
  };
}