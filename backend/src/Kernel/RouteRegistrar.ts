import { type RouteOptions, type FastifyInstance, type HTTPMethods, type FastifyPlugin } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { writeFileSync } from 'fs';
import path from 'path';
import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { type ZodTypeAny } from 'zod';
import type z from 'zod';
import root from '@app/rootPath';
import { copySync } from 'fs-extra';

type url = `/${string}` | '';

type RouteDefinition = [HTTPMethods, string, url, routeInterface<any, any>];

enum rDef {
    method = 0,
    name = 1,
    url = 2,
    route = 3
};

export interface DefinedRoutes {
    prefix: url
    name: string
    middlewares: FastifyPlugin[]
    routes: Array<RouteDefinition | DefinedRoutes>
}

interface exportRoute {
    fullName: string
    name: string
    type: string
    bodyType: string
    url: string
    params: routeParam[]
}

interface allRoutes {
    url: string
    fullName: string
}

interface routeParam {
    param: string
    optional: boolean
}

interface exportedRoutes {
    namespace: string
    routes: Array<exportRoute | exportedRoutes>
}

interface routeTypings {
    name: string
    allRoutes: allRoutes[]
    exportedRoutes: exportedRoutes
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
    #routeTypings: routeTypings[] = [];

    /**
     * Register the routes from the routes file with fastify and build its typings
     *
     * @param fastify - The fastify instance
     * @param routes - The routes to register
     * @param name - The name prefix to use for the routes
     */
    async register (fastify: FastifyInstance, routes: DefinedRoutes): Promise<void> {
        await this.#registerRoute(fastify, routes, '');

        this.onlyLoadRoutes(routes, routes.name);
    }

    /**
     * Load and prepare the typings for the routes
     *
     * @param routes - The routes to load in
     * @param name - The name prefix to use for the routes
     */
    onlyLoadRoutes (routes: DefinedRoutes, name: string): void {
        const exportedRoutes = this.#formatExportedRoutes(routes, name, name, '');

        const routeTyping: routeTypings = {
            name: name + routes.name,
            allRoutes: this.#getAllRoutes(exportedRoutes),
            exportedRoutes
        };
        this.#routeTypings.push(routeTyping);
    }

