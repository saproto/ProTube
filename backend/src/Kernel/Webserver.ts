import WebRoutes from '@routes/web';
import ApiRoutes from '@routes/api';
import RouteRegistrar from '@Kernel/RouteRegistrar';
import fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { registerAuthentication } from './Authentication';
import { fastifyRoutes } from '@fastify/routes';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import RedisStore from 'connect-redis';
import redis from '@Kernel/Redis';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';

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
    await server.register(fastifyCors);
    await server.register(fastifyCookie);
    await server.register(fastifySession, {
        // ToDo: fill up the cookie's options
        cookie: {
            secure: false,
            maxAge: 1000 * 3600,
            domain: 'localhost'
        },
        store: new RedisStore({
            client: redis,
            prefix: 'session:'
        }),
        secret: 'a secret with minimum length of 32 characters'
    });

    await registerAuthentication(server);

    const registrar = new RouteRegistrar();
    registrar.register(server, WebRoutes);
    registrar.register(server, ApiRoutes);

    console.log(server.printRoutes());
    registrar.exportRouteTypings();

    await server.ready();

    server.listen({ port: 8000 }, (err, address) => {
        if (err != null) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
