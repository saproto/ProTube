import { type WebRoute } from '#App/Kernel/Routes/Web/Registrar.js';
// import * as typescriptGenerator from './TypescriptGenerator';
import TypescriptGenerator from './TypescriptGenerator.js';
import { writeFileSync } from 'fs';
import path from 'path';
import root from '#App/rootPath.js';
import { copySync } from 'fs-extra';

export interface routeParam {
    param: string
    optional: boolean
}

export interface formattedWebRoute {
    fullName: string
    name: string
    responseTypescript: string
    requestTypescript: string
    url: string
    params: routeParam[] | undefined
}

export interface formattedWebRoutes {
    namespace: string
    routes: Array<formattedWebRoute | formattedWebRoutes>
}

export interface routeTypings {
    name: string
    allAbsoluteUrls: absoluteUrl[]
    formattedWebRoutes: formattedWebRoutes
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
     * @param name - The name prefix to use for the routes
     */
    load (routes: WebRoute): void {
        const formattedWebRoutes = this.#formatWebRoutes(routes, routes.name, routes.name, '');

        const routeTyping: routeTypings = {
            name: routes.name,
            allAbsoluteUrls: this.#makeWebRouteAbsoluteUrls(formattedWebRoutes),
            formattedWebRoutes
        };
        this.#routeTypings.push(routeTyping);
    }

    export (): void {
        const routeParameterInterfaces = this.#createRouteParameterInterfacesTypings();
        const routes = this.#createAbsoluteUrlTypings();
        const routeRequestsNResponses = this.#createRequestNResponseTypings();

        writeFileSync(path.resolve(root(), `${TypescriptExporter.#EXPORT_PATH}/routes.ts`), routeParameterInterfaces + routes + '\n');
        writeFileSync(path.resolve(root(), `${TypescriptExporter.#EXPORT_PATH}/route-requests-n-responses.d.ts`), routeRequestsNResponses);

        const sourceDir = path.join(path.resolve(root(), TypescriptExporter.#EXPORT_PATH));
        const targetDir = path.join(path.resolve(root(), TypescriptExporter.#FRONTEND_EXPORT_PATH));

        copySync(sourceDir, targetDir, { overwrite: true });
    }

    #createRequestNResponseTypings (): string {
        let typescript = '';

        for (const typings of this.#routeTypings) {
            typescript += TypescriptGenerator.createRequestNResponseTs(typings.formattedWebRoutes);
        }

        return typescript;
    }

    #createAbsoluteUrlTypings (): string {
        let typescript = '';
        const allAbsoluteUrls: absoluteUrl[] = [];

        for (const typings of this.#routeTypings) {
            allAbsoluteUrls.push(...typings.allAbsoluteUrls);
        }

        typescript += TypescriptGenerator.createRouteParametersMappingTs(allAbsoluteUrls);
        typescript += TypescriptGenerator.createRouteUrlsTs(allAbsoluteUrls);

        return typescript;
    }

    #createRouteParameterInterfacesTypings (): string {
        let typescript = '';

        for (const typings of this.#routeTypings) {
            typescript += TypescriptGenerator.createRouteParametersInterfacesTs(typings.formattedWebRoutes);
        }

        return typescript;
    }

    /**
     * Create an array with all routes and their full names
     *
     * @param routes - The routes to build the typings for
     * @returns An array with all routes
     */
    #makeWebRouteAbsoluteUrls (routes: formattedWebRoutes): absoluteUrl[] {
        const absoluteUrls: absoluteUrl[] = [];

        for (const route of routes.routes) {
            if ('namespace' in route) {
                absoluteUrls.push(...this.#makeWebRouteAbsoluteUrls(route));
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
     * Recursively the definedRoutes into a more convenient format
     *
     * @param routes - The defined routes
     * @param namespace - The namespace which to apply
     * @param fullNamespace - The full namespace of the routes
     * @returns formatted routes
     */
    #formatWebRoutes (routes: WebRoute, namespace: string, fullNamespace: string, routePrefix: string): formattedWebRoutes {
        const formattedWebRoutes: formattedWebRoutes = {
            namespace,
            routes: []
        };
        console.log(routePrefix);

        for (const route of routes.routes) {
            // it's an array, so its a route definition
            if (Array.isArray(route)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [method, name, url, newRoute] = route;

                const routeType: formattedWebRoute = {
                    name,
                    fullName: fullNamespace + '.' + name,
                    responseTypescript: TypescriptGenerator.createTsTypes(name, newRoute.schema),
                    requestTypescript: TypescriptGenerator.createTsTypes('request', newRoute.bodySchema),
                    url: routePrefix + routes.prefix + url,
                    params: this.#findRouteParams(url)
                };

                formattedWebRoutes.routes.push(routeType);
            } else { // it's a route group with subroutes
                // if the route has no name, use the namespace as name
                const namespace = route.name === '' ? fullNamespace : fullNamespace + '.' + route.name;
                formattedWebRoutes.routes.push(this.#formatWebRoutes(route, route.name, namespace, routePrefix + routes.prefix));
            }
        }
        return formattedWebRoutes;
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
}
