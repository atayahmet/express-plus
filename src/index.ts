/**
 * Express Plus - Modern Express.js decorators with TypeScript and DI
 */
import { Resource } from "./decorators/resource.js";

// Re-export Express types (type-only)
export type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Application,
  Router,
  ErrorRequestHandler,
} from "express";

// Export decorators
export { Controller, type ControllerOptions } from "./decorators/controller.js";
export { Resource } from "./decorators/resource.js";
export { Get, Post, Put, Delete, Patch } from "./decorators/http-methods.js";
export {
  Param,
  Query,
  Body,
  Headers,
  Req,
  Res,
} from "./decorators/parameters.js";
export { UseMiddleware } from "./decorators/middleware.js";
export { Container } from "./container/container.js";

// Export runtime
export { ExpressPlus, type AppOptions } from "./runtime/application.js";

// Export DI container
export { Injectable } from "./container/container.js";

// Export HTTP exceptions
export {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "./errors/http-exceptions.js";

// Export metadata utilities (for advanced use)
export {
  getControllerMetadata,
  getRouteMetadata,
  getParameterMetadata,
} from "./metadata.js";
