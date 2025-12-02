import type { RequestHandler } from "express";
import { addClassMiddleware, addMethodMiddleware } from "../metadata.js";

/**
 * UseMiddleware decorator - applies Express middleware to controller classes or methods
 *
 * When applied to a class: middleware is applied to all handler methods
 * When applied to a method: middleware is applied only to that specific handler
 *
 * @param middlewares - One or more Express middleware functions
 *
 * @example
 * // Class-level middleware
 * @Controller('/api')
 * @UseMiddleware(loggingMiddleware, authMiddleware)
 * class ApiController {
 *   @Get('/users')
 *   getUsers() { } // Will use logging and auth middlewares
 * }
 *
 * @example
 * // Method-level middleware
 * @Controller('/api')
 * class ApiController {
 *   @Get('/public')
 *   publicEndpoint() { } // No middleware
 *
 *   @Get('/protected')
 *   @UseMiddleware(authMiddleware)
 *   protectedEndpoint() { } // Only uses auth middleware
 * }
 *
 * @example
 * // Combined class and method middleware
 * @Controller('/api')
 * @UseMiddleware(loggingMiddleware)
 * class ApiController {
 *   @Get('/protected')
 *   @UseMiddleware(authMiddleware)
 *   protectedEndpoint() { } // Uses logging first, then auth
 * }
 */
export function UseMiddleware(...middlewares: RequestHandler[]): any {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    // Class decorator - no propertyKey means it's applied to a class
    if (!propertyKey) {
      for (const middleware of middlewares) {
        addClassMiddleware(target, middleware);
      }
      return target;
    }

    // Method decorator
    for (const middleware of middlewares) {
      addMethodMiddleware(target.constructor, propertyKey, middleware);
    }

    return descriptor;
  };
}
