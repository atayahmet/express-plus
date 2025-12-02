import { describe, it, expect, beforeEach } from "vitest";
import {
  CONTROLLER_KEY,
  ROUTES_KEY,
  PARAMS_KEY,
  MIDDLEWARE_KEY,
  getControllerMetadata,
  setControllerMetadata,
  getRouteMetadata,
  addRouteMetadata,
  getParameterMetadata,
  addParameterMetadata,
  getMiddlewareMetadata,
  addClassMiddleware,
  addMethodMiddleware,
  getMethodMiddlewares,
} from "../../src/metadata.js";

describe("Metadata Storage", () => {
  class TestController {}

  beforeEach(() => {
    // Clear any existing metadata
    delete ((TestController.prototype as any) || TestController)[
      CONTROLLER_KEY
    ];
    delete ((TestController.prototype as any) || TestController)[ROUTES_KEY];
  });

  describe("Controller Metadata", () => {
    it("should store and retrieve controller metadata", () => {
      setControllerMetadata(TestController, {
        prefix: "/test",
        controllers: [],
      });

      const metadata = getControllerMetadata(TestController);
      expect(metadata).toEqual({
        prefix: "/test",
        controllers: [],
      });
    });

    it("should return undefined for controller without metadata", () => {
      const metadata = getControllerMetadata(TestController);
      expect(metadata).toBeUndefined();
    });

    it("should store nested controllers", () => {
      class ChildController {}

      setControllerMetadata(TestController, {
        prefix: "/parent",
        controllers: [ChildController],
      });

      const metadata = getControllerMetadata(TestController);
      expect(metadata?.controllers).toContain(ChildController);
    });
  });

  describe("Route Metadata", () => {
    it("should add and retrieve route metadata", () => {
      addRouteMetadata(TestController, {
        method: "get",
        path: "/users",
        propertyKey: "getUsers",
      });

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        method: "get",
        path: "/users",
        propertyKey: "getUsers",
      });
    });

    it("should return empty array for class without routes", () => {
      const routes = getRouteMetadata(TestController);
      expect(routes).toEqual([]);
    });

    it("should accumulate multiple routes", () => {
      addRouteMetadata(TestController, {
        method: "get",
        path: "/users",
        propertyKey: "getUsers",
      });
      addRouteMetadata(TestController, {
        method: "post",
        path: "/users",
        propertyKey: "createUser",
      });

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(2);
    });
  });

  describe("Parameter Metadata", () => {
    const propertyKey = "getUser";

    beforeEach(() => {
      delete ((TestController.prototype as any) || TestController)[
        `${PARAMS_KEY}_${propertyKey}`
      ];
    });

    it("should add and retrieve parameter metadata", () => {
      addParameterMetadata(TestController, propertyKey, {
        type: "param",
        name: "id",
        index: 0,
      });

      const params = getParameterMetadata(TestController, propertyKey);
      expect(params).toHaveLength(1);
      expect(params[0]).toEqual({
        type: "param",
        name: "id",
        index: 0,
      });
    });

    it("should return empty array for method without parameters", () => {
      const params = getParameterMetadata(TestController, "nonexistent");
      expect(params).toEqual([]);
    });

    it("should accumulate multiple parameters", () => {
      addParameterMetadata(TestController, propertyKey, {
        type: "param",
        name: "id",
        index: 0,
      });
      addParameterMetadata(TestController, propertyKey, {
        type: "query",
        name: "filter",
        index: 1,
      });
      console.log("TestController", TestController.prototype);

      const params = getParameterMetadata(TestController, propertyKey);
      expect(params).toHaveLength(2);
    });

    it("should handle symbol property keys", () => {
      const symbolKey = Symbol("testMethod");

      addParameterMetadata(TestController, symbolKey, {
        type: "body",
        index: 0,
      });

      const params = getParameterMetadata(TestController, symbolKey);
      expect(params).toHaveLength(1);
    });
  });

  describe("Middleware Metadata", () => {
    const methodKey = "testMethod";
    const middleware1 = () => {};
    const middleware2 = () => {};

    beforeEach(() => {
      delete ((TestController.prototype as any) || TestController)[
        MIDDLEWARE_KEY
      ];
    });

    it("should initialize middleware metadata", () => {
      const metadata = getMiddlewareMetadata(TestController);

      expect(metadata).toHaveProperty("classMiddlewares");
      expect(metadata).toHaveProperty("methodMiddlewares");
      expect(metadata.classMiddlewares).toEqual([]);
      expect(metadata.methodMiddlewares).toBeInstanceOf(Map);
    });

    it("should add class-level middleware", () => {
      addClassMiddleware(TestController, middleware1);
      addClassMiddleware(TestController, middleware2);

      const metadata = getMiddlewareMetadata(TestController);
      expect(metadata.classMiddlewares).toHaveLength(2);
      expect(metadata.classMiddlewares).toContain(middleware1);
      expect(metadata.classMiddlewares).toContain(middleware2);
    });

    it("should add method-level middleware", () => {
      addMethodMiddleware(TestController, methodKey, middleware1);
      addMethodMiddleware(TestController, methodKey, middleware2);

      const metadata = getMiddlewareMetadata(TestController);
      const methodMiddlewares = metadata.methodMiddlewares.get(methodKey);

      expect(methodMiddlewares).toHaveLength(2);
      expect(methodMiddlewares).toContain(middleware1);
      expect(methodMiddlewares).toContain(middleware2);
    });

    it("should get combined class and method middlewares", () => {
      addClassMiddleware(TestController, middleware1);
      addMethodMiddleware(TestController, methodKey, middleware2);

      const middlewares = getMethodMiddlewares(TestController, methodKey);
      console.log("middlewares", middlewares);
      expect(middlewares).toHaveLength(2);
      expect(middlewares[0]).toBe(middleware1);
      expect(middlewares[1]).toBe(middleware2);
    });

    it("should return only class middlewares when method has none", () => {
      addClassMiddleware(TestController, middleware1);

      const middlewares = getMethodMiddlewares(TestController, methodKey);

      expect(middlewares).toHaveLength(1);
      expect(middlewares[0]).toBe(middleware1);
    });

    it("should return empty array when no middlewares exist", () => {
      const middlewares = getMethodMiddlewares(TestController, methodKey);
      expect(middlewares).toEqual([]);
    });
  });
});
