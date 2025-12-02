import { describe, it, expect } from "vitest";
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "../../../src/errors/http-exceptions.js";

describe("HTTP Exceptions", () => {
  describe("HttpException", () => {
    it("should create exception with status and message", () => {
      const exception = new HttpException(418, "I'm a teapot");

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(HttpException);
      expect(exception.status).toBe(418);
      expect(exception.message).toBe("I'm a teapot");
      expect(exception.name).toBe("HttpException");
    });

    it("should have stack trace", () => {
      const exception = new HttpException(500, "Server error");
      expect(exception.stack).toBeDefined();
    });
  });

  describe("BadRequestException", () => {
    it("should create 400 exception", () => {
      const exception = new BadRequestException("Invalid input");

      expect(exception.status).toBe(400);
      expect(exception.message).toBe("Invalid input");
      expect(exception.name).toBe("BadRequestException");
    });

    it("should use default message", () => {
      const exception = new BadRequestException();
      expect(exception.message).toBe("Bad Request");
    });

    it("should extend HttpException", () => {
      const exception = new BadRequestException();
      expect(exception).toBeInstanceOf(HttpException);
    });
  });

  describe("UnauthorizedException", () => {
    it("should create 401 exception", () => {
      const exception = new UnauthorizedException("Invalid token");

      expect(exception.status).toBe(401);
      expect(exception.message).toBe("Invalid token");
      expect(exception.name).toBe("UnauthorizedException");
    });

    it("should use default message", () => {
      const exception = new UnauthorizedException();
      expect(exception.message).toBe("Unauthorized");
    });
  });

  describe("ForbiddenException", () => {
    it("should create 403 exception", () => {
      const exception = new ForbiddenException("Insufficient permissions");

      expect(exception.status).toBe(403);
      expect(exception.message).toBe("Insufficient permissions");
      expect(exception.name).toBe("ForbiddenException");
    });

    it("should use default message", () => {
      const exception = new ForbiddenException();
      expect(exception.message).toBe("Forbidden");
    });
  });

  describe("NotFoundException", () => {
    it("should create 404 exception", () => {
      const exception = new NotFoundException("User not found");

      expect(exception.status).toBe(404);
      expect(exception.message).toBe("User not found");
      expect(exception.name).toBe("NotFoundException");
    });

    it("should use default message", () => {
      const exception = new NotFoundException();
      expect(exception.message).toBe("Not Found");
    });
  });

  describe("ConflictException", () => {
    it("should create 409 exception", () => {
      const exception = new ConflictException("Email already exists");

      expect(exception.status).toBe(409);
      expect(exception.message).toBe("Email already exists");
      expect(exception.name).toBe("ConflictException");
    });

    it("should use default message", () => {
      const exception = new ConflictException();
      expect(exception.message).toBe("Conflict");
    });
  });

  describe("InternalServerErrorException", () => {
    it("should create 500 exception", () => {
      const exception = new InternalServerErrorException("Database error");

      expect(exception.status).toBe(500);
      expect(exception.message).toBe("Database error");
      expect(exception.name).toBe("InternalServerErrorException");
    });

    it("should use default message", () => {
      const exception = new InternalServerErrorException();
      expect(exception.message).toBe("Internal Server Error");
    });
  });

  describe("Error throwing", () => {
    it("should be throwable", () => {
      expect(() => {
        throw new NotFoundException("Not found");
      }).toThrow(NotFoundException);
    });

    it("should be catchable as Error", () => {
      try {
        throw new BadRequestException("Bad request");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).status).toBe(400);
      }
    });

    it("should be catchable as HttpException", () => {
      try {
        throw new UnauthorizedException("Unauthorized");
      } catch (error) {
        if (error instanceof HttpException) {
          expect(error.status).toBe(401);
          expect(error.message).toBe("Unauthorized");
        }
      }
    });
  });
});
