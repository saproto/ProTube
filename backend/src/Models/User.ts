import { Model, DataTypes, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    isAdmin (): boolean {
        return this.admin;
    }

    declare id: CreationOptional<number>;
    declare name: string;
    declare admin: boolean;
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
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
    },
    {
        sequelize,
        modelName: 'users'
    });
}
