import { type RouteOptions, type FastifyReply, type FastifyRequest } from 'fastify';
import z from 'zod';

const get: Omit<RouteOptions, 'url' | 'method'> = {
    schema: {
        response: {
            200: z.object({
                hello: z.string()
            })
        }
    },
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
        await reply.send({ hello: 'world' });
    }
};

const test: Omit<RouteOptions, 'url' | 'method'> = {
    schema: {
        response: {
            200: z.object({
                hello: z.string()
            })
        }
    },
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
        await reply.send({ hello: 'test' });
    }
};

export default {
    get,
    test
};
