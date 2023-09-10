import { route } from '@Kernel/RouteRegistrar';
import UserSchema from '@app/Schemas/UserSchema';

export const userInfo = route({
    schema: UserSchema,
    handler: async (request, reply) => {
        reply.send(request.user);
    }
});

export const adminInfor = route({
    schema: UserSchema,
    handler: async (request, reply) => {
        reply.send(request.user);
    }
});
