import dotenv from 'dotenv';
dotenv.config();

interface appConfig {
    /**
     * Database configuration.
     */
    db: {
        host: string
        port: number
        username: string
        password: string
        database: string
    }
    /**
     * OAuth configuration.
     */
    oauth: {
        /**
         * The OAuth client ID.
         */
        id: string
        /**
         * The OAuth client secret.
         */
        secret: string
        /**
         * The host where we should redirect the user to. (127.0.0.1:8080 for local)
         */
        host: string
        /**
         * The host used by oauth to request tokens (http://saproto_sail:80 for local)
         */
        token_host: string
        /**
         * Where should the host redirect to after a successful login? (to us)
         */
        redirect_host_return: string
    }
    /**
     * Defines whether the application is in dev or prod mode.
     */
    env: {
        development: boolean
        production: boolean
    }
    /**
     * Redis configuration.
     */
    redis: {
        host: string
        port: number
    }
    /**
     * Session configuration.
     */
    session: {
        /**
         * Logged in session duration in seconds.
         */
        ttl_seconds: number
        /**
         * The name of the session cookie.
         */
        name: string
        /**
         * The secret used to sign the session cookie.
         */
        secret: string
    }
    /**
     * Server configuration.
     */
    server: {
        /**
         * The port the server should listen on.
         */
        port: number
    }
    /**
     * Saproto site configuration.
     */
    saproto_site: {
        /**
         * The host which should be used for api communication
         */
        api_host: string
        /**
         * The shared secret used for bi-directional authentication with the saproto site.
         */
        api_shared_secret: string
    }
    /**
     * General protube settings
     */
    general: {
        /**
         * The maximum duration of a video in seconds for non-admins.
         */
        max_video_duration: number
    }
    /**
     * Logging configuration.
     */
    logging: {
        /**
         * How many days do we keep the log files
         */
        retention_days: number
        /**
         * Where do we store them
         */
        path: string
    }
}

const config: appConfig = {
    db: {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: parseInt(process.env.DATABASE_PORT ?? '3306'),
        username: process.env.DATABASE_USER ?? 'protube',
        password: process.env.DATABASE_PASSWORD ?? 'protube',
        database: process.env.DATABASE_DB ?? 'protube'
    },
    oauth: {
        id: process.env.OAUTH_ID ?? '0',
        secret: process.env.OAUTH_SECRET ?? '',
        host: process.env.OAUTH_HOST ?? 'http://localhost:8080',
        token_host: process.env.OAUTH_TOKEN_HOST ?? 'http://saproto_sail:80',
        redirect_host_return: process.env.OAUTH_REDIRECT_HOST_RETURN ?? 'http://localhost:3000'
    },
    env: {
        development: process.env.NODE_ENV === 'development',
        production: process.env.NODE_ENV === 'production'
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379')
    },
    session: {
        ttl_seconds: parseInt(process.env.SESSION_TTL_SECONDS ?? '3600'),
        name: process.env.SESSION_NAME ?? 'ptv2-session',
        secret: process.env.SESSION_SECRET ?? 'not so very secret and it must be minimal 32 chars long'
    },
    server: {
        port: parseInt(process.env.PORT ?? '8000')
    },
    saproto_site: {
        api_host: process.env.SAPROTO_SITE_HOST ?? 'http://saproto_sail:80',
        api_shared_secret: process.env.SAPROTO_SITE_API_SHARED_SECRET ?? '123'
    },
    general: {
        max_video_duration: parseInt(process.env.GENERAL_MAX_VIDEO_DURATION ?? '600')
    },
    logging: {
        retention_days: parseInt(process.env.LOGGING_RETENTION_DAYS ?? '14'),
        path: process.env.LOGGING_PATH ?? 'logs'
    }
};

export default config;
