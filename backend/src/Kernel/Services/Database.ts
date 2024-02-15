import 'reflect-metadata';
import dbConfig from '#App/config/database.js';
import { Database } from '@adonisjs/lucid/database';
import { Logger } from '@adonisjs/core/logger';
import { Emitter } from '@adonisjs/core/events';
import { Application } from '@adonisjs/core/app';
import { Adapter } from '../../../node_modules/@adonisjs/lucid/build/src/orm/adapter/index.js';
import { BaseModel } from '@adonisjs/lucid/orm';
import root from '#App/rootPath.js';

let db: Database;
let adapter: Adapter;
let app: Application<Record<any, any>>;

/**
 * Some cursed shit is happening here,
 * we're partially starting an adonisjs application so we can use the lucid orm :')
 */
export async function startDatabaseConnection (): Promise<void> {
    console.log('Connecting to the database...');

    const logger = new Logger({
        enabled: false
    });

    app = new Application(new URL(`file://${root()}`), {
        environment: 'unknown'
    });
    await app.init();

    const emitter = new Emitter(app);
    db = new Database(dbConfig, logger, emitter);
    adapter = new Adapter(db);
}

/**
 * We override the adonis' model so we can inject the boot override to inject
 * our database adapter
 */
class Model extends BaseModel {
    static boot (): void {
        super.boot();
        this.useAdapter(adapter);
    }
}

export { db as default, adapter, Model, app };