    /**
     * Export the route typings to be used by the backend and frontend
     */
    exportRouteTypings (): void {
        const allRoutes: allRoutes[] = [];

        let builtRouteResponseTypings = '';
        let builtParamRouteTypes = '';

        for (const typings of this.#routeTypings) {
            allRoutes.push(...typings.allRoutes);
            builtRouteResponseTypings += this.#buildRouteResponseTypes(typings.exportedRoutes, typings.name);
            builtParamRouteTypes += this.#buildParamRouteTypes(typings.exportedRoutes);
            this.printRoutes(typings.exportedRoutes, typings.name);
        }

        const routeParamsMap = this.#buildRouteParamsMap(allRoutes);

        writeFileSync(path.resolve(root(), 'routes/typings/route-typings.ts'), builtParamRouteTypes + routeParamsMap + '\n');
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
    async #registerRoute (fastify: FastifyInstance, routes: DefinedRoutes, prefix: string): Promise<void> {
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
                fastify.withTypeProvider<ZodTypeProvider>().route({
                    schema: {
                        response: {
                            200: route[rDef.route].schema
                        },
                        ...(route[rDef.route].bodySchema !== undefined && {
                            body: route[rDef.route].bodySchema
                        })
                    },
                    handler: route[rDef.route].handler,
                    method: route[rDef.method],
                    url: routePrefix + route[rDef.url]
                });
            } else {
                // it's a route group with subroutes
                await this.#registerRoute(fastify, route, routePrefix);
            }
        }
    }

    /**
     * Build the typescript interface name for the route params
     *
     * @param route - The route to build the interface name for
     * @returns Name of the interface for the route params
     */
    #paramInterfaceName (route: exportRoute | allRoutes): string {
        return `${route.fullName.replaceAll('.', '_')}_Params`;
    }

    /**
     * Create an array with all routes and their full names
     *
     * @param routes - The routes to build the typings for
     * @returns An array with all routes
     */
    #getAllRoutes (routes: exportedRoutes): allRoutes[] {
        const allRoutes: allRoutes[] = [];

        for (const route of routes.routes) {
            if ('namespace' in route) {
                allRoutes.push(...this.#getAllRoutes(route));
            } else {
                allRoutes.push({
                    url: route.url,
                    fullName: route.fullName
                });
            }
        }
        return allRoutes;
    }

    /**
     * Find route params in a url (e.g. /test/:id where id is a param)
     *
     * @param url - The url to build the route params for
     * @returns All routeparams found in the url
     */
    #findRouteParams (url: string): routeParam[] {
        const params: routeParam[] = [];
        // Checks for parameters (either :param or :param?)
        const pattern = /:(\w+)\??/g;
        const matches = [...url.matchAll(pattern)];

        matches.forEach((match) => {
            const optional = match[0].endsWith('?');
            const param = match[1];
            params.push({ param, optional });
        });

        return params;
    }

    /**
     * Create the typescript interfacte of route typings for the route params
     *
     * @param routes - The routes to build the typings for
     * @returns All typescript interfaces for a route param
     */
    #buildParamRouteTypes (routes: exportedRoutes): string {
        let generatedFile = '';

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.#buildParamRouteTypes(route);
            } else {
                // construct the interface for the route params
                generatedFile += `interface ${this.#paramInterfaceName(route)} {\n`;
                generatedFile += `    ${route.params.map((param) => `${param.param}${param.optional ? '?' : ''}: string | number`).join('\n    ')}`;
                generatedFile += '\n}\n';
            }
        }

        return generatedFile;
    }

    /**
     * Recursively the definedRoutes into a more convenient format
     *
     * @param routes - The defined routes
     * @param namespace - The namespace which to apply
     * @param fullNamespace - The full namespace of the routes
     * @returns formatted routes
     */
    #formatExportedRoutes (routes: DefinedRoutes, namespace: string, fullNamespace: string, routePrefix: string): exportedRoutes {
        const exportedRoutes: exportedRoutes = {
            namespace,
            routes: []
        };

        for (const route of routes.routes) {
            // it's an array, so its a route definition
            if (Array.isArray(route)) {
                const routeName = route[rDef.name];

                const routeType: exportRoute = {
                    name: routeName,
                    fullName: fullNamespace + '.' + routeName,
                    type: this.#createTsTypes(routeName, route[rDef.route].schema),
                    bodyType: this.#createTsTypes('request', route[rDef.route].bodySchema),
                    url: routePrefix + routes.prefix + route[rDef.url],
                    params: this.#findRouteParams(route[rDef.url])
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

    /**
     * Create the typescript typings for a schema
     *
     * @param routeName - The name of the route
     * @param schema - The schema to create the types for
     * @returns Typescript typings for the schema
     */
    #createTsTypes (routeName: string, schema: ZodTypeAny | undefined): string {
        if (schema === undefined) return '';

        const { node } = zodToTs(schema, routeName);
        const nodeAlias = createTypeAlias(node, routeName);
        return printNode(nodeAlias);
    }

    /**
     * Create the typescript typings (namespaces) for the route responses
     *
     * @param routes - The routes to build the typings for
     * @param prefix - The prefix to add to the routes
     * @returns Typescript typings
     */
    #buildRouteResponseTypes (routes: exportedRoutes, prefix = ''): string {
        let generatedFile = '';

        generatedFile += `declare namespace ${routes.namespace} {\n`;

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.#buildRouteResponseTypes(route);
            } else {
                generatedFile += `export ${route.type}\n`;
                if (route.bodyType !== '') {
                    generatedFile += `declare namespace ${route.name} { \n`;
                    generatedFile += `export ${route.bodyType}\n`;
                    generatedFile += '}\n';
                }
            }
        }

        generatedFile += '}\n';
        return generatedFile;
    }

    /**
     * Create the typescript code for the route params map and url mappings
     *
     * @param routes - all routes for which to create the route params map and url mappings
     * @returns Typescript typings
     */
    #buildRouteParamsMap (routes: allRoutes[]): string {
        let generatedFile = '';

        generatedFile += 'export interface RouteParamsMap {\n';
        generatedFile += routes.map((route) => `    '${route.fullName}': ${this.#paramInterfaceName(route)}`).join('\n');
        generatedFile += '\n}\n';

        generatedFile += 'export const urlMappings: Record<keyof RouteParamsMap, string> = {\n';
        generatedFile += routes.map((route) => `    '${route.fullName}': '${route.url}',`).join('\n');
        generatedFile += '\n};\n';

        return generatedFile;
    }

    /**
     * Print all routes to a json file for debugging
     *
     * @param routes - The routes to print
     * @param name - The name prefix of the routes
     */
    printRoutes (routes: exportedRoutes, name: string): void {
        writeFileSync(path.resolve(__dirname, `./${name}_types.json`), JSON.stringify(routes, null, 2));
    }
}
