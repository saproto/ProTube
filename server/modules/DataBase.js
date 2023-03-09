require("dotenv").config();
const { Sequelize, DataTypes, Model } = require("sequelize");
const { getCurrentUnix } = require("../utils/time-formatter");

exports.sequelize = new Sequelize(
  process.env.DATABASE_DB,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
    logging:
      process.env.DATABASE_QUERY_LOGGING === "true"
        ? (msg) => logger.dbLog(msg)
        : false,
  }
);

//checking the database connection
this.sequelize
  .authenticate()
  .then(() => {
    logger.dbLog(
      "Connection has been established successfully to the database"
    );
    logger.serverInfo(
      "Connection has been established successfully to the database"
    );
  })
  .catch((error) => {
    logger.dbLog(`Unable to connect to the database: ${error.toString()}`);
    logger.serverError(
      `Unable to connect to the database: ${error.toString()}`
    );
    process.exit(10);
  });

class User extends Model {
  isAdmin() {
    return this.admin_from < getCurrentUnix() && this.admin_until > getCurrentUnix();
  }

  hasValidRemote() {
    return this.isAdmin() || this.valid_remote_until > getCurrentUnix();
  }

  setValidRemote() {
    this.valid_remote_until =
      getCurrentUnix() + parseInt(process.env.CODE_VALID_DURATION);
    this.connection_attempts = 0;
  }

  isBanned() {
    return this.banned_until > getCurrentUnix();
  }

  setBanned() {
    this.banned_until =
      getCurrentUnix() + parseInt(process.env.FAIL_2_BAN_DURATION);
    this.connection_attempts = 0;
  }

  connectionAttemptsPlusOne() {
    this.connection_attempts += 1;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.TEXT,
    admin_from: DataTypes.INTEGER,
    admin_until: DataTypes.INTEGER,
    valid_remote_until: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    banned_until: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    connection_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    refresh_token: DataTypes.TEXT,
    access_token: DataTypes.TEXT,
  },
  {
    sequelize: this.sequelize,
    modelName: "user",
  }
);

exports.User = this.sequelize.models["user"];

exports.Session = this.sequelize.define("sessions", {
  sid: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  expires: DataTypes.DATE,
  data: DataTypes.TEXT,
});

//syncing tables
this.sequelize
  .sync()
  .then(() => {
    logger.dbLog("Successfully synchronized tables!");
  })
  .catch(() => {
    logger.dbLog("Unable to sync tables");
    process.exit(10);
  });
