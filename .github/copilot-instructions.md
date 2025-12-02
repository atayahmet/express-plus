# Express-Plus - Copilot Instructions

## Project Overview

Express-Plus is a modern Express.js decorator framework using **legacy decorators** that provides declarative routing, dependency injection, nested controllers, and RESTful resource routing with universal TypeScript tooling support.

**Key characteristics:**
- Legacy decorators (`experimentalDecorators: true`)
- Plain object metadata storage (NOT Reflect.metadata API for custom data)
- Simple DI container with auto-resolution via `emitDecoratorMetadata`
- ESM modules with `.js` file extensions in imports
- Strict TypeScript with null safety

## Architecture

```
src/
├── index.ts                    # Public API exports
├── metadata.ts                 # Plain object metadata storage
├── decorators/                 # All decorator implementations
│   ├── controller.ts          # @Controller class decorator
│   ├── http-methods.ts        # @Get, @Post, @Put, @Delete, @Patch
│   ├── parameters.ts          # @Param, @Query, @Body, @Headers, @Req, @Res
│   ├── middleware.ts          # @UseMiddleware
│   └── resource.ts            # @Resource for RESTful routing
├── container/
│   └── container.ts           # DI container & @Injectable
├── errors/
│   └── http-exceptions.ts     # HTTP exception classes
└── runtime/
    ├── application.ts         # ExpressPlus app factory
    ├── router.ts              # Controller registration
    └── handler.ts             # Request handler creation
```

## Critical Patterns

### 1. Metadata Storage - Plain Objects (NOT Reflect.metadata)

**ALWAYS use plain object storage for custom metadata:**

```typescript
// Define metadata keys as constants
export const CONTROLLER_KEY = "__express_next_controller__";
export const ROUTES_KEY = "__express_next_routes__";
export const PARAMS_KEY = "__express_next_params__";

// Store directly on prototype
(target.prototype || target)[CONTROLLER_KEY] = metadata;

// Retrieve later
const metadata = (target.prototype || target)[CONTROLLER_KEY];
```

**DO NOT use:**
```typescript
// ❌ WRONG - Don't use Reflect.metadata for custom data
Reflect.defineMetadata(ROUTES_KEY, routes, target);
```

**Exception:** `Reflect.getMetadata("design:paramtypes", Class)` is used ONLY for TypeScript's automatic constructor parameter metadata (DI resolution with `tsc`).

### 2. Decorator Implementation - Always Return Target

**CRITICAL**: All class decorators MUST return the target:

```typescript
export function MyDecorator(): ClassDecorator {
  return function (target: any) {
    // ... store metadata ...
    
    return target; // ← REQUIRED for metadata emission
  };
}
```

**Without `return target`:**
- TypeScript won't emit `design:paramtypes` metadata
- DI will break
- Decorator chain breaks

### 3. Dependency Injection - Dual Mode

**Mode 1: Auto-resolution (tsc builds)**
```typescript
@Injectable()
class UserService {}

@Controller('/users')
class UserController {
  constructor(private userService: UserService) {}
  // Auto-injected via design:paramtypes
}
```

**Mode 2: Manual registration (tsx/esbuild)**
```typescript
const container = Container.getGlobal();
const userService = new UserService();
container.set(UserService, userService);
```

**Container implementation:**
- Singleton pattern via `Container.getGlobal()`
- Recursive dependency resolution
- Falls back gracefully when metadata unavailable

### 4. Nested Controllers

**Pattern:**
```typescript
@Controller({
  path: '/api/v1',
  controllers: [UserController, PostController]
})
class ApiV1Controller {}
```

**Registration (in `runtime/router.ts`):**
- Recursive traversal with prefix concatenation
- Parent prefix + child prefix = full route path
- Unlimited nesting depth supported
- Controllers are instantiated once via DI container (singleton behavior)
- Routes are registered at startup, not per-request

**Important:** Controllers in the `controllers` array are processed after the parent's routes, so:
```typescript
@Controller({ path: '/api', controllers: [UserController] })
class ApiController {
  @Get('/status')  // Registered first: GET /api/status
  status() {}
}

@Controller('/users')
class UserController {
  @Get()  // Registered second: GET /api/users
  list() {}
}
```

