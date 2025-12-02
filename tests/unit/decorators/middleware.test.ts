// @ts-nocheck
import { describe, it, expect } from "vitest";
import { UseMiddleware } from "../../../src/decorators/middleware.js";
import { getMiddlewareMetadata } from "../../../src/metadata.js";

describe("@UseMiddleware Decorator", () => {
  const middleware1 = () => {};
  const middleware2 = () => {};
  const middleware3 = () => {};

  describe("Class-level middleware", () => {
    it("should register single middleware on class", () => {
      @UseMiddleware(middleware1)
      class TestController {}

      const metadata = getMiddlewareMetadata(TestController);
      expect(metadata.classMiddlewares).toHaveLength(1);
      expect(metadata.classMiddlewares).toContain(middleware1);
    });

    it("should register multiple middlewares on class", () => {
      @UseMiddleware(middleware1, middleware2, middleware3)
      class TestController {}

      const metadata = getMiddlewareMetadata(TestController);
      expect(metadata.classMiddlewares).toHaveLength(3);
      expect(metadata.classMiddlewares[0]).toBe(middleware1);
      expect(metadata.classMiddlewares[1]).toBe(middleware2);
      expect(metadata.classMiddlewares[2]).toBe(middleware3);
    });

    it("should return target for decorator chaining", () => {
      const decorator = UseMiddleware(middleware1);
      class TestController {}

      const result = decorator(TestController);
      expect(result).toBe(TestController);
    });
  });

  describe("Method-level middleware", () => {
    it("should register single middleware on method", () => {
      class TestController {
        @UseMiddleware(middleware1)
        testMethod() {}
      }

      const metadata = getMiddlewareMetadata(TestController);
      const methodMiddlewares = metadata.methodMiddlewares.get("testMethod");

      expect(methodMiddlewares).toHaveLength(1);
      expect(methodMiddlewares).toContain(middleware1);
    });

    it("should register multiple middlewares on method", () => {
      class TestController {
        @UseMiddleware(middleware1, middleware2)
        testMethod() {}
      }

      const metadata = getMiddlewareMetadata(TestController);
      const methodMiddlewares = metadata.methodMiddlewares.get("testMethod");

      expect(methodMiddlewares).toHaveLength(2);
      expect(methodMiddlewares?.[0]).toBe(middleware1);
      expect(methodMiddlewares?.[1]).toBe(middleware2);
    });

    it("should handle multiple methods with different middlewares", () => {
      class TestController {
        @UseMiddleware(middleware1)
        method1() {}

        @UseMiddleware(middleware2)
        method2() {}
      }

      const metadata = getMiddlewareMetadata(TestController);

      expect(metadata.methodMiddlewares.get("method1")).toContain(middleware1);
      expect(metadata.methodMiddlewares.get("method2")).toContain(middleware2);
    });
  });

  describe("Combined class and method middleware", () => {
    it("should register both class and method middlewares", () => {
      @UseMiddleware(middleware1)
      class TestController {
        @UseMiddleware(middleware2)
        testMethod() {}
      }

      const metadata = getMiddlewareMetadata(TestController);

      expect(metadata.classMiddlewares).toContain(middleware1);
      expect(metadata.methodMiddlewares.get("testMethod")).toContain(middleware2);
    });

    it("should maintain correct order when using multiple decorators", () => {
      @UseMiddleware(middleware1, middleware2)
      class TestController {
        @UseMiddleware(middleware3)
        testMethod() {}
      }

      const metadata = getMiddlewareMetadata(TestController);

      expect(metadata.classMiddlewares[0]).toBe(middleware1);
      expect(metadata.classMiddlewares[1]).toBe(middleware2);
      expect(metadata.methodMiddlewares.get("testMethod")?.[0]).toBe(middleware3);
    });
  });
});
