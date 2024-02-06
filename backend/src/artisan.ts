/* eslint-disable indent */ // This is a temporary fix for the switch statement
import enquirer from 'enquirer';
import c from '#Config.js';
import root from '#App/rootPath.js';
import mysql2 from 'mysql2';
import path from 'path';
import { writeFileSync } from 'fs';
import { SequelizeStorage, Umzug } from 'umzug';
import { type QueryInterface, Sequelize } from 'sequelize';

const migrationsPath = path.resolve(root(), 'Migrations');
const modelsPath = path.resolve(root(), 'Models');

enquirer.prompt({
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
        { message: 'Create a model + migration', name: 'model-with-migration' },
        { message: 'Create a model', name: 'model' },
        { message: 'Create a migration', name: 'migration' },
        { message: 'Run all migrations', name: 'run-migrations' },
        { message: 'Rollback migrations', name: 'rollback-migrations' }
    ]
}).then(async (answers) => {
    // @ts-expect-error - We know that the action will be a string
    switch (answers.action as string) {
        case 'model-with-migration':
            createModelWithMigrationAction();
            break;
        case 'migration':
            createMigrationAction();
            break;
        case 'model':
            createModelAction();
            break;
        case 'run-migrations':
            await runAllMigrationsAction();
            break;
        case 'rollback-migrations':
            await rollbackMigrationsAction();
            break;
    }
}).catch(console.error);

/**
 * Handler for running all migrations
 */
async function runAllMigrationsAction (): Promise<void> {
    await areYouSure('Not running migrations.');

    if (c.env.development) {
        const sequelize = getSequelizeInstance();

        const answer = await enquirer.prompt({
            type: 'select',
            name: 'fresh',
            message: 'Wipe the database?',
            choices: [
                { message: 'Yes', name: 'yes' },
                { message: 'No', name: 'no' }
            ]
        });

        // @ts-expect-error - We know that the confirm will be a string
        if (answer.fresh === 'yes') {
            await sequelize.query('DROP DATABASE IF EXISTS ' + c.db.database);
            await sequelize.query('CREATE DATABASE IF NOT EXISTS ' + c.db.database);
            console.log('Wiped database');
        }
    }

    const umzug = getUmzugInstance();

    const migrationsRun = await umzug.up();

    console.log(`Ran ${migrationsRun.length} migrations.`);
}

/**
 * Handler for rolling back migrations
 */
async function rollbackMigrationsAction (): Promise<void> {
    await areYouSure('Not rolling back migrations.');

    const umzug = getUmzugInstance();

    const migrationsRun = await umzug.down();

    console.log(`Reverted ${migrationsRun.length} migrations.`);
}

/**
 * Handler for creating a new model and migration
 */
function createModelWithMigrationAction (): void {
    enquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the model?',
        format: (value: string): string => value.trim()
    }).then((answers) => {
        // @ts-expect-error - We know that the name will be a string
        const modelName: string = answers.name;

        createMigration(`_create_${modelName}_table`);
        createModel(modelName);
    }).catch(console.error);
}

/**
 * Handler for creating a new migration
 */
function createMigrationAction (): void {
    enquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the migration?',
        format: (value: string): string => value.trim()
    }).then((answers) => {
        // @ts-expect-error - We know that the name will be a string
        const migrationName: string = answers.name;

        createMigration(migrationName);
    }).catch(console.error);
}

/**
 * Handler for creating a new model
 */
function createModelAction (): void {
    enquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the model?',
        format: (value: string): string => value.trim()
    }).then((answers) => {
        // @ts-expect-error - We know that the name will be a string
        const modelName: string = answers.name;

        createModel(modelName);
    }).catch(console.error);
}

/**
 * Create a new migration inside the Migrations directory
 *
 * @param migrationName The name of the new migration, without the date
 */
function createMigration (migrationName: string): void {
    const name = `/${(new Date()).toISOString()}_${migrationName}.ts`;

    writeFileSync(migrationsPath + name, `import type { Migration } from '#Kernel/Services/Database.js';
import { DataTypes } from 'sequelize';

export const up: Migration = async ({ context }) => {
    await context.queryInterface.createTable('${migrationName}', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true
        },
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
    await context.queryInterface.dropTable('${migrationName}');
};
    `);
}

/**
 * Get a new Umzug instance
 *
 * @param sequelize The Sequelize instance to use
 * @returns The new Umzug instance
 */
function getUmzugInstance (sequelize = getSequelizeInstance()): Umzug<{ queryInterface: QueryInterface }> {
    return new Umzug({
        migrations: {
            glob: ['Migrations/**s', {
                cwd: root()
            }]
        },
        context: { queryInterface: sequelize.getQueryInterface() },
        storage: new SequelizeStorage({ sequelize }),
        logger: console
    });
}

/**
 * Get a new Sequelize instance
 *
 * @returns The new Sequelize instance
 */
function getSequelizeInstance (): Sequelize {
    return new Sequelize(
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
}

/**
 * Ask the user if they are sure about an action, the program is aborted if they are not
 * defaults to only asking in production mode
 *
 * @param abortionMessage The message to display if the user aborts the action
 * @param alsoAskInDevMode Whether to ask the user if they are sure in development mode
 * @param question The question to ask the user
 * @returns Whether the user is sure
 */
async function areYouSure (abortionMessage: string, alsoAskInDevMode = false, question = 'Are you sure?'): Promise<boolean> {
    if (alsoAskInDevMode || c.env.production) {
        const response = await enquirer.prompt({
            type: 'select',
            name: 'confirm',
            message: question,
            choices: [
                { message: 'Yes', name: 'yes' },
                { message: 'No', name: 'no' }
            ]
        });

        // @ts-expect-error - We know that the confirm will be a string
        if (response.confirm !== 'yes') {
            abort(abortionMessage);
        }
    }
    return true;
}

/**
 * Create a new model inside the Models directory
 *
 * @param name The name of the new Model
 */
function createModel (name: string): void {
    writeFileSync(modelsPath + `/${name}.ts`, `import { Model, DataTypes, type Sequelize, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';

    export class ${name} extends Model<InferAttributes<${name}>, InferCreationAttributes<${name}>> {
        declare id: CreationOptional<number>;
        declare createdAt: CreationOptional<Date>;
        declare updatedAt: CreationOptional<Date>;
    }
    `);
}

/**
 * Stop the process with a message
 *
 * @param message The abort message
 */
function abort (message: string): void {
    console.log(message);
    process.exit(0);
}