### 5. Middleware Composition

**Three application levels:**

1. **Controller options:**
```typescript
@Controller({ path: '/api', middlewares: [authMiddleware] })
```

2. **Class decorator:**
```typescript
@UseMiddleware(loggingMiddleware)
@Controller('/api')
```

3. **Method decorator:**
```typescript
@Get('/protected')
@UseMiddleware(authMiddleware)
protectedMethod() {}
```

**Execution order:** Class middlewares → Method middlewares → Handler

**Storage pattern:**
```typescript
{
  classMiddlewares: Function[],
  methodMiddlewares: Map<propertyKey, Function[]>
}
```

### 6. Resource Decorator

**Purpose:** Auto-generate RESTful CRUD routes

**Implementation:**
```typescript
@Resource('users')
class UsersResource {
  index() {}   // GET /users
  show() {}    // GET /users/:userId
  create() {}  // POST /users
  update() {}  // PUT /users/:userId
  patch() {}   // PATCH /users/:userId
  delete() {}  // DELETE /users/:userId
}
```

**Nested resources:**
```typescript
@Resource('blogs.comments.likes')
class BlogCommentsLikesResource {
  index() {}   // GET /blogs/:blogId/comments/:commentId/likes
  show() {}    // GET /blogs/:blogId/comments/:commentId/likes/:likeId
  create() {}  // POST /blogs/:blogId/comments/:commentId/likes
  update() {}  // PUT /blogs/:blogId/comments/:commentId/likes/:likeId
  patch() {}   // PATCH /blogs/:blogId/comments/:commentId/likes/:likeId
  delete() {}  // DELETE /blogs/:blogId/comments/:commentId/likes/:likeId
}
```

**Path generation:**
- Dot-separated path → nested segments with parameters
- Automatic parameter naming using `pluralize` library
- Custom parameters: `@Resource({ path: 'users', parameters: { users: 'userId' } })`

**Convention:** Method names MUST match: `index`, `show`, `create`, `update`, `patch`, `delete`

**Only methods that exist are registered** - you can implement a subset of CRUD operations.

### 7. Error Handling

**Exception hierarchy:**
```typescript
HttpException (base class)
  ├── BadRequestException (400)
  ├── UnauthorizedException (401)
  ├── ForbiddenException (403)
  ├── NotFoundException (404)
  ├── ConflictException (409)
  └── InternalServerErrorException (500)
```

**Usage:**
```typescript
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid email');
```

**Response format:**
```typescript
// Development mode
{ statusCode: 404, message: "Not found", stack: "..." }

// Production mode
{ statusCode: 404, message: "Not found" }
```

### 8. Parameter Resolution

**Request handler creation pattern (in `runtime/handler.ts`):**

1. **Parameter metadata is sorted by index** to ensure correct argument order
2. **Parameters are resolved from the request** based on decorator type:
   - `@Param('name')` → `req.params.name`
   - `@Query('name')` → `req.query.name`
   - `@Body()` → `req.body`
   - `@Headers('name')` → `req.get('name')`
   - `@Req()` → `req` (full request object)
   - `@Res()` → `res` (response object)
3. **Method is called with resolved arguments**: `method.apply(controllerInstance, args)`
4. **Result handling**:
   - If result is `undefined`, assumes response was sent manually
   - Otherwise, automatically calls `res.json(result)`
5. **Error handling**: All errors are passed to Express error handler via `next(error)`

## Code Style Guidelines

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase + suffix | `UserController`, `AuthService`, `UsersResource` |
| Methods | camelCase | `getUsers()`, `createPost()`, `index()`, `find()` |
| Decorators | PascalCase | `@Controller`, `@Injectable`, `@Resource` |
| Constants | SCREAMING_SNAKE_CASE | `CONTROLLER_KEY`, `ROUTES_KEY` |
| Files | kebab-case | `http-methods.ts`, `http-exceptions.ts` |

### TypeScript Patterns

**Type safety:**
- Explicit return types on public methods
- Interface definitions for options
- Type-only exports: `export type { ControllerOptions }`
- Generics in Container: `get<T>(key: any): T`

