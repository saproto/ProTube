import { type BaseJob } from '#App/Jobs/BaseJob.js';
import { CleanupJob } from '#App/Jobs/CleanupJob.js';
import cron from 'node-cron';

// All jobs which you want to define.
const jobs: BaseJob[] = [
    new CleanupJob()
];

export async function startJobRunner (): Promise<void> {
    for (const job of jobs) {
        const validCron = cron.validate(job.schedule);

        if (validCron === false) {
            throw new Error(`Invalid cron schedule for job: ${job.description}`);
        }

        cron.schedule(job.schedule, async () => {
            try {
                console.log(`Running job: ${job.description}`);
                await job.run();
            } catch (error: Error | any) {
                console.error(`Error in job: ${job.description}`);
                await job.onError(error);
            }
        });
    }
}
