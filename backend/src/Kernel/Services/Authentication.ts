import { type FastifyInstance } from 'fastify';
import c from '#Config.js';
import oauthPlugin, { type OAuth2Namespace } from '@fastify/oauth2';
import crypto from 'crypto';

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
                id: c.oauth.id,
                secret: c.oauth.secret
            },
            auth: {
                authorizeHost: c.oauth.host,
                authorizePath: '/oauth/authorize',
                tokenHost: c.oauth.token_host,
                tokenPath: '/oauth/token'
            }
        },
        pkce: 'S256',
        startRedirectPath: '/auth/login',
        tags: ['guest'],
        callbackUri: `${c.oauth.redirect_host_return}/auth/login/callback`,
        scope: [],
        generateStateFunction: (request) => {
            const state = crypto.randomBytes(16).toString('base64url');
            request.session.set('oauth-state', state);
            return state;
        },
        checkStateFunction: (request) => {
            // @ts-expect-error no typing found
            if (request.query.state === request.session.get('oauth-state')) {
                return true;
            }
            return false;
        }
    });
}
