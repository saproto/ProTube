import z from 'zod';
import c from '@Kernel/Config';
import { User } from '@app/Models/User';
import router from '@Services/RoutingService';
import { route } from '@app/Kernel/RouteRegistrar';
import UserSchema from '@app/Schemas/UserSchema';

export const loginCallback = route({
    schema: z.null(),
    handler: async (request, reply) => {
        const token = await request.server.saproto.getAccessTokenFromAuthorizationCodeFlow(request);

        interface AuthenticatedUser {
            authenticated: true
            name: string
            admin: boolean
            id: number
        }

        interface UnauthenticatedUser {
            authenticated: false
        }

        type User = AuthenticatedUser | UnauthenticatedUser;

        const response = await fetch(
            `${c.oauth.host}/api/protube/userdetails`,
            {
                headers: {
                    Authorization: `Bearer ${token.token.access_token}`
                }
            }
        );
        const userData: User = await response.json();

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

        await reply.redirect(router('http.user'));
    }
});

export const user = route({
    schema: UserSchema,
    handler: async (request, reply) => {
        if (request.user === undefined) {
            await reply.redirect('/auth/login');
            return;
        }
        await reply.send(request.user);
    }
});
