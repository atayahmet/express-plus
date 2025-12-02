import { addRouteMetadata, type RouteMetadata } from '../metadata.js';

/**
 * Create a route decorator for a specific HTTP method
 */
function createRouteDecorator(method: string) {
    return function (path: string = ''): MethodDecorator {
        return function (target: any, propertyKey: string | symbol) {
            // Ensure path starts with / if provided and not empty
            const normalizedPath = path && !path.startsWith('/') ? `/${path}` : path;

            // Add this route
            addRouteMetadata(target, {
                method,
                path: normalizedPath,
                propertyKey
            } as RouteMetadata);
        };
    };
}

/**
 * Register a GET route handler
 * 
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @Get()
 * getAllUsers() {
 *   return users;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * @Get('/:id')
 * getUser(@Param('id') id: string) {
 *   return users.find(u => u.id === id);
 * }
 * ```
 */
export const Get = createRouteDecorator('get');

/**
 * Register a POST route handler
 * 
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @Post()
 * createUser(@Body() userData: CreateUserDto) {
 *   return userService.create(userData);
 * }
 * ```
 */
export const Post = createRouteDecorator('post');

/**
 * Register a PUT route handler
 * 
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @Put('/:id')
 * updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
 *   return userService.update(id, data);
 * }
 * ```
 */
export const Put = createRouteDecorator('put');

/**
 * Register a DELETE route handler
 * 
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @Delete('/:id')
 * deleteUser(@Param('id') id: string) {
 *   return userService.delete(id);
 * }
 * ```
 */
export const Delete = createRouteDecorator('delete');

/**
 * Register a PATCH route handler
 * 
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @Patch('/:id')
 * patchUser(@Param('id') id: string, @Body() data: Partial<User>) {
 *   return userService.patch(id, data);
 * }
 * ```
 */
export const Patch = createRouteDecorator('patch');

/**
 * Register a route handler for all HTTP methods
 * @param path - Route path (optional, defaults to '')
 * 
 * @example
 * ```typescript
 * @All('/status')
 * handleAllMethods() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const All = createRouteDecorator('all');
