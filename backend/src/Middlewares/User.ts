import { User } from '#Models/User.js';
import { type FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyRequest {
        /*
        * The user that is currently logged in.
        * (Only available on authenticated routes)
        */
        user: User
    }
}

async function loadUser (fastify: FastifyInstance, options: unknown): Promise<void> {
    fastify.decorateRequest('user', null);

    fastify.addHook('preHandler', async (req, reply) => {
        const user = await User.findByPk(req.session.get('user_id'));
        if (user === null) {
            // url defined via fastify-plugin (Kernel/Authentication)
            await reply.redirect('/auth/login');
            return;
        }
        req.user = user;
    });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(loadUser);
