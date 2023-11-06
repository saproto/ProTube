import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { type ZodTypeAny } from 'zod';
import { type formattedWebRoutes, type absoluteUrl, type formattedWebRoute } from './TypescriptExporter';

/**
     * Create the typescript typings for a schema
     *
     * @param routeName - The name of the route
     * @param schema - The schema to create the types for
     * @returns Typescript typings for the schema
     */
export function createTsTypes (routeName: string, schema: ZodTypeAny | undefined): string {
    if (schema === undefined) return '';

    const { node } = zodToTs(schema, routeName);
    const nodeAlias = createTypeAlias(node, routeName);
    return printNode(nodeAlias);
}

/**
 * Create the typescript code for the route params map and url mappings
 *
 * @param routes - all routes for which to create the route params map and url mappings
 * @returns Typescript typings
 */
export function createRouteParametersMappingTs (routes: absoluteUrl[]): string {
    let generatedFile = '';

    generatedFile += 'export interface RouteParamsMap {\n';
    generatedFile += routes.map((route) => `    '${route.fullName}': ${paramInterfaceName(route)}`).join('\n');
    generatedFile += '\n}\n';

    return generatedFile;
}

/**
 * Create the typescript interfacte of route typings for the route params
 *
 * @param routes - The routes to build the typings for
 * @returns All typescript interfaces for a route param
 */
export function createRouteParametersInterfacesTs (routes: formattedWebRoutes): string {
    let generatedFile = '';

    for (const route of routes.routes) {
        if ('namespace' in route) {
            generatedFile += createRouteParametersInterfacesTs(route);
        } else if (route.params !== undefined) {
            // construct the interface for the route params
            generatedFile += `interface ${paramInterfaceName(route)} {\n`;
            generatedFile += `    ${route.params.map((param) => `${param.param}${param.optional ? '?' : ''}: string | number`).join('\n    ')}`;
            generatedFile += '\n}\n';
        }
    }

    return generatedFile;
}

export function createRouteUrlsTs (routes: absoluteUrl[]): string {
    let generatedFile = '';

    generatedFile += 'export const urlMappings: Record<keyof RouteParamsMap, string> = {\n';
    generatedFile += routes.map((route) => `    '${route.fullName}': '${route.url}',`).join('\n');
    generatedFile += '\n};\n';

    return generatedFile;
}

/**
 * Build the typescript interface name for the route params
 *
 * @param route - The route to build the interface name for
 * @returns Name of the interface for the route params
    */
function paramInterfaceName (route: formattedWebRoute | absoluteUrl): string {
    return `${route.fullName.replaceAll('.', '_')}_Params`;
}
