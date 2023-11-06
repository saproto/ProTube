import { type FastifyInstance } from 'fastify';
import { copySync } from 'fs-extra';
import { type Socket, type Server } from 'socket.io';
import type z from 'zod';
import { type ZodTypeAny } from 'zod';
import RouteTypeExporter, { type exportedRoutes, type allRoutes, type routeTypings, type exportRoute } from '@app/Kernel/Routes/RouteTypeExporter';
import { writeFileSync } from 'fs';
import path from 'path';
import root from '@app/rootPath';

export type preConnectionSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export type postConnectionSocketMiddleware = (socket: Socket) => (event: any, next: (err?: Error) => void) => void;

type url = `/${string}`;

type RouteDefinition = ['listen for', string, socketEventInterface<any, any>] | ['emit event', string, socketEmitInterface<any, any>];

export interface SocketRoute {
    namespace: url
    name: string
    preConnectionMiddlewares: preConnectionSocketMiddleware[]
    postConnectionMiddlewares: postConnectionSocketMiddleware[]
    connectionEvent?: (socket: Socket) => void
    disconnectEvent?: (socket: Socket) => void
    routes: RouteDefinition[]
}

interface socketEventInterface<Data extends ZodTypeAny, Callback extends ZodTypeAny> {
    schema?: ZodTypeAny
    bodySchema?: ZodTypeAny
    handler: (socket: Socket,
        ...args: Data extends Zod.ZodNever
            ? (
                Callback extends Zod.ZodNever
                    ? []
                    : [callback: (cb: z.infer<Callback>) => void]
            )
            : (
                Callback extends Zod.ZodNever
                    ? [data: z.infer<Data>]
                    : [data: z.infer<Data>, callback: (cb: Callback extends undefined ? never : z.infer<Callback>) => void]
            )
    ) => Promise<void> | void
}

export function onSocketEvent<Data extends ZodTypeAny = Zod.ZodNever, Callback extends ZodTypeAny = Zod.ZodNever> (
    input: {
        schema?: Data
        callbackSchema?: Callback
        handler: (socket: Socket,
            ...args: Data extends Zod.ZodNever
                ? (
                    Callback extends Zod.ZodNever
                        ? []
                        : [callback: (cb: z.infer<Callback>) => void]
                )
                : (
                    Callback extends Zod.ZodNever
                        ? [data: z.infer<Data>]
                        : [data: z.infer<Data>, callback: (cb: z.infer<Callback>) => void]
                )
        ) => Promise<void> | void
    }): socketEventInterface<Data, Callback> {
    return {
        schema: input.schema,
        bodySchema: input.callbackSchema,
        handler: input.handler
    };
}

interface socketEmitInterface<Data extends ZodTypeAny, EventName extends string> {
    emit: (
        socket: Socket,
        ...args: Data extends Zod.ZodNever
            ? EventName extends string ? [ ] : [ ]
            : [ data: z.infer<Data> ]
    ) => void
    schema: Data
}

export function socketEmit<Data extends ZodTypeAny = Zod.ZodNever, EventName extends string = any> (
    input: {
        name: EventName
        schema: Data
    }
): socketEmitInterface<Data, EventName> {
    return {
        emit: (socket, ...args: Data extends Zod.ZodNever
            ? [ ]
            : [ data: z.infer<Data> ]) => {
            if (args.length === 1) {
                socket.emit(input.name, args[0]);
                return;
            }
            socket.emit(input.name);
        },
        schema: input.schema
    };
}

export default class SocketRegistrar {
    #routeTypeExporter: RouteTypeExporter;

    constructor () {
        this.#routeTypeExporter = new RouteTypeExporter();
    }

    /**
     * Register the routes from the routes file with fastify and build its typings
     *
     * @param fastify - The fastify instance
     * @param routes - The socket routes to register
     */
    async register (fastify: FastifyInstance, routes: SocketRoute[]): Promise<void> {
        const io = fastify.io;

        for (const route of routes) {
            await this.#registerRoute(io, route);
        }

        this.onlyLoadRoutes(routes, 'socket.');
    }

