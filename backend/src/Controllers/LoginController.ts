import z from 'zod';
import { User } from '#Models/User.js';
import UserSchema from '#Schemas/UserSchema.js';
import { webRoute } from '#Kernel/Routes/Web/Registrar.js';
import { type OAuth2Token } from '@fastify/oauth2';
import { SaprotoApiService } from '#Services/SaprotoApiService.js';

export const loginCallback = webRoute({
    schema: z.null(),
    handler: async (request, reply) => {
        // @ts-expect-error The typing is fucked but it should work (it doesn't like the modified reply)
        const token = (await request.server.saproto.getAccessTokenFromAuthorizationCodeFlow(request, reply) as OAuth2Token);

        const apiClient = new SaprotoApiService(token.token.access_token);
        const userData = await apiClient.getUserDetails();

        if (!userData.authenticated) {
            reply.statusCode = 401;
            throw new Error('Unauthenticated');
        }

        await User.upsert({
            id: userData.id,
            name: userData.name,
            admin: userData.admin,
            refresh_token: token.token.refresh_token ?? '',
            access_token: token.token.access_token
        });

        request.session.set('user_id', userData.id);

        await reply.redirect('/');
    }
});

export const user = webRoute({
    schema: UserSchema,
    handler: async (request, reply) => {
        if (request.user === undefined) {
            await reply.redirect('/auth/login');
            return;
        }
        await reply.send(request.user);
    }
});
