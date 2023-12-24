import dotenv from 'dotenv';
dotenv.config();

interface appConfig {
    db: {
        host: string
        port: number
        username: string
        password: string
        database: string
    }
    oauth: {
        id: string
        secret: string
        host: string
        redirect_host: string
    }
    env: {
        development: boolean
        production: boolean
    }
    redis: {
        host: string
        port: number
    }
    session: {
        ttl_seconds: number
        name: string
        secret: string
    }
    server: {
        port: number
    }
    saproto_site: {
        api_url: string
        api_shared_secret: string
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
        host: process.env.OAUTH_HOST ?? 'https://proto.utwente.nl',
        redirect_host: process.env.OAUTH_REDIRECT_HOST ?? 'http://localhost:3000'
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
        api_url: process.env.SAPROTO_SITE_API_URL ?? 'http://saproto_sail:80/api/protube',
        api_shared_secret: process.env.SAPROTO_SITE_API_SHARED_SECRET ?? '123'
    }
};

export default config;
