import { Model, DataTypes, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    isAdmin (): boolean {
        return this.admin;
    }

    declare id: CreationOptional<number>;
    declare name: string;
    declare admin: boolean;
    declare valid_remote_until: CreationOptional<Date>;
    declare banned_until: CreationOptional<Date>;
    declare connection_attempts: CreationOptional<number>;
    declare refresh_token: string;
    declare access_token: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export function loadUser (sequelize: Sequelize): void {
    User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        valid_remote_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        banned_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        connection_attempts: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        refresh_token: DataTypes.TEXT,
        access_token: DataTypes.TEXT,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    },
    {
        sequelize,
        modelName: 'users'
    });
}
