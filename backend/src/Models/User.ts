import { column, computed, hasMany } from '@adonisjs/lucid/orm';
import { Model } from '#Kernel/Services/Database.js';
import { UserAdmin } from './UserAdmin.js';
import * as relations from '@adonisjs/lucid/types/relations';

export class User extends Model {
    static table = 'users';

    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare name: string;

    @column({ serializeAs: null })
    declare refresh_token: string;

    @column({ serializeAs: null })
    declare access_token: string;

    @column()
    declare admin: boolean;

    @column.dateTime({ autoCreate: true })
    declare created_at: Date;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updated_at: Date;

    @hasMany(() => UserAdmin, { foreignKey: 'user_id' })
    public userAdmins: relations.HasMany<typeof UserAdmin>;

    @hasMany(() => UserAdmin, {
        foreignKey: 'user_id',
        onQuery: (query) => {
            void query.withScopes((scopes) => scopes.current());
        }
    })
    public currentAdmins: relations.HasMany<typeof UserAdmin>;

    @computed()
    get isAdmin (): boolean {
        return this.currentAdmins?.length > 0;
    }
}
