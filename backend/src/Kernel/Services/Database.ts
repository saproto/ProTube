import c from '#Config.js';
import mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import { loadUser } from '#Models/User.js';

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
    loadUser(sequelize);
    await sequelize.sync({ force: true });
}
