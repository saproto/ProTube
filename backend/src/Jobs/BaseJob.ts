export interface BaseJob {
    /**
     * Some description of the job
     */
    description: string

    /**
     * When does the job need to be run?
     *
     * @example
     * ┌────────────── second (optional)
     * │ ┌──────────── minute
     * │ │ ┌────────── hour
     * │ │ │ ┌──────── day of month
     * │ │ │ │ ┌────── month
     * │ │ │ │ │ ┌──── day of week
     * │ │ │ │ │ │
     * │ │ │ │ │ │
     * * * * * * *
    */
    schedule: string

    /**
     * This is hob the job will be handled
     */
    run: () => Promise<void>

    /**
     * Run on any error thrown in the job
     *
     * @param error The error that was thrown
     */
    onError: (error: Error) => Promise<void>
}