**Null safety:**
- `strictNullChecks: true` enabled
- Optional chaining: `options?.middlewares`
- Nullish coalescing: `options.path || ""`

**Function signatures:**
- Express types: `RequestHandler`, `Request`, `Response`, `NextFunction`, `Application`
- Decorator types: `ClassDecorator`, `MethodDecorator`, `ParameterDecorator`

### Import/Export Style

**ESM modules:**
```json
{ "type": "module" }
```

**File extensions in imports:**
```typescript
import { Controller } from "./decorators/controller.js";
```

**Barrel exports:**
```typescript
// src/decorators/index.ts
export * from "./controller.js";
export * from "./http-methods.js";
```

**Type-only exports:**
```typescript
export type { ControllerOptions, ResourceOptions };
```

### Documentation Style

**JSDoc on all public APIs:**
```typescript
/**
 * Brief description
 * 
 * @param paramName - Parameter description
 * @returns Return value description
 * 
 * @example
 * ```typescript
 * // Usage example
 * @Controller('/users')
 * class UserController {}
 * ```
 */
```

**Include:**
- Brief description (one line)
- Parameter descriptions with types
- Return value description
- At least one `@example` block with code
- `@throws` for error conditions (if applicable)

## TypeScript Configuration

### Required Settings

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,     // REQUIRED
    "emitDecoratorMetadata": true,      // REQUIRED for auto DI
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Library Build Settings

```json
{
  "declaration": true,          // Generate .d.ts
  "declarationMap": true,       // Type source maps
  "sourceMap": true,            // Runtime source maps
  "outDir": "./dist",
  "rootDir": "./src"
}
```

## Developer Workflows

### Build Commands

**Library development:**
```bash
npm run build    # Vite build + TypeScript declarations (dist/)
npm run dev      # TypeScript watch mode for live development
npm test         # Run Vitest test suite
```

**Example app (examples/basic):**
```bash
npm run dev      # tsx watch mode with hot reload
npm start        # Production mode (compile with tsc first)
```

### Directory Structure

```
express-plus/
├── src/                      # Library source
├── dist/                     # Compiled output (gitignored)
└── examples/
    └── basic/                # Reference implementation
        ├── src/
        │   ├── main.ts       # App bootstrap with manual DI wiring
        │   ├── controllers/  # Example controller patterns
        │   └── services/     # Example service patterns
        └── DECORATORS.md     # Decorator usage reference
```

## Build Tools Considerations

### TypeScript Compiler (tsc)
- ✅ Full decorator metadata emission
- ✅ Auto DI resolution works
- ✅ Recommended for library builds
- ❌ Slower than alternatives

### tsx/esbuild
- ✅ Fast development server
- ✅ Hot reload
- ❌ No `emitDecoratorMetadata` support
- ⚠️ **Requires manual DI registration** (see `examples/basic/src/main.ts`)

**Manual wiring pattern:**
```typescript
import { Container } from "express-plus";

const container = Container.getGlobal();
const userService = new UserService();
container.set(UserService, userService);

const userController = new UserController(userService);
container.set(UserController, userController);
```

### SWC
- ✅ Fast compilation
- ✅ Native decorator support
- Used via `@swc/core` for Vite builds

### Vite
- ✅ Optional plugin: `express-plus/vite`
- ✅ Configures SWC for decorators
- Development server support

## When Adding New Features

### New Decorator Checklist

1. **Define metadata interface:**
```typescript
export interface MyDecoratorMetadata {
  property: string;
  // ...
}
```

2. **Define metadata key constant:**
```typescript
export const MY_DECORATOR_KEY = "__express_next_my_decorator__";
```

3. **Create getter/setter helpers:**
```typescript
export function setMyDecoratorMetadata(target: any, meta: MyDecoratorMetadata) {
  (target.prototype || target)[MY_DECORATOR_KEY] = meta;
}

export function getMyDecoratorMetadata(target: any): MyDecoratorMetadata | undefined {
  return (target.prototype || target)[MY_DECORATOR_KEY];
}
```

