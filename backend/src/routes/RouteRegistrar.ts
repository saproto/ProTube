import { type RouteOptions, type FastifyInstance, type HTTPMethods } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';

type RouteDefinition = [HTTPMethods, string, Omit<RouteOptions, 'url' | 'method'>];

export interface DefinedRoutes {
    prefix: string
    middlewares: string[]
    routes: Array<RouteDefinition | DefinedRoutes>
}

export default class WebRoutes {
    register (fastify: FastifyInstance, routes: DefinedRoutes, prefix = ''): void {
        this.#registerRoute(fastify, routes, prefix + routes.prefix);
    }

    #registerRoute (fastify: FastifyInstance, routes: DefinedRoutes, prefix?: string): void {
        for (const route of routes.routes) {
            if (Array.isArray(route)) {
                fastify.withTypeProvider<ZodTypeProvider>().route({
                    ...route[2],
                    method: route[0],
                    url: (prefix ?? '') + route[1]
                });
            } else {
                this.#registerRoute(fastify, route, (prefix ?? '') + route.prefix);
            }
        }
    }
}
