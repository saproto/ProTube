import root from '#App/rootPath.js';
import { type SocketRoute } from '#Kernel/Routes/Socket/Registrar.js';
import TypescriptGenerator from '#Kernel/Routes/Socket/TypescriptGenerator.js';
import { writeFileSync } from 'fs';
import path from 'path';
import pkg from 'fs-extra';
const { copySync } = pkg;

export interface formattedSocketRoute {
    fullName: string
    name: string
    callbackTypescript: string
    requestTypescript: string
    url: string
    eventSource: 'client' | 'server'
}

export interface formattedSocketRoutes {
    namespace: string
    routes: Array<formattedSocketRoute | formattedSocketRoutes>
}
export interface routeTypings {
    name: string
    allAbsoluteUrls: absoluteUrl[]
    formattedSocketRoutes: formattedSocketRoutes
}

export interface absoluteUrl {
    url: string
    fullName: string
}
export default class TypescriptExporter {
    #routeTypings: routeTypings[] = [];
    static #EXPORT_PATH = 'routes/typings';
    static #FRONTEND_EXPORT_PATH = '../../frontend/src/utils/route-typings';

    /**
     * Load and prepare the typings for the routes
     *
     * @param routes - The routes to load in
     */
    load (routes: SocketRoute[]): void {
        for (const route of routes) {
            const formattedSocketRoutes = this.#formatSocketRoutes(route, 'socket.');

            const routeTyping: routeTypings = {
                name: route.name,
                allAbsoluteUrls: this.#makeSocketRouteAbsoluteUrls(formattedSocketRoutes),
                formattedSocketRoutes
            };
            this.#routeTypings.push(routeTyping);
        }
    }

    export (): void {
        const routeCallbacks = this.#createRouteCallbackTypings();
        // const namespaceUrls = this.#createNamespaceUrlTypings();
        const namespaceUrls = this.#createNamespaceUrlTypings();
        const pathNamespaces = this.#createNamespacePathTypings();
        const eventmappings = this.#createEmitsRouteMappingTypings();
        // const clientEmits = this.#createClientEmitsTypings();
        // const events = this.#createEmitsNameTypings();

        writeFileSync(path.resolve(root(), `${TypescriptExporter.#EXPORT_PATH}/socket-events-n-callbacks.d.ts`), routeCallbacks + '\n');
        writeFileSync(path.resolve(root(), `${TypescriptExporter.#EXPORT_PATH}/debug.json`), JSON.stringify(this.#routeTypings, null, 4));
        writeFileSync(path.resolve(root(), `${TypescriptExporter.#EXPORT_PATH}/socket-routes.ts`), namespaceUrls + pathNamespaces + eventmappings);

        const sourceDir = path.join(path.resolve(root(), TypescriptExporter.#EXPORT_PATH));
        const targetDir = path.join(path.resolve(root(), TypescriptExporter.#FRONTEND_EXPORT_PATH));

        copySync(sourceDir, targetDir, { overwrite: true });
    }

    #createRouteCallbackTypings (): string {
        let typescript = '';

        for (const typings of this.#routeTypings) {
            typescript += TypescriptGenerator.createSocketCallbackMappingsTs(typings.formattedSocketRoutes);
        }

        return typescript;
    }

    /**
     * Create an array with all routes and their full names
     *
     * @param routes - The routes to build the typings for
     * @returns An array with all routes
     */
    #makeSocketRouteAbsoluteUrls (routes: formattedSocketRoutes): absoluteUrl[] {
        const absoluteUrls: absoluteUrl[] = [];

        for (const route of routes.routes) {
            if ('namespace' in route) {
                absoluteUrls.push(...this.#makeSocketRouteAbsoluteUrls(route));
            } else {
                absoluteUrls.push({
                    url: route.url,
                    fullName: route.fullName
                });
            }
        }
        return absoluteUrls;
    }

    /**
     * Return mappings of the route names and the corresponding request
     * /response types
     *
     * @returns Generated typescript
     */
    #createEmitsRouteMappingTypings (): string {
        return TypescriptGenerator.createEventNamesTs(this.#routeTypings);
    }

    /**
     * Return mappings of the route names to the namespace urls
     *
     * @returns Generated typescript
     */
    #createNamespaceUrlTypings (): string {
        return TypescriptGenerator.createNamespacesUrlMappingTs(this.#routeTypings);
    }

    /**
     * Return mappings of the route names to the event names
     *
     * @returns Generated typescirpt
     */
    #createNamespacePathTypings (): string {
        return TypescriptGenerator.createNamespacesPathMappingTs(this.#routeTypings);
    }

    /**
     * Recursively the definedRoutes into a more convenient format
     *
     * @param routes - The defined routes
     * @returns formatted routes
     */
    #formatSocketRoutes (socketRoute: SocketRoute, routePrefix: string): formattedSocketRoutes {
        const formattedSocketRoutes: formattedSocketRoutes = {
            namespace: routePrefix + socketRoute.name,
            routes: []
        };

        for (const route of socketRoute.routes) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [emitOrListen, eventName, handler] = route;

            const routeType: formattedSocketRoute = {
                name: eventName,
                fullName: routePrefix + socketRoute.name + '.' + eventName,
                requestTypescript: TypescriptGenerator.createTsTypes(eventName, handler.schema),
                callbackTypescript: emitOrListen === 'listen for' ? TypescriptGenerator.createTsTypes('callback', handler.callbackSchema) : '',
                eventSource: emitOrListen === 'listen for' ? 'client' : 'server',
                url: socketRoute.namespace
            };

            formattedSocketRoutes.routes.push(routeType);
        }
        return formattedSocketRoutes;
    }
}
