import z from 'zod';
import { User } from '#Models/User.js';
import UserSchema from '#Schemas/UserSchema.js';
import { webRoute } from '#Kernel/Routes/Web/Registrar.js';
import { type OAuth2Token } from '@fastify/oauth2';
import { SaprotoApiService } from '#Services/SaprotoApiService.js';

export const loginCallback = webRoute({
    schema: z.null(),
    handler: async (request, reply) => {
        let token: OAuth2Token;
        try {
            // @ts-expect-error The typing is fucked but it should work (it doesn't like the modified reply)
            token = (await request.server.saproto.getAccessTokenFromAuthorizationCodeFlow(request, reply) as OAuth2Token);
            console.log(token);
        } catch (e) {
            console.log(e);
            await reply.redirect('/auth/login');
            return;
        }

        const apiClient = new SaprotoApiService(token.token.access_token);
        const userData = await apiClient.getUserDetails();

        if (!userData.authenticated) {
            reply.statusCode = 401;
            throw new Error('Unauthenticated');
        }

        const data = {
            id: userData.id,
            admin: userData.admin,
            name: userData.name,
            refresh_token: token.token.refresh_token ?? '',
            access_token: token.token.access_token
        };

        const user = await User.updateOrCreate({ id: userData.id }, data);
        request.session.set('user_id', user.id);

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
        const user = request.user;
        await reply.send(user);
    }
});
