import { type FastifyInstance } from 'fastify';
import c from 'config';
import oauthPlugin, { type OAuth2Namespace } from '@fastify/oauth2';

declare module 'fastify' {
    interface FastifyInstance {
        saproto: OAuth2Namespace
    }
}

export async function registerAuthentication (fastify: FastifyInstance): Promise<void> {
    await fastify.register(oauthPlugin, {
        name: 'saproto',
        credentials: {
            client: {
                id: '1',
                secret: 'PVZcFei1IDHzwpihmJWd5owU1xHAUktFJMvIAZm9'
            },
            auth: {
                authorizeHost: c.oauth.host,
                authorizePath: '/oauth/authorize',
                tokenHost: c.oauth.host,
                tokenPath: '/oauth/token'
            }
        },
        startRedirectPath: '/login',
        callbackUri: 'http://localhost:8000/auth/callback',
        scope: []
    });

    fastify.get('/auth/callback', async function (request, reply) {
        // const { token } = await this.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const token = await this.saproto.getAccessTokenFromAuthorizationCodeFlow(request);

        console.log(token);
        
        // if later you need to refresh the token you can use
        // const { token: newToken } = await this.getNewAccessTokenUsingRefreshToken(token)

        // await reply.send({ access_token: token });
        await reply.redirect('/api/v1/test');
    });
}
