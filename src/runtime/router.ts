import type { Application } from "express";
import {
  getControllerMetadata,
  getRouteMetadata,
  getMethodMiddlewares,
} from "../metadata.js";
import { Container } from "../container/container.js";
import { createHandler } from "./handler.js";

/**
 * Register a controller and its routes with the Express app
 *
 * @param app - Express application instance
 * @param Controller - Controller class to register
 * @param isDev - Whether we're in development mode
 * @param container - DI container (optional)
 * @param parentPrefix - Parent controller prefix for nesting (optional)
 */
export function registerController(
  app: Application,
  Controller: any,
  isDev: boolean,
  container: Container = Container.getGlobal(),
  parentPrefix: string = ""
) {
  // Get controller metadata
  const controllerMetadata = getControllerMetadata(Controller);

  if (!controllerMetadata) {
    if (isDev) {
      console.warn(
        `[Express Plus] Class ${Controller.name} is not decorated with @Controller`
      );
    }
    return;
  }

  // Combine parent prefix with this controller's prefix
  const fullPrefix = parentPrefix + controllerMetadata.prefix;
  console.log("fullPrefix", fullPrefix);
  // Get route metadata
  const routes = getRouteMetadata(Controller);

  // Register routes if this controller has any
  if (routes.length > 0) {
    // Create controller instance with dependency injection
    console.log("[registerController] Creating instance of", Controller.name);
    const controllerInstance = container.get(Controller);

    // Register each route
    for (const route of routes) {
      const fullPath = `${fullPrefix}${route.path}`;
      const method = (controllerInstance as any)[route.propertyKey].bind(
        controllerInstance
      );

      // Get middlewares for this method (class + method middlewares)
      const middlewares = getMethodMiddlewares(Controller, route.propertyKey);

      // Create Express handler
      const handler = createHandler(
        controllerInstance,
        method,
        route.propertyKey
      );

      // Register with Express: apply middlewares first, then handler
      const handlers = [...middlewares, handler];
      app[route.method as keyof Application](fullPath, ...handlers);

      // Log in development mode
      if (isDev) {
        const middlewareInfo =
          middlewares.length > 0
            ? ` [${middlewares.length} middleware(s)]`
            : "";
        console.log(
          `[Route] ${route.method.toUpperCase()} ${fullPath}${middlewareInfo}`
        );
      }
    }
  }

  // Register nested controllers recursively
  if (
    controllerMetadata.controllers &&
    controllerMetadata.controllers.length > 0
  ) {
    for (const ChildController of controllerMetadata.controllers) {
      registerController(app, ChildController, isDev, container, fullPrefix);
    }
  }
}
