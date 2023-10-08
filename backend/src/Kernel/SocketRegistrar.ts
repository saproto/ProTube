import { type FastifyInstance } from 'fastify';
import { type Socket, type Server } from 'socket.io';
import type z from 'zod';
import { type ZodTypeAny } from 'zod';

export type preConnectionSocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;
export type postConnectionSocketMiddleware = (socket: Socket) => (event: any, next: (err?: Error) => void) => void;

type url = `/${string}`;

type RouteDefinition = [string, socketRouteInterface<any, any>];

export interface SocketRoute {
    namespace: url
    preConnectionMiddlewares: preConnectionSocketMiddleware[]
    postConnectionMiddlewares: postConnectionSocketMiddleware[]
    connectionEvent?: (socket: Socket) => void
    disconnectEvent?: (socket: Socket) => void
    routes: RouteDefinition[]
}

interface socketRouteInterface<Data extends ZodTypeAny, Callback extends ZodTypeAny> {
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

export function socketRoute<Data extends ZodTypeAny = Zod.ZodNever, Callback extends ZodTypeAny = Zod.ZodNever> (
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
    }): socketRouteInterface<Data, Callback> {
    return {
        schema: input.schema,
        bodySchema: input.callbackSchema,
        handler: input.handler
    };
}

// socketRoute({
//     // schema: UserSchema,
//     callbackSchema: z.string(),
//     // callbackSchema: UserSchema,
//     handler: (socket, data) => {
//         data('test');
//     }
// });

export default class SocketRegistrar {
    async register (fastify: FastifyInstance, routes: SocketRoute[]): Promise<void> {
        const io = fastify.io;
        for (const route of routes) {
            console.log(route);
            await this.#registerRoute(io, route);
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
}
