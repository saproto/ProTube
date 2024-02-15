import '#Config.js';
import '#Kernel/Services/Logging.js';
// import { startWebServer } from '#Kernel/Webserver.js';
import { startDatabaseConnection } from '#Kernel/Services/Database.js';
import { startRedisConnection } from '#Kernel/Services/Redis.js';
import { JobRunner } from '#Kernel/Services/JobRunner.js';

(async () => {
    await startDatabaseConnection();
    await startRedisConnection();
    const webserver = await import('#Kernel/Webserver.js');
    await webserver.startWebServer();
    await new JobRunner().startJobRunner();
    await import('#Services/PlaybackService.js');
})().then(() => {}).catch((error) => {
    console.error(error);
    process.exit(1);
});
