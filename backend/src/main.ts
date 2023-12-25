import '#Config.js';
import { startWebServer } from '#Kernel/Webserver.js';
import { startDatabaseConnection } from '#Kernel/Services/Database.js';
import { startRedisConnection } from '#Kernel/Services/Redis.js';
import { JobRunner } from '#Kernel/Services/JobRunner.js';

(async () => {
    await startDatabaseConnection();
    await startRedisConnection();
    await startWebServer();
    await new JobRunner().startJobRunner();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
