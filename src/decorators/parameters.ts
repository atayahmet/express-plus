import { addParameterMetadata, type ParameterMetadata } from "../metadata.js";

/**
 * Create a parameter decorator for a specific type
 */
function createParameterDecorator(
  type: ParameterMetadata["type"],
  name?: string
): ParameterDecorator {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    if (!propertyKey) {
      throw new Error("Parameter decorators can only be used on class methods");
    }

    // Add this parameter
    addParameterMetadata(target, propertyKey, {
      type,
      name,
      index: parameterIndex,
    });
  };
}

/**
 * Inject a route parameter by name
 *
 * @param name - Parameter name from the route path
 *
 * @example
 * ```typescript
 * @Get('/:id')
 * getUser(@Param('id') id: string) {
 *   return users.find(u => u.id === id);
 * }
 * ```
 */
export function Param(name: string): ParameterDecorator {
  return createParameterDecorator("param", name);
}

/**
 * Inject a query parameter by name
 *
 * @param name - Query parameter name
 *
 * @example
 * ```typescript
 * @Get()
 * searchUsers(@Query('search') search: string) {
 *   return users.filter(u => u.name.includes(search));
 * }
 * ```
 */
export function Query(name: string): ParameterDecorator {
  return createParameterDecorator("query", name);
}

/**
 * Inject the request body
 *
 * @example
 * ```typescript
 * @Post()
 * createUser(@Body() userData: CreateUserDto) {
 *   return userService.create(userData);
 * }
 * ```
 */
export function Body(name?: string): ParameterDecorator {
  return createParameterDecorator("body", name);
}

/**
 * Inject a request header by name
 *
 * @param name - Header name
 *
 * @example
 * ```typescript
 * @Get()
 * getProfile(@Headers('authorization') auth: string) {
 *   const token = auth.replace('Bearer ', '');
 *   return getUserFromToken(token);
 * }
 * ```
 */
export function Headers(name: string): ParameterDecorator {
  return createParameterDecorator("headers", name);
}

/**
 * Inject the Express Request object
 *
 * @example
 * ```typescript
 * @Get()
 * getRequestInfo(@Req() req: Request) {
 *   return { ip: req.ip, userAgent: req.get('user-agent') };
 * }
 * ```
 */
export function Req(): ParameterDecorator {
  return createParameterDecorator("req");
}

/**
 * Inject the Express Response object
 *
 * @example
 * ```typescript
 * @Get()
 * download(@Res() res: Response) {
 *   res.download('/path/to/file.pdf');
 * }
 * ```
 */
export function Res(): ParameterDecorator {
  return createParameterDecorator("res");
}
