import { webRoute } from '@app/Kernel/Routes/Web/Registrar';
import UserSchema from '@app/Schemas/UserSchema';
import z from 'zod';

export const userInfo = webRoute({
    schema: UserSchema,
    handler: async (request, reply) => {
        await reply.send(request.user);
    }
});

export const adminInfo = webRoute({
    schema: z.object({
        incr: z.number()
    }),
    handler: async (request, reply) => {
        const incr = request.session.get('incremental') ?? 1;
        request.session.set('incremental', parseInt(incr as string) + 1);
        await request.session.save();

        await reply.send({ incr: incr as number });
    }
});
