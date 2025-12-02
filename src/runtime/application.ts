import express, { type Application, type ErrorRequestHandler } from 'express';
import { Container } from '../container/container.js';
import { registerController } from './router.js';
import { HttpException } from '../errors/http-exceptions.js';

/**
 * Options for creating an Express Plus application
 */
export interface AppOptions {
    /**
     * Array of controller classes to register
     */
    controllers: any[];

    /**
     * Custom DI container (optional)
     */
    container?: Container;

    /**
     * Enable JSON body parsing (default: true)
     */
    json?: boolean;

    /**
     * Enable URL-encoded body parsing (default: true)
     */
    urlencoded?: boolean;
}

/**
 * Main application class for Express Plus
 */
export class ExpressPlus {
    private app: Application;
    private isDev: boolean;

    /**
     * Create a new Express Plus application
     * 
     * @param options - Application configuration options
     * 
     * @example
     * ```typescript
     * const app = ExpressPlus.create({
     *   controllers: [UserController, ProductController]
     * });
     * 
     * app.listen(3000);
     * ```
     */
    static create(options: AppOptions): Application {
        const instance = new ExpressPlus(options);
        return instance.app;
    }

    constructor(options: AppOptions) {
        this.app = express();

        // Auto-detect development mode
        this.isDev = process.env.NODE_ENV !== 'production';

        // Get or create container
        const container = options.container || Container.getGlobal();

        // Enable body parsers by default
        if (options.json !== false) {
            this.app.use(express.json());
        }

        if (options.urlencoded !== false) {
            this.app.use(express.urlencoded({ extended: true }));
        }

        // Register all controllers
        for (const Controller of options.controllers || []) {
            registerController(this.app, Controller, this.isDev, container);
        }

        // Add global error handler
        const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
            // Handle HttpException
            if (err instanceof HttpException) {
                res.status(err.status).json({
                    statusCode: err.status,
                    message: err.message,
                    ...(this.isDev && { stack: err.stack })
                });
                return;
            }

            // Handle other errors
            const status = err.status || 500;
            const message = err.message || 'Internal Server Error';

            res.status(status).json({
                statusCode: status,
                message,
                ...(this.isDev && { stack: err.stack })
            });
        };

        this.app.use(errorHandler);

        if (this.isDev) {
            console.log('[Express Plus] Application initialized in development mode');
        }
    }
}
