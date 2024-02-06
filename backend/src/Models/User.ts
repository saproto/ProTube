import { Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

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
