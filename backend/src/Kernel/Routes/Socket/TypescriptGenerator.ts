import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { type ZodTypeAny } from 'zod';
import { type routeTypings, type formattedSocketRoutes } from '#Kernel/Routes/Socket/TypescriptExporter.js';

export default class TypescriptGenerator {
    /**
     * Create the typescript typings for a schema
     *
     * @param routeName - The name of the route
     * @param schema - The schema to create the types for
     * @returns Typescript typings for the schema
     */
    static createTsTypes (routeName: string, schema: ZodTypeAny | undefined): string {
        if (schema === undefined) return '';

        const { node } = zodToTs(schema, routeName);
        const nodeAlias = createTypeAlias(node, routeName);
        return printNode(nodeAlias);
    }

    static createSocketCallbackMappingsTs (routes: formattedSocketRoutes): string {
        let generatedFile = '';

        generatedFile += `declare namespace ${routes.namespace} {\n`;

        for (const route of routes.routes) {
            if ('namespace' in route) {
                generatedFile += TypescriptGenerator.createSocketCallbackMappingsTs(route);
            } else {
                if (route.requestTypescript !== '') {
                    generatedFile += `export ${route.requestTypescript}\n`;
                }
                if (route.callbackTypescript !== '') {
                    generatedFile += `declare namespace ${route.name} { \n`;
                    generatedFile += `export ${route.callbackTypescript}\n`;
                    generatedFile += '}\n';
                }
            }
        }

        generatedFile += '}\n';
        return generatedFile;
    };

    /**
     * Generate the typescript type mappings for the route urls and their namespace
     *
     * @param routes The routes for which to generate the typings
     * @returns Typescript typings for the routes
     */
    static createNamespacesUrlMappingTs (routes: routeTypings[]): string {
        let generatedFile = 'export enum namespaceUrlMappings {\n';

        for (const routeGroup of routes) {
            generatedFile += `'${routeGroup.formattedSocketRoutes.namespace}' = '${routeGroup.allAbsoluteUrls[0].url}',\n`;
        }

        generatedFile += '\n};\n';

        return generatedFile;
    }

    /**
     * Generate the typescript type mappings for the route names and their event names inside the namespace
     *
     * @param routes The routes for which to generate the typings
     * @returns Typescript typings for the routes
     */
    static createNamespacesPathMappingTs (routes: routeTypings[]): string {
        let generatedFile = 'export const namespacePathMappings: Record<keyof clientEmits | keyof serverEmits, string> = {\n';

        for (const routeGroup of routes) {
            for (const route of routeGroup.formattedSocketRoutes.routes) {
                if ('namespace' in route) continue;

                generatedFile += `'${route.fullName}': '${route.name}',\n`;
            }
        }

        generatedFile += '\n};\n';

        return generatedFile;
    }

    /**
     * Genertae the typescript mappings between each event (server or client side) and their request/response types
     *
     * @param routes The routes for which to generate the typings
     * @returns Typescript typings for the routes
     */
    static createEventNamesTs (routes: routeTypings[]): string {
        let serverEvents = 'export interface serverEmits {\n';
        let clientEvents = 'export interface clientEmits {\n';

        for (const routeGroup of routes) {
            for (const route of routeGroup.formattedSocketRoutes.routes) {
                if ('namespace' in route) continue;

                const $ts = `'${route.fullName}': {\nreq: ${route.requestTypescript !== '' ? route.fullName : 'undefined'},\nres: ${route.callbackTypescript !== '' ? `${route.fullName}.callback` : 'never'},\n},\n`;

                if (route.eventSource === 'server') {
                    serverEvents += $ts;
                } else {
                    clientEvents += $ts;
                }
            }
        }
        serverEvents += '}\n';
        clientEvents += '}\n';

        return serverEvents + '\n' + clientEvents;
    }
}
