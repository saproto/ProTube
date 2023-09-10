import { type FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

async function loadAdmin (fastify: FastifyInstance, options: unknown): Promise<void> {
    fastify.addHook('preHandler', async (req, reply) => {
        const user = req.user;

        if (user.isAdmin()) {
            return;
        };

        reply.statusCode = 403;
        throw new Error('Only for admins!');
    });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(loadAdmin);
