/**
 * Base HTTP exception class for clean error handling
 * 
 * @example
 * ```typescript
 * throw new HttpException(404, 'User not found');
 * ```
 */
export class HttpException extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
        this.name = 'HttpException';
    }
}

/**
 * 400 Bad Request exception
 * 
 * @example
 * ```typescript
 * throw new BadRequestException('Invalid email format');
 * ```
 */
export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(400, message);
        this.name = 'BadRequestException';
    }
}

/**
 * 401 Unauthorized exception
 * 
 * @example
 * ```typescript
 * throw new UnauthorizedException('Invalid credentials');
 * ```
 */
export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
        this.name = 'UnauthorizedException';
    }
}

/**
 * 403 Forbidden exception
 * 
 * @example
 * ```typescript
 * throw new ForbiddenException('Insufficient permissions');
 * ```
 */
export class ForbiddenException extends HttpException {
    constructor(message: string = 'Forbidden') {
        super(403, message);
        this.name = 'ForbiddenException';
    }
}

/**
 * 404 Not Found exception
 * 
 * @example
 * ```typescript
 * throw new NotFoundException('User not found');
 * ```
 */
export class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found') {
        super(404, message);
        this.name = 'NotFoundException';
    }
}

/**
 * 409 Conflict exception
 * 
 * @example
 * ```typescript
 * throw new ConflictException('Email already exists');
 * ```
 */
export class ConflictException extends HttpException {
    constructor(message: string = 'Conflict') {
        super(409, message);
        this.name = 'ConflictException';
    }
}

/**
 * 500 Internal Server Error exception
 * 
 * @example
 * ```typescript
 * throw new InternalServerErrorException('Database connection failed');
 * ```
 */
export class InternalServerErrorException extends HttpException {
    constructor(message: string = 'Internal Server Error') {
        super(500, message);
        this.name = 'InternalServerErrorException';
    }
}
