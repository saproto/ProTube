import root from '#App/rootPath.js';
import c from '#Config.js';
import { defineConfig } from '@adonisjs/lucid';
import path from 'path';

const dbConfig = defineConfig({
    connection: 'mysql',
    connections: {
        mysql: {
            client: 'mysql2',
            connection: {
                host: c.db.host,
                port: c.db.port,
                user: c.db.username,
                password: c.db.password,
                database: c.db.database
            },
            migrations: {
                paths: [path.resolve(root(), 'Migrations')],
                tableName: 'migrations'
            }
        }
    }
});

export default dbConfig;
