// @ts-nocheck
import { describe, it, expect } from "vitest";
import { Controller } from "../../../src/decorators/controller.js";
import { getControllerMetadata, getMiddlewareMetadata } from "../../../src/metadata.js";

describe("@Controller Decorator", () => {
  it("should store controller metadata with string path", () => {
    @Controller("/users")
    class UserController {}

    const metadata = getControllerMetadata(UserController);
    expect(metadata).toBeDefined();
    expect(metadata?.prefix).toBe("/users");
    expect(metadata?.controllers).toEqual([]);
  });

  it("should normalize path without leading slash", () => {
    @Controller("api")
    class ApiController {}

    const metadata = getControllerMetadata(ApiController);
    expect(metadata?.prefix).toBe("/api");
  });

  it("should handle empty string path", () => {
    @Controller("")
    class RootController {}

    const metadata = getControllerMetadata(RootController);
    expect(metadata?.prefix).toBe("");
  });

  it("should handle no arguments", () => {
    @Controller()
    class DefaultController {}

    const metadata = getControllerMetadata(DefaultController);
    expect(metadata?.prefix).toBe("");
  });

  it("should store nested controllers from options", () => {
    class ChildController1 {}
    class ChildController2 {}

    @Controller({
      path: "/parent",
      controllers: [ChildController1, ChildController2],
    })
    class ParentController {}

    const metadata = getControllerMetadata(ParentController);
    expect(metadata?.controllers).toHaveLength(2);
    expect(metadata?.controllers).toContain(ChildController1);
    expect(metadata?.controllers).toContain(ChildController2);
  });

  it("should register middlewares from options", () => {
    const middleware1 = () => {};
    const middleware2 = () => {};

    @Controller({
      path: "/api",
      middlewares: [middleware1, middleware2],
    })
    class ApiController {}

    const middlewareMetadata = getMiddlewareMetadata(ApiController);
    expect(middlewareMetadata.classMiddlewares).toHaveLength(2);
    expect(middlewareMetadata.classMiddlewares).toContain(middleware1);
    expect(middlewareMetadata.classMiddlewares).toContain(middleware2);
  });

  it("should return target for decorator chaining", () => {
    const decorator = Controller("/test");
    class TestController {}

    const result = decorator(TestController);
    expect(result).toBe(TestController);
  });

  it("should handle options without nested controllers", () => {
    @Controller({ path: "/simple" })
    class SimpleController {}

    const metadata = getControllerMetadata(SimpleController);
    expect(metadata?.controllers).toEqual([]);
  });
});
