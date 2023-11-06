import { type RouteOptions, type FastifyInstance, type HTTPMethods, type FastifyPlugin } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { type ZodTypeAny } from 'zod';
import type z from 'zod';

type url = `/${string}` | '';

type RouteDefinition = [HTTPMethods, string, url, webRouteInterface<any, any>];

export interface WebRoute {
    prefix: url
    name: string
    middlewares: FastifyPlugin[]
    routes: Array<RouteDefinition | WebRoute>
}

interface webRouteInterface<T extends ZodTypeAny, U extends ZodTypeAny | undefined> {
    schema: ZodTypeAny
    bodySchema?: ZodTypeAny
    handler: RouteOptions['handler'] extends (
        request: infer RequestType,
        reply: infer ReplyType
    ) => infer ReturnType
        ? (
            request: Omit<RequestType, 'body'> & {
                // @ts-expect-error It smh does work
                body: U extends undefined ? never : z.infer<U>
            },
            reply: Omit<ReplyType, 'send'> & {
                send: (payload: z.infer<T>) => any
            },
            ...args: any[]
        ) => ReturnType
        : never
}

/**
 * Used to enable Typescript typings for routes
 *
 * @param input - The route configuration
 * @returns - The same route configuration, but typed
 */
export function webRoute<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny | undefined = undefined> (input: {
    schema: T
    bodySchema?: U
    handler: RouteOptions['handler'] extends (
        request: infer RequestType,
        reply: infer ReplyType
    ) => infer ReturnType
        ? (
            request: Omit<RequestType, 'body'> & {
                // @ts-expect-error It smh does work
                body: U extends undefined ? never : z.infer<U>
            },
            reply: Omit<ReplyType, 'send'> & {
                send: (payload: z.infer<T>) => Promise<any>
            },
            ...args: any[]
        ) => ReturnType
        : never
}): webRouteInterface<T, U> {
    return {
        schema: input.schema,
        bodySchema: input.bodySchema,
        handler: input.handler
    };
}

export default class WebRoutes {
    /**
     * Register the routes from the routes file with fastify and build its typings
     *
     * @param fastify - The fastify instance
     * @param routes - The routes to register
     */
    async register (fastify: FastifyInstance, routes: WebRoute): Promise<void> {
        await this.#registerRoute(fastify, routes, '');
    }

    /**
     * Register the routes with fastify recursively
     *
     * @param fastify - Fastify instance
     * @param routes - The routes to register
     * @param prefix - The prefix to add to the routes
     */
    async #registerRoute (fastify: FastifyInstance, routes: WebRoute, prefix: string): Promise<void> {
        const routePrefix = prefix + routes.prefix;
        // if there are middlewares create a new context and 'rerun' the registerRoute function with the new context
        if (routes.middlewares.length > 0) {
            await fastify.register(async (middlewaredServer) => {
                for (const middleware of routes.middlewares) {
                    await middlewaredServer.register(middleware);
                }
                // flush the middlewares so they don't get applied again
                routes.middlewares = [];
                await this.#registerRoute(middlewaredServer, routes, prefix);
            });
            return;
        }

        for (const route of routes.routes) {
            // it's an array, so its a route definition
            if (Array.isArray(route)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [method, name, url, newRoute] = route;

                fastify.withTypeProvider<ZodTypeProvider>().route({
                    schema: {
                        response: {
                            200: newRoute.schema
                        },
                        ...(newRoute.bodySchema !== undefined && {
                            body: newRoute.bodySchema
                        })
                    },
                    handler: newRoute.handler,
                    method,
                    url: routePrefix + url
                });
            } else {
                // it's a route group with subroutes
                await this.#registerRoute(fastify, route, routePrefix);
            }
        }
    }
}
