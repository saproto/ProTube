import { belongsTo, column, scope } from '@adonisjs/lucid/orm';
import { Model } from '#Kernel/Services/Database.js';
import { User } from '#Models/User.js';
import * as relations from '@adonisjs/lucid/types/relations';

export class UserAdmin extends Model {
    static table = 'useradmins';

    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare user_id: number;

    @column.dateTime()
    declare from: Date;

    @column.dateTime()
    declare until: Date;

    @column.dateTime({ autoCreate: true })
    declare created_at: Date;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updated_at: Date;

    @belongsTo(() => User, { foreignKey: 'user_id' })
    declare user: relations.BelongsTo<typeof User>;

    static current = scope((query) => {
        void query.where('from', '<=', new Date())
            .where('until', '>=', new Date());
    });
}