4. **Implement decorator with return:**
```typescript
export function MyDecorator(options: MyDecoratorOptions): ClassDecorator {
  return function (target: any) {
    setMyDecoratorMetadata(target, { /* metadata */ });
    return target; // REQUIRED
  };
}
```

5. **Add to barrel export:**
```typescript
// src/decorators/index.ts
export * from "./my-decorator.js";
```

6. **Document with JSDoc and examples**

7. **Add integration to router/handler if needed**

### New HTTP Method Decorator

**Follow this pattern:**
```typescript
export function CustomMethod(path: string = ""): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    addRouteMetadata(target.constructor, {
      method: "custom-method",  // Express method name
      path: path.startsWith("/") ? path : `/${path}`,
      propertyKey,
    });
    return descriptor;
  };
}
```

### New Parameter Decorator

**Follow this pattern:**
```typescript
export function CustomParam(name?: string): ParameterDecorator {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    if (!propertyKey) return;

    addParameterMetadata(target.constructor, propertyKey, {
      type: "custom",
      name,
      index: parameterIndex,
    });
  };
}
```

**Handle in `createHandler`:**
```typescript
case "custom":
  args[param.index] = /* extract from request */;
  break;
```

## Testing Guidelines

### Container Reset Between Tests

```typescript
import { Container } from "express-plus";

beforeEach(() => {
  Container.reset(); // Clear all registrations
});
```

### Mock Services

```typescript
class MockUserService {
  getUsers() {
    return [{ id: 1, name: "Test" }];
  }
}

const container = Container.getGlobal();
container.set(UserService, new MockUserService());
```

### Test Controller Routes

```typescript
import express from "express";
import request from "supertest";
import { ExpressPlus } from "express-plus";

const app = express();
new ExpressPlus(app, {
  controllers: [TestController],
  isDev: false,
});

const response = await request(app)
  .get("/test")
  .expect(200);
```

## Common Pitfalls

### ❌ Using Reflect.metadata for custom data
```typescript
// WRONG
Reflect.defineMetadata("routes", routes, target);
```

### ✅ Use plain object storage
```typescript
// CORRECT
(target.prototype || target)[ROUTES_KEY] = routes;
```

---

### ❌ Forgetting to return target
```typescript
// WRONG - breaks metadata
export function MyDecorator(): ClassDecorator {
  return function (target: any) {
    // ... metadata logic ...
    // Missing return statement
  };
}
```

### ✅ Always return target
```typescript
// CORRECT
export function MyDecorator(): ClassDecorator {
  return function (target: any) {
    // ... metadata logic ...
    return target;
  };
}
```

---

### ❌ Hardcoding DI expectations
```typescript
// WRONG - assumes metadata always available
const params = Reflect.getMetadata("design:paramtypes", target);
return params.map(type => container.get(type));
```

### ✅ Graceful fallback
```typescript
// CORRECT
const params = Reflect.getMetadata("design:paramtypes", target);
if (!params) {
  console.warn(`[Express Plus] No metadata for ${target.name}`);
  return container.get(target); // Fallback to manual registration
}
```

---

### ❌ Missing .js extensions in imports
```typescript
// WRONG - breaks ESM
import { Controller } from "./decorators/controller";
```

### ✅ Include .js extensions
```typescript
// CORRECT
import { Controller } from "./decorators/controller.js";
```

## Performance Considerations

1. **Metadata caching:** Metadata stored once at decorator application time
2. **Handler reuse:** Controller instances created once and reused
3. **Route registration:** Happens once at startup, not per-request
4. **Development mode:** Auto-detects via `process.env.NODE_ENV`

## Security Best Practices

1. **Input validation:** Use parameter decorators, validate in methods
2. **Middleware composition:** Apply auth/validation at class or method level
3. **Error messages:** Generic in production, detailed in development
4. **Stack traces:** Only included in development mode

## Future Extension Points

1. **Global middleware registration** in ExpressPlus options
2. **Custom parameter resolvers** registry
3. **Interceptors** for pre/post-processing
4. **Route metadata introspection** API
5. **OpenAPI/Swagger** auto-generation from decorators

---

**Remember:** Express-Plus prioritizes simplicity, universal compatibility, and developer experience. Keep patterns consistent with existing codebase.
