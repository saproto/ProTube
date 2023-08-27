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
    }
};

export default config;
