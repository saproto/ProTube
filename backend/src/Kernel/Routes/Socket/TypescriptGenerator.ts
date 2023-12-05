import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts';
import { type ZodTypeAny } from 'zod';
import { type formattedSocketRoutes } from './TypescriptExporter';

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
        console.log(`Doing sth for ${routes.namespace}`);
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
}
