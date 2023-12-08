import { type RouteOptions, type FastifyInstance, type HTTPMethods, type FastifyPlugin } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { writeFileSync } from 'fs';
import path from 'path';
import { type ZodTypeAny } from 'zod';
import type z from 'zod';
import root from '#App/rootPath.js';
import { copySync } from 'fs-extra';
import RouteTypeExporter, { type allRoutes, type exportRoute, type exportedRoutes, type routeTypings } from '#App/Kernel/Routes/RouteTypeExporter.js';

type url = `/${string}` | '';

type RouteDefinition = [HTTPMethods, string, url, routeInterface<any, any>];

export interface WebRoute {
    prefix: url
    name: string
    middlewares: FastifyPlugin[]
    routes: Array<RouteDefinition | WebRoute>
}

interface routeInterface<T extends ZodTypeAny, U extends ZodTypeAny | undefined> {
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
export function route<T extends ZodTypeAny = ZodTypeAny, U extends ZodTypeAny | undefined = undefined> (input: {
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
}): routeInterface<T, U> {
    return {
        schema: input.schema,
        bodySchema: input.bodySchema,
        handler: input.handler
    };
}

export default class WebRoutes {
    #routeTypeExporter: RouteTypeExporter;

    constructor () {
        this.#routeTypeExporter = new RouteTypeExporter();
    }

    /**
     * Register the routes from the routes file with fastify and build its typings
     *
     * @param fastify - The fastify instance
     * @param routes - The routes to register
     */
    async register (fastify: FastifyInstance, routes: WebRoute): Promise<void> {
        await this.#registerRoute(fastify, routes, '');

        this.onlyLoadRoutes(routes, routes.name);
    }

    /**
     * Load and prepare the typings for the routes
     *
     * @param routes - The routes to load in
     * @param name - The name prefix to use for the routes
     */
    onlyLoadRoutes (routes: WebRoute, name: string): void {
        const exportedRoutes = this.#formatExportedRoutes(routes, name, name, '');

        const routeTyping: routeTypings = {
            name: name + routes.name,
            allRoutes: this.#routeTypeExporter.getAllRoutes(exportedRoutes),
            exportedRoutes
        };
        this.#routeTypeExporter.routeTypings.push(routeTyping);
    }

    /**
     * Export the route typings to be used by the backend and frontend
     */
    exportRouteTypings (): void {
        const allRoutes: allRoutes[] = [];

        let builtRouteResponseTypings = '';
        let builtParamRouteTypes = '';

        for (const typings of this.#routeTypeExporter.routeTypings) {
            allRoutes.push(...typings.allRoutes);
            builtRouteResponseTypings += this.#routeTypeExporter.buildRouteResponseTypes(typings.exportedRoutes, typings.name);
            builtParamRouteTypes += this.#routeTypeExporter.buildParamRouteTypes(typings.exportedRoutes);
            this.#routeTypeExporter.printRoutes(typings.exportedRoutes, typings.name);
        }

        const routeParamsMap = this.#routeTypeExporter.buildRouteParamsMap(allRoutes);
        const routeUrlMap = this.#routeTypeExporter.buildUrlMap(allRoutes);

        writeFileSync(path.resolve(root(), 'routes/typings/route-typings.ts'), builtParamRouteTypes + routeParamsMap + routeUrlMap + '\n');
        writeFileSync(path.resolve(root(), 'routes/typings/response-typings.d.ts'), builtRouteResponseTypings);

        const sourceDir = path.join(path.resolve(root(), 'routes/typings'));
        const targetDir = path.join(path.resolve(root(), '../../frontend/src/utils/route-typings'));

        copySync(sourceDir, targetDir, { overwrite: true });
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

    /**
     * Recursively the definedRoutes into a more convenient format
     *
     * @param routes - The defined routes
     * @param namespace - The namespace which to apply
     * @param fullNamespace - The full namespace of the routes
     * @returns formatted routes
     */
    #formatExportedRoutes (routes: WebRoute, namespace: string, fullNamespace: string, routePrefix: string): exportedRoutes {
        const exportedRoutes: exportedRoutes = {
            namespace,
            routes: []
        };

        for (const route of routes.routes) {
            // it's an array, so its a route definition
            if (Array.isArray(route)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [method, name, url, newRoute] = route;

                const routeType: exportRoute = {
                    name,
                    fullName: fullNamespace + '.' + name,
                    type: this.#routeTypeExporter.createTsTypes(name, newRoute.schema),
                    bodyType: this.#routeTypeExporter.createTsTypes('request', newRoute.bodySchema),
                    url: routePrefix + routes.prefix + url,
                    params: this.#routeTypeExporter.findRouteParams(url)
                };

                exportedRoutes.routes.push(routeType);
            } else { // it's a route group with subroutes
                // if the route has no name, use the namespace as name
                const namespace = route.name === '' ? fullNamespace : fullNamespace + '.' + route.name;
                exportedRoutes.routes.push(this.#formatExportedRoutes(route, route.name, namespace, routePrefix + routes.prefix));
            }
        }
        return exportedRoutes;
    }
}
