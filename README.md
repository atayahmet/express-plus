# Express-Plus

Modern Express.js decorator framework with declarative routing and RESTful resource routing. Built with **legacy decorators** for universal TypeScript tooling compatibility.

## Features

- ✨ **Declarative Routing** - Clean decorator syntax for HTTP endpoints
- 🎯 **RESTful Resources** - Auto-generate CRUD routes with `@Resource`
- 📦 **Nested Controllers** - Hierarchical route organization
- 🚨 **HTTP Exceptions** - Built-in error classes with auto-formatting
- 🎨 **Middleware Support** - Class-level and method-level middleware
- ⚡ **Universal Compatibility** - Works with tsc, tsx, esbuild, Vite, SWC
- 🔄 **Environment Detection** - Auto dev/prod behavior

## Installation

```bash
npm install express-plus express
```

## Configuration

### TypeScript Configuration

Express-Plus requires **legacy decorators** (`experimentalDecorators`). Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true
  }
}
```

**Critical settings:**

- `experimentalDecorators: true` - Enables decorator syntax
- `emitDecoratorMetadata: true` - Enables automatic DI (tsc builds only)

## Usage Examples

### Basic Controller

Create a simple REST API:

```typescript
import { Controller, Get, Post, Param, Body } from "express-plus";

@Controller("/users")
export class UserController {
  @Get()
  getAllUsers() {
    return [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
  }

  @Get("/:id")
  getUser(@Param("id") id: string) {
    return { id, name: "Alice" };
  }

  @Post()
  createUser(@Body() data: { name: string }) {
    return { id: 3, name: data.name };
  }
}
```

### RESTful Resource Routing

Generate conventional CRUD routes automatically:

```typescript
import { Resource } from "express-plus";

@Resource("posts")
export class PostsResource {
  index() {
    // GET /posts
    return [{ id: 1, title: "Hello" }];
  }

  show(@Param("postId") id: string) {
    // GET /posts/:postId
    return { id, title: "Hello" };
  }

  create(@Body() data: any) {
    // POST /posts
    return { id: 2, ...data };
  }

  update(@Param("postId") id: string, @Body() data: any) {
    // PUT /posts/:postId
    return { id, ...data };
  }

  patch(@Param("postId") id: string, @Body() data: any) {
    // PATCH /posts/:postId
    return { id, ...data };
  }

  delete(@Param("postId") id: string) {
    // DELETE /posts/:postId
    return { deleted: true };
  }
}
```

**Nested resources:**

```typescript
@Resource("blogs.comments")
export class BlogCommentsResource {
  index(@Param("blogId") blogId: string) {
    // GET /blogs/:blogId/comments
  }

  show(@Param("blogId") blogId: string, @Param("commentId") commentId: string) {
    // GET /blogs/:blogId/comments/:commentId
  }
}
```

### Nested Controllers

Organize routes hierarchically:

```typescript
@Controller("/users")
class UserController {
  @Get()
  list() {
    return ["user1", "user2"];
  }
}

@Controller("/posts")
class PostController {
  @Get()
  list() {
    return ["post1", "post2"];
  }
}

// Group both under /api/v1
@Controller({
  path: "/api/v1",
  controllers: [UserController, PostController],
})
class ApiV1Controller {
  @Get("/status")
  status() {
    return { version: "1.0.0" };
  }
}

// Resulting routes:
// GET /api/v1/status
// GET /api/v1/users
// GET /api/v1/posts
```

### Middleware

Apply middleware at class or method level:

```typescript
import { UseMiddleware } from "express-plus";
import type { RequestHandler } from "express";

const authMiddleware: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const loggingMiddleware: RequestHandler = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

// Class-level middleware applies to all routes
@Controller("/admin")
@UseMiddleware(authMiddleware)
export class AdminController {
  @Get("/users")
  getUsers() {
    return ["admin1", "admin2"];
  }

  // Method-level middleware (executes after class middleware)
  @Get("/logs")
  @UseMiddleware(loggingMiddleware)
  getLogs() {
    return ["log1", "log2"];
  }
}
```

**Controller options middleware:**

```typescript
@Controller({
  path: "/api",
  middlewares: [corsMiddleware, bodyParser.json()],
})
export class ApiController {}
```

### HTTP Exceptions

Throw structured HTTP errors:

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from "express-plus";

@Controller("/users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("/:id")
  getUser(@Param("id") id: string) {
    if (!id) {
      throw new BadRequestException("User ID is required");
    }

    const user = this.userService.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  @Post()
  @UseMiddleware(authMiddleware)
  createUser(@Headers("authorization") auth: string) {
    if (!auth) {
      throw new UnauthorizedException("Missing authorization header");
    }
    // Create user logic
  }
}
```

**Available exception classes:**

- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `InternalServerErrorException` (500)

**Auto-formatted responses:**

Development mode:

```json
{
  "statusCode": 404,
  "message": "User not found",
  "stack": "Error: User not found\n    at UserController.getUser..."
}
```

Production mode:

```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### Parameter Decorators

Extract data from requests:

```typescript
import { Param, Query, Body, Headers, Req, Res } from "express-plus";
import type { Request, Response } from "express";

@Controller("/search")
export class SearchController {
  @Get("/:category")
  search(
    @Param("category") category: string,
    @Query("q") query: string,
    @Query("limit") limit: string,
    @Headers("user-agent") userAgent: string
  ) {
    return {
      category,
      query,
      limit: parseInt(limit) || 10,
      userAgent,
    };
  }

  @Post("/advanced")
  advancedSearch(@Body() filters: { tags: string[]; minScore: number }) {
    return { results: [], filters };
  }

  @Get("/raw")
  rawAccess(@Req() req: Request, @Res() res: Response) {
    // Manual response control
    res.status(200).json({ method: req.method });
  }
}
```

### Application Bootstrap

Create and start the Express application:

```typescript
import express from "express";
import { ExpressPlus, Container } from "express-plus";
import { UserController } from "./controllers/UserController.js";
import { UserService } from "./services/UserService.js";

// Manual DI wiring (for tsx/esbuild)
const container = Container.getGlobal();
const userService = new UserService();
container.set(UserService, userService);
const userController = new UserController(userService);
container.set(UserController, userController);

// Create Express app
const app = express();
app.use(express.json());

// Register controllers
new ExpressPlus(app, {
  controllers: [UserController],
  isDev: process.env.NODE_ENV !== "production",
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Using factory method:**

```typescript
const app = ExpressPlus.create({
  controllers: [UserController],
  isDev: true,
});

app.listen(3000);
```

### Multiple HTTP Methods

Handle multiple methods with one handler:

```typescript
@Controller("/data")
export class DataController {
  @Get("/resource")
  @Post("/resource")
  handleBoth(@Req() req: Request) {
    return {
      message: `Handled ${req.method} request`,
      timestamp: Date.now(),
    };
  }
}
```

## Contributing

Contributions are welcome! Please open issues and pull requests on the GitHub repository!

## License

MIT
