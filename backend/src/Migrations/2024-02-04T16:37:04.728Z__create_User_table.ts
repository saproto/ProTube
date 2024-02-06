import type { Migration } from '#Kernel/Services/Database.js';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context }) => {
    await context.queryInterface.createTable('users', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true
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
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    });
};

export const down: Migration = async ({ context }) => {
    await context.queryInterface.dropTable('users');
};
