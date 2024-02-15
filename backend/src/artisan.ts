/* eslint-disable indent */ // This is a temporary fix for the switch statement
import enquirer from 'enquirer';
import c from '#Config.js';
import root from '#App/rootPath.js';
import path from 'path';
import { writeFileSync } from 'fs';
import { MigrationRunner } from '@adonisjs/lucid/migration';

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
        { message: 'Run or rollback migrations', name: 'run-migrations' }
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
    }
}).catch(console.error);

/**
 * Handler for running all migrations
 */
async function runAllMigrationsAction (): Promise<void> {
    await areYouSure('Not running migrations.');

    const answer = await enquirer.prompt({
        type: 'select',
        name: 'fresh',
        message: 'Wipe the database?',
        choices: [
            { message: 'No', name: 'no' },
            { message: 'Yes', name: 'yes' }
        ]
    });

    // @ts-expect-error - We know that the confirm will be a string
    if (answer.fresh === 'yes') {
        if (c.env.production) {
            await areYouSure('Not wiping the database.');
        }
        await wipeDatabase();
    }

    const upOrDown = await enquirer.prompt({
        type: 'select',
        name: 'upOrDown',
        message: 'Up or down?',
        choices: [
            { message: 'Up', name: 'up' },
            { message: 'Down', name: 'down' }
        ]
    });

    // @ts-expect-error - We know that the confirm will be a string
    const migrationRunner = await getMigrationRunner(upOrDown.upOrDown);

    if (c.env.production) {
        await areYouSure('Not running migrations.');
    }

    await migrationRunner.run();

    if (migrationRunner.error !== null) {
        console.log(migrationRunner.error);
    }

    console.log('Migrations ran:', Object.keys(migrationRunner.migratedFiles));
    abort('Done.');
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
    const name = `/${Date.now()}_${migrationName}.ts`;

    writeFileSync(migrationsPath + name, `/* eslint-disable @typescript-eslint/no-floating-promises */
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    async up (): Promise<void> {
        this.schema.createTable('tableName', (table) => {
            table.increments('id').primary();
            table.timestamps({ defaultToNow: true });
        });
    }

    async down (): Promise<void> {
        this.schema.dropTable('tableName');
    }
}
`);
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
 * Create and initialize a migrationrunner
 *
 * @param direction 'up' or 'down'
 * @returns Initialized migrationRunner
 */
async function getMigrationRunner (direction: 'up' | 'down'): Promise<MigrationRunner> {
    const db = await import('#Kernel/Services/Database.js');
    await db.startDatabaseConnection();

    return new MigrationRunner(db.default, db.app, {
        direction
    });
};

/**
 * Wipe/reset the database (deletes and recreates it)
 */
async function wipeDatabase (): Promise<void> {
    const db = await import('#Kernel/Services/Database.js');
    await db.startDatabaseConnection();

    await db.default.rawQuery('DROP DATABASE IF EXISTS ' + c.db.database);
    await db.default.rawQuery('CREATE DATABASE IF NOT EXISTS ' + c.db.database);
    console.log('Wiped database');
}

/**
 * Create a new model inside the Models directory
 *
 * @param name The name of the new Model
 */
function createModel (name: string): void {
    writeFileSync(modelsPath + `/${name}.ts`, `import { column } from '@adonisjs/lucid/orm';
import { Model } from '#Kernel/Services/Database.js';

export class ${name} extends Model {
    static table = '${name.toLowerCase()}s';

    @column({ isPrimary: true })
    declare id: number;

    @column.dateTime({ autoCreate: true })
    declare created_at: Date;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updated_at: Date;
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
