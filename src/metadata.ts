/**
 * Metadata storage for decorator information using simple object storage
 */

export const CONTROLLER_KEY = "__express_next_controller__";
export const ROUTES_KEY = "__express_next_routes__";
export const PARAMS_KEY = "__express_next_params__";
export const INJECTABLE_KEY = "__express__injectable__";
export const MIDDLEWARE_KEY = "__express_plus_middleware__";

/**
 * Controller metadata interface
 */
export interface ControllerMetadata {
  prefix: string;
  controllers?: any[]; // Nested child controllers
}

/**
 * Route metadata interface
 */
export interface RouteMetadata {
  method: string;
  path: string;
  propertyKey: string | symbol;
}

/**
 * Parameter metadata interface
 */
export interface ParameterMetadata {
  type: "param" | "query" | "body" | "headers" | "req" | "res";
  name?: string;
  index: number;
}

/**
 * Middleware metadata interface
 */
export interface MiddlewareMetadata {
  classMiddlewares: Function[]; // Middlewares applied to all class methods
  methodMiddlewares: Map<string | symbol, Function[]>; // Middlewares per method
}

/**
 * Get controller metadata from a class
 */
export function getControllerMetadata(
  target: any
): ControllerMetadata | undefined {
  console.log("getControllerMetadatax target", target.prototype);

  return (target.prototype || target)[CONTROLLER_KEY];
}

/**
 * Get all route metadata from a class
 */
export function getRouteMetadata(target: any): RouteMetadata[] {
  return (target.prototype || target)[ROUTES_KEY] || [];
}

/**
 * Get parameter metadata for a specific method
 */
export function getParameterMetadata(
  target: any,
  propertyKey: string | symbol
): ParameterMetadata[] {
  const key = `${PARAMS_KEY}_${String(propertyKey)}`;
  console.log("getParameterMetadata target", target, key);
  console.log("metadata 1", (target.prototype || target)[key]);
  console.log("metadata 2", target.prototype[key]);
  console.log("metadata 3", target[key]);
  return (target.prototype || target)[key] || [];
}

/**
 * Set controller metadata
 */
export function setControllerMetadata(
  target: any,
  metadata: ControllerMetadata
) {
  (target.prototype || target)[CONTROLLER_KEY] = metadata;
}

/**
 * Add route metadata
 */
export function addRouteMetadata(target: any, route: RouteMetadata) {
  const proto = target.prototype || target;
  if (!proto[ROUTES_KEY]) {
    proto[ROUTES_KEY] = [];
  }
  proto[ROUTES_KEY].push(route);
}

/**
 * Add parameter metadata
 */
export function addParameterMetadata(
  target: any,
  propertyKey: string | symbol,
  param: ParameterMetadata
) {
  const key = `${PARAMS_KEY}_${String(propertyKey)}`;
  const storage = target.prototype || target; // ✅ Normalize
  if (!storage[key]) {
    storage[key] = [];
  }
  storage[key].push(param);
}

/**
 * Get middleware metadata from a class
 */
export function getMiddlewareMetadata(target: any): MiddlewareMetadata {
  const proto = target.prototype || target;
  if (!proto[MIDDLEWARE_KEY]) {
    proto[MIDDLEWARE_KEY] = {
      classMiddlewares: [],
      methodMiddlewares: new Map(),
    };
  }
  return proto[MIDDLEWARE_KEY];
}

/**
 * Add class-level middleware
 */
export function addClassMiddleware(target: any, middleware: Function) {
  const metadata = getMiddlewareMetadata(target);
  metadata.classMiddlewares.push(middleware);
}

/**
 * Add method-level middleware
 */
export function addMethodMiddleware(
  target: any,
  propertyKey: string | symbol,
  middleware: Function
) {
  const metadata = getMiddlewareMetadata(target);
  const key = propertyKey;

  if (!metadata.methodMiddlewares.has(key)) {
    metadata.methodMiddlewares.set(key, []);
  }

  metadata.methodMiddlewares.get(key)!.push(middleware);
}

/**
 * Get all middlewares for a specific method (class + method middlewares)
 */
export function getMethodMiddlewares(
  target: any,
  propertyKey: string | symbol
): Function[] {
  const metadata = getMiddlewareMetadata(target);
  const methodMiddlewares = metadata.methodMiddlewares.get(propertyKey) || [];

  // Return class middlewares first, then method-specific middlewares
  return [...metadata.classMiddlewares, ...methodMiddlewares];
}
