import "reflect-metadata";
import type { RequestHandler } from "express";
import {
  setControllerMetadata,
  type ControllerMetadata,
  addClassMiddleware,
} from "../metadata.js";

/**
 * Controller configuration options
 */
export interface ControllerOptions {
  path: string;
  controllers?: any[];
  middlewares?: RequestHandler[];
}

/**
 * Marks a class as an Express controller with optional route prefix and nested controllers
 *
 * @param prefixOrOptions - Route prefix string or configuration object
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * class UserController {}
 * ```
 *
 * @example
 * ```typescript
 * @Controller({
 *   path: '/api/v1',
 *   controllers: [UserController, PostController]
 * })
 * class ApiController {}
 * ```
 *
 * @example
 * ```typescript
 * @Controller({
 *   path: '/api',
 *   middlewares: [loggingMiddleware, corsMiddleware]
 * })
 * class ApiController {}
 * ```
 */
export function Controller(
  prefixOrOptions: string | ControllerOptions = ""
): ClassDecorator {
  return function (target: any) {
    // Handle both string and object inputs
    const options =
      typeof prefixOrOptions === "string"
        ? { path: prefixOrOptions, controllers: [] }
        : prefixOrOptions;

    // Ensure prefix starts with / if provided
    const normalizedPrefix =
      options.path && !options.path.startsWith("/")
        ? `/${options.path}`
        : options.path;

    // Store controller metadata
    setControllerMetadata(target, {
      prefix: normalizedPrefix,
      controllers: options.controllers || [],
    } as ControllerMetadata);

    // Register middlewares if provided in options
    if (options.middlewares && options.middlewares.length > 0) {
      for (const middleware of options.middlewares) {
        addClassMiddleware(target, middleware);
      }
    }

    return target;
  };
}
