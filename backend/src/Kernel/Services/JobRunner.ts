import { type BaseJob } from '#App/Jobs/BaseJob.js';
import cron from 'node-cron';

export class JobRunner {
    // All jobs which you want to define.
    jobs: BaseJob[] = [
    ];

    /**
     * A list of currently runninng tasks
     */
    #tasks: cron.ScheduledTask[] = [];

    async startJobRunner (): Promise<void> {
        for (const job of this.jobs) {
            const validCron = cron.validate(job.schedule);

            if (!validCron) {
                throw new Error(`Invalid cron schedule for job: ${job.description}`);
            }

            if (job.description === '') {
                throw new Error('Job description cannot be empty');
            }

            const task = cron.schedule(job.schedule, () => {
                (async () => {
                    console.log(`Running job: ${job.description}`);
                    await job.run();
                })().catch(async (err) => {
                    console.log(`Error in job: ${job.description}`);
                    try {
                        await job.onError(err);
                    } catch (err) {}
                });
            });

            this.#tasks.push(task);
        }
    }

    /**
     * Gracefully stop all running tasks
     */
    async shutdown (): Promise<void> {
        for (const task of this.#tasks) {
            task.stop();
        }
    }
}
