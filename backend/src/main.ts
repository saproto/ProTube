import '#Config.js';
import { startWebServer } from '#Kernel/Webserver.js';
import { startDatabaseConnection } from '#Kernel/Services/Database.js';
import { startRedisConnection } from '#Kernel/Services/Redis.js';

(async () => {
    await startDatabaseConnection();
    await startRedisConnection();
    await startWebServer();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
