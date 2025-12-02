// @ts-nocheck
import { describe, it, expect } from "vitest";
import {
  Param,
  Query,
  Body,
  Headers,
  Req,
  Res,
} from "../../../src/decorators/parameters.js";
import { getParameterMetadata } from "../../../src/metadata.js";

describe("Parameter Decorators", () => {
  describe("@Param", () => {
    it("should register parameter metadata", () => {
      class TestController {
        getUser(@Param("id") id: string) {}
      }

      const params = getParameterMetadata(TestController, "getUser");
      expect(params).toHaveLength(1);
      expect(params[0]).toEqual({
        type: "param",
        name: "id",
        index: 0,
      });
    });

    it("should handle multiple parameters", () => {
      class TestController {
        getPost(
          @Param("userId") userId: string,
          @Param("postId") postId: string
        ) {}
      }

      const params = getParameterMetadata(TestController, "getPost");
      expect(params).toHaveLength(2);
      expect(params.find((p) => p.index === 0)?.name).toBe("userId");
      expect(params.find((p) => p.index === 1)?.name).toBe("postId");
    });
  });

  describe("@Query", () => {
    it("should register query parameter metadata", () => {
      class TestController {
        getUsers(@Query("filter") filter: string) {}
      }

      const params = getParameterMetadata(TestController, "getUsers");
      expect(params[0]).toEqual({
        type: "query",
        name: "filter",
        index: 0,
      });
    });

    it("should handle optional query name", () => {
      class TestController {
        getUsers(@Query() query: any) {}
      }

      const params = getParameterMetadata(TestController, "getUsers");
      expect(params[0].type).toBe("query");
      expect(params[0].name).toBeUndefined();
    });
  });

  describe("@Body", () => {
    it("should register body parameter metadata", () => {
      class TestController {
        createUser(@Body() userData: any) {}
      }

      const params = getParameterMetadata(TestController, "createUser");
      expect(params[0]).toEqual({
        type: "body",
        index: 0,
      });
    });

    it("should handle body with specific property name", () => {
      class TestController {
        updateUser(@Body("name") name: string) {}
      }

      const params = getParameterMetadata(TestController, "updateUser");
      expect(params[0]).toEqual({
        type: "body",
        name: "name",
        index: 0,
      });
    });
  });

  describe("@Headers", () => {
    it("should register headers parameter metadata", () => {
      class TestController {
        checkAuth(@Headers("authorization") auth: string) {}
      }

      const params = getParameterMetadata(TestController, "checkAuth");
      expect(params[0]).toEqual({
        type: "headers",
        name: "authorization",
        index: 0,
      });
    });

    it("should handle headers without specific name", () => {
      class TestController {
        getHeaders(@Headers() headers: any) {}
      }

      const params = getParameterMetadata(TestController, "getHeaders");
      expect(params[0].type).toBe("headers");
      expect(params[0].name).toBeUndefined();
    });
  });

  describe("@Req", () => {
    it("should register request parameter metadata", () => {
      class TestController {
        handleRequest(@Req() req: any) {}
      }

      const params = getParameterMetadata(TestController, "handleRequest");
      expect(params[0]).toEqual({
        type: "req",
        index: 0,
      });
    });
  });

  describe("@Res", () => {
    it("should register response parameter metadata", () => {
      class TestController {
        handleResponse(@Res() res: any) {}
      }

      const params = getParameterMetadata(TestController, "handleResponse");
      expect(params[0]).toEqual({
        type: "res",
        index: 0,
      });
    });
  });

  describe("Mixed parameters", () => {
    it("should handle multiple different parameter types", () => {
      class TestController {
        complexMethod(
          @Param("id") id: string,
          @Query("filter") filter: string,
          @Body() body: any,
          @Headers("authorization") auth: string,
          @Req() req: any
        ) {}
      }

      const params = getParameterMetadata(TestController, "complexMethod");
      expect(params).toHaveLength(5);

      const sortedParams = params.sort((a, b) => a.index - b.index);
      expect(sortedParams[0].type).toBe("param");
      expect(sortedParams[1].type).toBe("query");
      expect(sortedParams[2].type).toBe("body");
      expect(sortedParams[3].type).toBe("headers");
      expect(sortedParams[4].type).toBe("req");
    });
  });
});
