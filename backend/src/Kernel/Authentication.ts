import { type FastifyInstance } from 'fastify';
import c from 'config';
import oauthPlugin, { type OAuth2Namespace } from '@fastify/oauth2';
import crypto from 'crypto';
import { User } from '@app/Models/User';
import route from '@Services/RoutingService';
declare module 'fastify' {
    interface FastifyInstance {
        saproto: OAuth2Namespace
    }
    interface Session {
        user_id: number
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
        startRedirectPath: '/api/auth/login',
        callbackUri: 'http://localhost:8000/auth/callback',
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

    fastify.get('/auth/callback', async function (request, reply) {
        const token = await this.saproto.getAccessTokenFromAuthorizationCodeFlow(request);

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
              await reply.send('/unauthenticated');
              return;
          }

          await User.upsert({
              id: userData.id,
              name: userData.name,
              admin: userData.admin,
              refresh_token: token.token.refresh_token ?? '',
              access_token: token.token.access_token
          });

          request.session.set('user_id', userData.id);

          await reply.redirect(route('http.user'));
    });
}
