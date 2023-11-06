import { type WebRoute } from '@app/Kernel/Routes/Web/Registrar';
import * as typescriptGenerator from './TypescriptGenerator';
import { writeFileSync } from 'fs';
import path from 'path';
import root from '@app/rootPath';
import { copySync } from 'fs-extra';

export interface routeParam {
    param: string
    optional: boolean
}

export interface formattedWebRoute {
    fullName: string
    name: string
    type: string
    bodyTypescript: string
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
        writeFileSync(path.resolve(root(), 'routes/typings/routes.ts'), routeParameterInterfaces + routes + '\n');

        // const routeParamsMap = this.#routeTypeExporter.buildRouteParamsMap(allRoutes);
        // const routeUrlMap = this.#routeTypeExporter.buildUrlMap(allRoutes);

        // writeFileSync(path.resolve(root(), 'routes/typings/route-typings.ts'), builtParamRouteTypes + routeParamsMap + routeUrlMap + '\n');
        // writeFileSync(path.resolve(root(), 'routes/typings/response-typings.d.ts'), builtRouteResponseTypings);

        const sourceDir = path.join(path.resolve(root(), 'routes/typings'));
        const targetDir = path.join(path.resolve(root(), '../../frontend/src/utils/route-typings'));

        copySync(sourceDir, targetDir, { overwrite: true });
    }

    #createAbsoluteUrlTypings (): string {
        let typescript = '';
        const allAbsoluteUrls: absoluteUrl[] = [];

        for (const typings of this.#routeTypings) {
            allAbsoluteUrls.push(...typings.allAbsoluteUrls);
        }

        typescript += typescriptGenerator.createRouteParametersMappingTs(allAbsoluteUrls);
        typescript += typescriptGenerator.createRouteUrlsTs(allAbsoluteUrls);

        return typescript;
    }

    #createRouteParameterInterfacesTypings (): string {
        let typescript = '';

        for (const typings of this.#routeTypings) {
            typescript += typescriptGenerator.createRouteParametersInterfacesTs(typings.formattedWebRoutes);
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
                console.log(route.fullName);
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
                    type: typescriptGenerator.createTsTypes(name, newRoute.schema),
                    bodyTypescript: typescriptGenerator.createTsTypes('request', newRoute.bodySchema),
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

    // /**
    //  * Print all routes to a json file for debugging
    //  *
    //  * @param routes - The routes to print
    //  * @param name - The name prefix of the routes
    //  */
    // #debugRoutes (routes: formattedWebRoutes, name: string): void {
    //     if (!this.#debugRoutes) return;

    //     writeFileSync(path.resolve(__dirname, `./${name}_types.json`), JSON.stringify(routes, null, 2));
    // }
}
