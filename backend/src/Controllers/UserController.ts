import { route } from '@Kernel/RouteRegistrar';
import UserSchema from '@app/Schemas/UserSchema';

export const userInfo = route({
    schema: UserSchema,
    handler: async (request, reply) => {
        const user = request.session.get('user');
        if (user === undefined) {
            throw Error('User not found');
        }

        reply.send(user);
    }
});
