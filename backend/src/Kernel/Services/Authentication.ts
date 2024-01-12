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
                tokenHost: c.oauth.host,
                tokenPath: '/oauth/token'
            }
        },
        startRedirectPath: '/auth/login',
        callbackUri: `${c.oauth.redirect_host}/auth/login/callback`,
        scope: [],
        // @ts-expect-error No typing available
        generateStateFunction: (request) => {
            const state = crypto.randomBytes(16).toString('base64url');
            request.session.set('oauth-state', state);
            return state;
        },
        // @ts-expect-error No typing available
        checkStateFunction: (request, callback) => {
            const sessionState = request.session.get('oauth-state');
            if (request.query.state === sessionState) {
                callback();
                return;
            }
            callback(new Error('Invalid state'));
        }
    });
}
