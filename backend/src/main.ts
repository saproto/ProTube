import 'config';
import { startWebServer } from '@Kernel/Webserver';
import { startDatabaseConnection } from '@Kernel/Database';
import { startRedisConnection } from './Kernel/Redis';

(async () => {
    await startDatabaseConnection();
    await startRedisConnection();
    await startWebServer();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
