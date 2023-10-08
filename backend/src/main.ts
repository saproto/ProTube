import '@app/Kernel/Services/Config';
import { startWebServer } from '@Kernel/Webserver';
import { startDatabaseConnection } from '@app/Kernel/Services/Database';
import { startRedisConnection } from './Kernel/Services/Redis';

(async () => {
    await startDatabaseConnection();
    await startRedisConnection();
    await startWebServer();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
