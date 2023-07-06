import fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

const server = fastify();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// const opts: ZodTypeProvider = {
//     schema: {
//         querystring: z.object({
//             name: z.string().min(4)
//         }),
//         response: {
//             200: z.string()
//         }
//     },
//     handler: async function (request, reply) {
//         await reply.send({ helo: 'world' });
//     }
// };

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
    server.withTypeProvider<ZodTypeProvider>().route({
        method: 'GET',
        url: '/home',
        // Define your schema
        schema: {
            querystring: z.object({
                name: z.string()
            }),
            response: {
                200: z.string()
            }
        },
        handler: async (req, res) => {
            await res.send(req.query.name);
        }
    });
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
