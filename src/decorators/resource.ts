import type { RequestHandler } from "express";
import pluralize from "pluralize";
import {
  addRouteMetadata,
  ControllerMetadata,
  setControllerMetadata,
} from "../metadata";

export interface ResourceOptions {
  path: string;
  parameters?: { [key: string]: string };
  controllers?: any[];
  middlewares?: Array<RequestHandler>;
}

const createSegments = (options: ResourceOptions) => {
  return options.path.split(".").reduce((acc, segment) => {
    const param = `:${
      options.parameters?.[segment] || pluralize.singular(segment) + "Id"
    }`;
    acc.push(segment, param);
    return acc;
  }, [] as string[]);
};

const resourceActions = [
  { name: "index", placeholder: false, method: "get" },
  { name: "show", placeholder: true, method: "get" },
  { name: "create", placeholder: false, method: "post" },
  { name: "update", placeholder: true, method: "put" },
  { name: "patch", placeholder: true, method: "patch" },
  { name: "delete", placeholder: true, method: "delete" },
];

/**
 * Marks a class as a RESTful resource controller with standard CRUD routes
 * @param pathOrOptions
 *
 * @example
 * ```typescript
 * @Resource('blogs.comments.likes')
 * class BlogCommentsLikesResource {
 *   index() { ... }   // GET /blogs/:blogId/comments/:commentId/likes
 *   show() { ... }    // GET /blogs/:blogId/comments/:commentId/likes/:likeId
 *   create() { ... }  // POST /blogs/:blogId/comments/:commentId/likes
 *   update() { ... }  // PUT /blogs/:blogId/comments/:commentId/likes/:likeId
 *   patch() { ... }   // PATCH /blogs/:blogId/comments/:commentId/likes/:likeId
 *   delete() { ... }  // DELETE /blogs/:blogId/comments/:commentId/likes/:likeId
 * }
 * 
 * @example
 * ```typescript
 * @Resource({
 *  path: 'users.posts',
 *  parameters: { users: 'userId', posts: 'postId' }
 *  controllers: [UserPostsController]
 *  middlewares: [authMiddleware]
 * })
 * class UserPostsResource {... }
 *
 * @returns {ClassDecorator}
 */
export function Resource(
  pathOrOptions: string | ResourceOptions
): ClassDecorator {
  return function (target: any) {
    // Handle both string and object inputs
    const options =
      typeof pathOrOptions === "string"
        ? { path: pathOrOptions, controllers: [] }
        : pathOrOptions;

    // create segments for the resource path
    // (e.g., "blogs.comments.likes" -> ["blogs", ":blogId", "comments", ":commentId", "likes", ":likeId"])
    const segments = createSegments(options);

    setControllerMetadata(target, {
      prefix: "",
      controllers: options.controllers || [],
    } as ControllerMetadata);

    resourceActions.forEach(({ name, placeholder, method }) => {
      if (!target.prototype[name]) return;

      const fullPath = segments
        .slice(0, placeholder ? segments.length : -1)
        .join("/");

      addRouteMetadata(target, {
        method,
        path: `/${fullPath}`,
        propertyKey: name,
      });
    });

    return target;
  };
}
