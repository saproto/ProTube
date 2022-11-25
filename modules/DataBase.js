require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

exports.sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: process.env.MYSQL_QUERY_LOGGING === 'true' ? (msg) => logger.dbLog(msg) : false,
    }
);

//checking the database connection
this.sequelize.authenticate().then(() => {
    logger.dbLog('Connection has been established successfully to the database');
    logger.serverInfo('Connection has been established successfully to the database');
}).catch((error) => {
    logger.dbLog(`Unable to connect to the database: ${error.toString()}`);
    logger.serverError(`Unable to connect to the database: ${error.toString()}`);
    process.exit(10);
});

// user model
exports.User = this.sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    admin: DataTypes.BOOLEAN,
    refresh_token: DataTypes.TEXT,
    access_token: DataTypes.TEXT
});

exports.ScreenCode = this.sequelize.define("screencodes", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        unique: true
    },
    banned_until: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    connection_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

exports.Session = this.sequelize.define("sessions", {
    sid: {
        type: DataTypes.STRING(36),
        primaryKey: true
    },
    expires: DataTypes.DATE,
    data: DataTypes.TEXT
});

this.ScreenCode.belongsTo(this.User, { foreignKey: 'user_id' });
this.User.hasOne(this.ScreenCode, { foreignKey: 'user_id' })

//syncing user tables
this.sequelize.sync().then(() => {
    logger.dbLog("Successfully synchronized tables!");
}).catch((error) => {
    logger.dbLog("Unable to sync tables");
    process.exit(10);
});