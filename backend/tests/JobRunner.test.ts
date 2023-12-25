import { jest, describe, it } from '@jest/globals';
import { type BaseJob } from '#Jobs/BaseJob.js';
import { JobRunner } from '#App/Kernel/Services/JobRunner.js';

class TestJob implements BaseJob {
    description = 'Test Job';

    schedule = '* * * * * *';

    async run (): Promise<void> {
        console.log('Cleaning...');
    }

    async onError (error: Error): Promise<void> {
        console.log(error);
    }
}

describe('JobRunner test', () => {
    let runner = new JobRunner();
    let job = new TestJob();

    afterEach(async () => {
        await runner.shutdown();
        runner = new JobRunner();
        job = new TestJob();
    });

    it('should throw an error for an invalid schedule', async () => {
        job.schedule = 'invalid';

        runner.jobs = [job];
        await expect(async () => {
            await runner.startJobRunner();
        }).rejects
            .toThrow('Invalid cron schedule');
    });

    it('should throw an error for an invalid job description', async () => {
        job.description = '';

        runner.jobs = [job];
        await expect(async () => {
            await runner.startJobRunner();
        }).rejects
            .toThrow('Job description cannot be empty');
    });

    it('should execute this job (every second)', async () => {
        const MockFunction = jest.fn(async () => { });

        job.run = MockFunction;

        runner.jobs = [job];
        await runner.startJobRunner();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(MockFunction).toHaveBeenCalledTimes(1);
    });

    it('should execute the error handler', async () => {
        const MockFunction = jest.fn(async () => { });

        job.run = () => { throw new Error('test error'); };
        job.onError = MockFunction;

        runner.jobs = [job];
        await runner.startJobRunner();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(MockFunction).toHaveBeenCalledTimes(1);
    });
});
