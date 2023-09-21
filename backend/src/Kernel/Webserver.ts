import WebRoutes from '@routes/web';
import GuestRoutes from '@routes/guest';
import RouteRegistrar from '@Kernel/RouteRegistrar';
import fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { registerAuthentication } from './Authentication';
import { fastifyRoutes } from '@fastify/routes';
import fastifyCookie from '@fastify/cookie';
import redisClient from '@Kernel/Redis';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifySession from '@mgcrea/fastify-session';
import socketioServer from 'fastify-socket.io';
import RedisStore from '@mgcrea/fastify-session-redis-store';
import c from 'config';
import fastifySocketSession from 'fastify-socketio-session';

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

export async function startWebServer (): Promise<void> {
    await server.register(fastifyRoutes);
    await server.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'SampleApi',
                description: 'Sample backend service',
                version: '1.0.0'
            },
            servers: []
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
        origin: '*'
    });
    await server.register(fastifyCookie);
    // ToDo: further session security (keys, etc)
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

    await server.register(socketioServer);
    await server.register(fastifySocketSession);

    await registerAuthentication(server);

    const registrar = new RouteRegistrar();
    await registrar.register(server, WebRoutes);
    await registrar.register(server, GuestRoutes);

    console.log(server.printRoutes());
    registrar.exportRouteTypings();

    await server.ready();

    server.listen({ port: 8000 }, (err, address) => {
        if (err != null) throw err;

        console.log(`Server listening at ${address}`);
    });
}
