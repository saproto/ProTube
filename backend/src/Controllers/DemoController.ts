import { User } from '@app/Models/User';
import UserSchema from '@app/Schemas/UserSchema';
import { route } from '@routes/RouteRegistrar';
import z from 'zod';

export const firstRoute = route({
    schema: UserSchema,
    handler: async (request, reply) => {
        const users = await User.findAll();
        reply.send(users);
    }
});

export const createUser = route({
    schema: z.object({}),
    handler: async (request, reply) => {
        await User.create({
            name: 'test',
            admin: true
        });

        reply.send({});
    }
});
