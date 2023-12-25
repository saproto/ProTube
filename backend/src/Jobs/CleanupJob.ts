import { type BaseJob } from '#Jobs/BaseJob.js';

export class CleanupJob implements BaseJob {
    description = 'Cleanup job';

    schedule = '* * * * * *';

    async run (): Promise<void> {
        console.log('Cleaning...');
    }

    async onError (error: Error): Promise<void> {
        console.log(error);
    }
}
