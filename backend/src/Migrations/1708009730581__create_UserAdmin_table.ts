/* eslint-disable @typescript-eslint/no-floating-promises */
import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
    async up (): Promise<void> {
        this.schema.createTable('useradmins', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('from').notNullable();
            table.timestamp('until').notNullable();
            table.timestamps({ defaultToNow: true });
        });
    }

    async down (): Promise<void> {
        this.schema.dropTable('useradmins');
    }
}
