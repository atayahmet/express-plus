// @ts-nocheck
import { describe, it, expect } from "vitest";
import { Get, Post, Put, Delete, Patch } from "../../../src/decorators/http-methods.js";
import { getRouteMetadata } from "../../../src/metadata.js";

describe("HTTP Method Decorators", () => {
  describe("@Get", () => {
    it("should register GET route with path", () => {
      class TestController {
        @Get("/users")
        getUsers() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        method: "get",
        path: "/users",
        propertyKey: "getUsers",
      });
    });

    it("should normalize path without leading slash", () => {
      class TestController {
        @Get("users")
        getUsers() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0].path).toBe("/users");
    });

    it("should handle empty path", () => {
      class TestController {
        @Get()
        index() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0].path).toBe("");
    });

    it("should handle root path", () => {
      class TestController {
        @Get("/")
        root() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0].path).toBe("/");
    });
  });

  describe("@Post", () => {
    it("should register POST route", () => {
      class TestController {
        @Post("/users")
        createUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0]).toEqual({
        method: "post",
        path: "/users",
        propertyKey: "createUser",
      });
    });
  });

  describe("@Put", () => {
    it("should register PUT route", () => {
      class TestController {
        @Put("/users/:id")
        updateUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0]).toEqual({
        method: "put",
        path: "/users/:id",
        propertyKey: "updateUser",
      });
    });
  });

  describe("@Delete", () => {
    it("should register DELETE route", () => {
      class TestController {
        @Delete("/users/:id")
        deleteUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0]).toEqual({
        method: "delete",
        path: "/users/:id",
        propertyKey: "deleteUser",
      });
    });
  });

  describe("@Patch", () => {
    it("should register PATCH route", () => {
      class TestController {
        @Patch("/users/:id")
        patchUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0]).toEqual({
        method: "patch",
        path: "/users/:id",
        propertyKey: "patchUser",
      });
    });
  });

  describe("Multiple routes on one controller", () => {
    it("should accumulate routes from multiple decorators", () => {
      class TestController {
        @Get("/users")
        getUsers() {}

        @Post("/users")
        createUser() {}

        @Get("/users/:id")
        getUser() {}

        @Put("/users/:id")
        updateUser() {}

        @Delete("/users/:id")
        deleteUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(5);
      expect(routes.map((r) => r.method)).toEqual(["get", "post", "get", "put", "delete"]);
    });
  });

  describe("Symbol property keys", () => {
    it("should support symbol property keys", () => {
      const testSymbol = Symbol("testMethod");

      class TestController {
        @Get("/symbol")
        [testSymbol]() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0].propertyKey).toBe(testSymbol);
    });
  });
});