    /**
     * Load and prepare the typings for the routes
     *
     * @param routes - The routes to load in
     * @param name - The name prefix to use for the routes
     */
    onlyLoadRoutes (routes: SocketRoute[], name: string): void {
        for (const route of routes) {
            const exportedRoutes = this.#formatExportedRoutes(route, name, 'callback');

            const routeTyping: routeTypings = {
                name: name + route.name,
                allRoutes: this.#routeTypeExporter.getAllRoutes(exportedRoutes),
                exportedRoutes
            };
            this.#routeTypeExporter.routeTypings.push(routeTyping);
        }
    }

    async #registerRoute (io: Server, route: SocketRoute): Promise<void> {
        const server = io.of(route.namespace);

        route.preConnectionMiddlewares.forEach((middleware) => {
            server.use(middleware);
        });

        server.on('connection', (socket) => {
            if (route?.connectionEvent !== undefined ?? false) {
                // @ts-expect-error smh this gives an error while I think I've properly checked it for undefined
                route.connectionEvent(socket);
            }

            if (route?.disconnectEvent !== undefined ?? false) {
                socket.on('disconnect', () => {
                    // @ts-expect-error smh this gives an error while I think I've properly checked it for undefined
                    route.disconnectEvent(socket);
                });
            }

            for (const middleware of route.postConnectionMiddlewares) {
                socket.use(middleware(socket));
            }

            for (const _socketRoute of route.routes) {
                const [eventName, eventHandler] = _socketRoute;

                console.log(`[SOCKET] ${route.namespace} ${eventName}`);
                socket.on(eventName, async (...args) => {
                    // @ts-expect-error The no. arguments is unknown here, pass them to the handler
                    await eventHandler.handler(socket, ...args);
                });
            };
        });
    }

    /**
     * Export the route typings to be used by the backend and frontend
     */
    exportRouteTypings (): void {
        const allRoutes: allRoutes[] = [];

        let builtRouteResponseTypings = '';
        // let builtParamRouteTypes = '';

        for (const typings of this.#routeTypeExporter.routeTypings) {
            allRoutes.push(...typings.allRoutes);
            builtRouteResponseTypings += this.#routeTypeExporter.buildSocketRouteCallbackTypes(typings.exportedRoutes, typings.name);
            // builtParamRouteTypes += this.#routeTypeExporter.buildParamRouteTypes(typings.exportedRoutes);
            this.#routeTypeExporter.printRoutes(typings.exportedRoutes, typings.name);
        }

        // const routeParamsMap = this.#routeTypeExporter.buildRouteParamsMap(allRoutes);
        // const routeUrlMap = this.#routeTypeExporter.buildUrlMap(allRoutes);

        // writeFileSync(path.resolve(root(), 'routes/typings/socket-route-typings.ts'), builtParamRouteTypes + routeParamsMap + routeUrlMap + '\n');
        writeFileSync(path.resolve(root(), 'routes/typings/socket-route-typings.ts'), this.#routeTypeExporter.buildSocketToServerCallbackTypeMap(allRoutes, this.#routeTypeExporter.routeTypings) + '\n');
        writeFileSync(path.resolve(root(), 'routes/typings/socket-response-typings.d.ts'), builtRouteResponseTypings);

        const sourceDir = path.join(path.resolve(root(), 'routes/typings'));
        const targetDir = path.join(path.resolve(root(), '../../frontend/src/utils/route-typings'));

        copySync(sourceDir, targetDir, { overwrite: true });
    }

    /**
     * Recursively the definedRoutes into a more convenient format
     *
     * @param routes - The defined routes
     * @returns formatted routes
     */
    #formatExportedRoutes (socketRoute: SocketRoute, routePrefix: string): exportedRoutes {
        const exportedRoutes: exportedRoutes = {
            namespace: routePrefix + socketRoute.name,
            routes: []
        };

        for (const route of socketRoute.routes) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [emitOrListen, eventName, handler] = route;

            const routeType: exportRoute = {
                name: eventName,
                fullName: routePrefix + socketRoute.name + '.' + eventName,
                type: this.#routeTypeExporter.createTsTypes(eventName, handler.schema),
                bodyType: emitOrListen === 'listen for' ? this.#routeTypeExporter.createTsTypes('callback', handler.bodySchema) : '',
                url: socketRoute.namespace,
                params: []
            };

            exportedRoutes.routes.push(routeType);
        }
        return exportedRoutes;
    }
}
