import 'config';
import { startWebServer } from '@Kernel/Webserver';
import { startDatabaseConnection } from '@Kernel/Database';

(async () => {
    await startDatabaseConnection();
    await startWebServer();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
