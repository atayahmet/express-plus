import type { Request, Response, NextFunction } from "express";
import { getParameterMetadata, type ParameterMetadata } from "../metadata.js";

/**
 * Create an Express request handler from a controller method
 *
 * @param controllerInstance - Instance of the controller
 * @param method - Method to call
 * @param propertyKey - Name of the method
 */
export function createHandler(
  controllerInstance: any,
  method: Function,
  propertyKey: string | symbol
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // Get parameter metadata for this method
      const params = getParameterMetadata(
        controllerInstance.constructor,
        propertyKey
      );

      // Resolve parameter values
      const args = resolveParameters(params, req, res);

      // Call the controller method
      const result = await method.apply(controllerInstance, args);

      // If result is undefined, assume response was already sent
      if (result !== undefined) {
        res.json(result);
      }
    } catch (error) {
      // Pass errors to Express error handler
      next(error);
    }
  };
}

/**
 * Resolve parameter values from request based on parameter metadata
 */
function resolveParameters(
  params: ParameterMetadata[],
  req: Request,
  res: Response
): any[] {
  // Sort parameters by index to ensure correct order
  const sortedParams = [...params].sort((a, b) => a.index - b.index);

  return sortedParams.map((param) => {
    switch (param.type) {
      case "param":
        return req.params[param.name!];

      case "query":
        return req.query[param.name!];

      case "body":
        return param.name ? req.body[param.name] : req.body;

      case "headers":
        return req.get(param.name!);

      case "req":
        return req;

      case "res":
        return res;

      default:
        return undefined;
    }
  });
}
