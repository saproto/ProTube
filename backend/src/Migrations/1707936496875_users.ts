/* eslint-disable @typescript-eslint/no-floating-promises */
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    async up (): Promise<void> {
        this.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('name', 255).notNullable();
            table.text('refresh_token');
            table.text('access_token').notNullable();
            table.boolean('admin').defaultTo(false);
            table.timestamps({ defaultToNow: true });
        });
    }

    async down (): Promise<void> {
        this.schema.dropTable('users');
    }
}
