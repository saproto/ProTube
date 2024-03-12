import log from '#App/Kernel/Services/Logging.js';
import { type FastifyInstance } from 'fastify';
import { type Socket, type Server, type Namespace } from 'socket.io';
import { type ZodTypeAny } from 'zod';
import type z from 'zod';

export type preConnectionSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export type postConnectionSocketMiddleware = (socket: Socket) => (event: any, next: (err?: Error) => void) => void;

type url = `/${string}`;
type RouteDefinition = ['listen for', string, socketEventInterface<any, any>] | ['emit event', string, socketEmitInterface<any, any>];

interface socketEventInterface<Data extends ZodTypeAny, Callback extends ZodTypeAny> {
    schema?: ZodTypeAny
    callbackSchema?: ZodTypeAny
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

interface socketEmitInterface<Data extends ZodTypeAny, EventName extends string> {
    emit: (
        socket: Socket,
        ...args: Data extends Zod.ZodNever
            ? EventName extends string ? [ ] : [ ]
            : [ data: z.infer<Data> ]
    ) => void
    broadcast: (
        socket: Namespace,
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
        broadcast: (namespace, ...args: Data extends Zod.ZodNever
            ? [ ]
            : [ data: z.infer<Data> ]) => {
            if (args.length === 1) {
                namespace.emit(input.name, args[0]);
                return;
            }
            namespace.emit(input.name);
        },
        schema: input.schema
    };
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
        callbackSchema: input.callbackSchema,
        handler: input.handler
    };
}

export type bootedNamespace = (namespace: Namespace) => Promise<void>;

export interface SocketRoute {
    namespace: url
    name: string
    preConnectionMiddlewares: preConnectionSocketMiddleware[]
    postConnectionMiddlewares: postConnectionSocketMiddleware[]
    connectionEvent?: (socket: Socket) => void
    disconnectEvent?: (socket: Socket) => void
    booted?: bootedNamespace
    routes: RouteDefinition[]
}

export default class SocketRouteRegistrar {
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
    }

    async #registerRoute (io: Server, route: SocketRoute): Promise<void> {
        const server = io.of(route.namespace);

        route.preConnectionMiddlewares.forEach((middleware) => {
            server.use(middleware);
        });

        if (route.booted !== undefined) {
            await route.booted(server);
            log.info('USERSOCKET', `booted namespace ${route.namespace}`);
        }

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
}
