import WebRoutes from '@routes/web';
import ApiRoutes from '@routes/api';
import RouteRegistrar from '@routes/RouteRegistrar';
import fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

void server.register(fastifySwagger, {
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

void server.register(fastifySwaggerUI, {
    routePrefix: '/documentation'
});

server.after(() => {
    const registrar = new RouteRegistrar();
    registrar.register(server, WebRoutes);
    registrar.register(server, ApiRoutes);
    console.log(server.printRoutes());
});

async function run (): Promise<void> {
    await server.ready();

    server.listen({ port: 8000 }, (err, address) => {
        if (err != null) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}

run().catch(console.error);
