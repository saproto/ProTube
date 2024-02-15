import WebRoutes from '#Routes/web.js';
import GuestRoutes from '#Routes/guest.js';
import SocketRoutes from '#Routes/socket.js';
import fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { registerAuthentication } from '#Kernel/Services/Authentication.js';
import { fastifyRoutes } from '@fastify/routes';
import fastifyCookie from '@fastify/cookie';
import redisClient from '#Kernel/Services/Redis.js';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifySession from '@mgcrea/fastify-session';
import socketioServer from 'fastify-socket.io';
import RedisStore from '@mgcrea/fastify-session-redis-store';
import c from '#Config.js';
import fastifySocketSession from 'fastify-socketio-session';
import WebRouteRegistrar from '#Kernel/Routes/Web/Registrar.js';
import SocketRouteRegistrar from '#Kernel/Routes/Socket/Registrar.js';

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

export async function startWebServer (): Promise<void> {
    await server.register(fastifyRoutes);
    await server.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'ProTube backend API documentation',
                description: 'Cool shit',
                version: '1.0.0'
            },
            servers: [{
                url: 'http://localhost:{port}',
                description: 'ProTube frontend',
                variables: {
                    port: {
                        default: '3000',
                        description: 'The port on which the frontend is running (locally)'
                    }
                }
            }]
        },
        transform: jsonSchemaTransform
        // You can also create transform with custom skiplist of endpoints that should not be included in the specification:
        //
        // transform: createJsonSchemaTransform({
        //   skipList: [ '/documentation/static/*' ]
        // })
    });

    await server.register(fastifySwaggerUI, {
        routePrefix: '/documentation'
    });

    await server.register(fastifyHelmet);
    await server.register(fastifyCors, {
        origin: 'http://localhost:3000'
    });
    await server.register(fastifyCookie);
    // // ToDo: further session security (keys, etc)
    await server.register(fastifySession, {
        store: new RedisStore({
            client: redisClient,
            ttl: c.session.ttl_seconds,
            prefix: 'session:'
        }),
        secret: c.session.secret,
        cookie: {
            maxAge: c.session.ttl_seconds
        },
        cookieName: c.session.name
    });

    // @ts-expect-error idk why this is not working, but smh it does
    await server.register(socketioServer, {
        cors: {
            origin: 'http://localhost:3000',
            credentials: true
        }
    });
    await server.register(fastifySocketSession);

    await registerAuthentication(server);

    const webRegistrar = new WebRouteRegistrar();
    await webRegistrar.register(server, WebRoutes);
    await webRegistrar.register(server, GuestRoutes);

    console.log(server.printRoutes());

    await server.ready();

    const socketRegistrar = new SocketRouteRegistrar();
    await socketRegistrar.register(server, SocketRoutes);

    server.listen({ port: c.server.port }, (err, address) => {
        if (err != null) throw err;

        console.log(`Server listening at ${address}`);
    });
}
