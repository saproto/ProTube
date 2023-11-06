import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { type ZodTypeAny } from 'zod';
import { writeFileSync } from 'fs';
import path from 'path';

export interface exportRoute {
    fullName: string
    name: string
    type: string
    bodyType: string
    url: string
    params: routeParam[] | undefined
}

export interface exportedRoutes {
    namespace: string
    routes: Array<exportRoute | exportedRoutes>
}

export interface routeParam {
    param: string
    optional: boolean
}

export interface routeTypings {
    name: string
    allRoutes: allRoutes[]
    exportedRoutes: exportedRoutes
}

export interface allRoutes {
    url: string
    fullName: string
}

export default class RouteTypeExporter {
    routeTypings: routeTypings[] = [];
    #debugRoutes = false;

    /**
     * Create the typescript typings for a schema
     *
     * @param routeName - The name of the route
     * @param schema - The schema to create the types for
     * @returns Typescript typings for the schema
     */
    createTsTypes (routeName: string, schema: ZodTypeAny | undefined): string {
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
    buildRouteResponseTypes (routes: exportedRoutes, prefix = ''): string {
        let generatedFile = '';

        generatedFile += `declare namespace ${routes.namespace} {\n`;

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.buildRouteResponseTypes(route);
            } else {
                if (route.type !== '') {
                    generatedFile += `export ${route.type}\n`;
                }
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
    buildRouteParamsMap (routes: allRoutes[]): string {
        let generatedFile = '';

        generatedFile += 'export interface RouteParamsMap {\n';
        generatedFile += routes.map((route) => `    '${route.fullName}': ${this.paramInterfaceName(route)}`).join('\n');
        generatedFile += '\n}\n';

        return generatedFile;
    }

    buildUrlMap (routes: allRoutes[]): string {
        let generatedFile = '';

        generatedFile += 'export const urlMappings: Record<keyof RouteParamsMap, string> = {\n';
        generatedFile += routes.map((route) => `    '${route.fullName}': '${route.url}',`).join('\n');
        generatedFile += '\n};\n';

        return generatedFile;
    }

    /**
     * Create the typescript interfacte of route typings for the route params
     *
     * @param routes - The routes to build the typings for
     * @returns All typescript interfaces for a route param
     */
    buildParamRouteTypes (routes: exportedRoutes): string {
        let generatedFile = '';

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.buildParamRouteTypes(route);
            } else if (route.params !== undefined) {
                // construct the interface for the route params
                generatedFile += `interface ${this.paramInterfaceName(route)} {\n`;
                generatedFile += `    ${route.params.map((param) => `${param.param}${param.optional ? '?' : ''}: string | number`).join('\n    ')}`;
                generatedFile += '\n}\n';
            }
        }

        return generatedFile;
    }

    /**
     * Create the typescript typings (namespaces) for the route responses
     *
     * @param routes - The routes to build the typings for
     * @param prefix - The prefix to add to the routes
     * @returns Typescript typings
     */
    buildSocketRouteCallbackTypes (routes: exportedRoutes, prefix = ''): string {
        let generatedFile = '';

        generatedFile += `declare namespace ${routes.namespace} {\n`;

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.buildSocketRouteCallbackTypes(route);
            } else {
                if (route.type !== '') {
                    generatedFile += `export ${route.type}\n`;
                }
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

    buildSocketToServerCallbackTypeMap (routes: allRoutes[], routeTypings: routeTypings[]): string {
        let generatedFile = 'export const socketToServerCallbackMap = {';

        routeTypings.forEach((routeTyping) => {
            generatedFile += this.buildSocketToServerCallbackTypes(routeTyping.exportedRoutes);
        });
        generatedFile += '}\n';

        return generatedFile;
    };

    /**
     * Create the typescript typings (namespaces) for the route responses
     *
     * @param routes - The routes to build the typings for
     * @param prefix - The prefix to add to the routes
     * @returns Typescript typings
     */
    buildSocketToServerCallbackTypes (routes: exportedRoutes, prefix = ''): string {
        let generatedFile = '';

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += this.buildSocketToServerCallbackTypes(route);
            } else {
                if (route.type !== '') {
                    generatedFile += `'${route.fullName}': ${route.fullName}\n`;
                }
            }
        }

        return generatedFile;
    }

    /**
     * Create the typescript typings (namespaces) for the route responses
     *
     * @param routes - The routes to build the typings for
     * @param prefix - The prefix to add to the routes
     * @returns Typescript typings
     */
    buildSocketRequestTypes (routes: exportedRoutes, prefix = ''): string {
        let generatedFile = 'export const socketToServerRequestMap = {';

        for (const route of routes.routes) {
            if ('namespace' in route) {
                // generatedFile += this.buildRouteResponseTypes(route);
                continue;
            } else {
                if (route.type !== '') {
                    generatedFile += `'${route.fullName}': ${route.type}\n`;
                }
            }
        }

        generatedFile += '}\n';
        return generatedFile;
    }

    /**
     * Find route params in a url (e.g. /test/:id where id is a param)
     *
     * @param url - The url to build the route params for
     * @returns All routeparams found in the url
     */
    findRouteParams (url: string): routeParam[] {
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
     * Print all routes to a json file for debugging
     *
     * @param routes - The routes to print
     * @param name - The name prefix of the routes
     */
    printRoutes (routes: exportedRoutes, name: string): void {
        if (!this.#debugRoutes) return;

        writeFileSync(path.resolve(__dirname, `./${name}_types.json`), JSON.stringify(routes, null, 2));
    }

    /**
     * Build the typescript interface name for the route params
     *
     * @param route - The route to build the interface name for
     * @returns Name of the interface for the route params
     */
    paramInterfaceName (route: exportRoute | allRoutes): string {
        return `${route.fullName.replaceAll('.', '_')}_Params`;
    }

    /**
     * Create an array with all routes and their full names
     *
     * @param routes - The routes to build the typings for
     * @returns An array with all routes
     */
    getAllRoutes (routes: exportedRoutes): allRoutes[] {
        const allRoutes: allRoutes[] = [];

        for (const route of routes.routes) {
            if ('namespace' in route) {
                allRoutes.push(...this.getAllRoutes(route));
            } else {
                allRoutes.push({
                    url: route.url,
                    fullName: route.fullName
                });
            }
        }
        return allRoutes;
    }
}
