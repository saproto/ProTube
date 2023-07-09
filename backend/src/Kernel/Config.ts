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
}

const config: appConfig = {
    db: {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: parseInt(process.env.DATABASE_PORT ?? '3306'),
        username: process.env.DATABASE_USER ?? 'protube',
        password: process.env.DATABASE_PASSWORD ?? 'protube',
        database: process.env.DATABASE_DB ?? 'protube'
    }
};

export default config;
