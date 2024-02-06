import c from '#Config.js';
import mysql2 from 'mysql2';
import { type QueryInterface, Sequelize } from 'sequelize';

export type Migration = ({ context }: { context: { queryInterface: QueryInterface } }) => Promise<void>;

const sequelize = new Sequelize(
    c.db.database,
    c.db.username,
    c.db.password,
    {
        host: c.db.host,
        port: c.db.port,
        dialect: 'mysql',
        dialectModule: mysql2,
        logging: false
    }
);

export async function startDatabaseConnection (): Promise<void> {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
}
