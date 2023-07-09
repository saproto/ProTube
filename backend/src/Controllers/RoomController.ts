import { User } from '@app/Models/User';
import UserSchema from '@app/Schemas/UserSchema';
import { type RouteOptions, type FastifyReply, type FastifyRequest } from 'fastify';
import z from 'zod';

const get: Omit<RouteOptions, 'url' | 'method'> = {
    schema: {
        response: {
            200: z.object({
                hello: z.array(UserSchema)
            })
        }
    },
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
        const users = await User.findAll({ raw: true });
        console.log(users);
        await reply.send({ hello: users });
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
        await User.create({
            name: 'test',
            admin: true
        });
        await reply.send({ hello: 'test' });
    }
};

export default {
    get,
    test
};
