import { Redis } from 'ioredis';
import c from '#Config.js';
import log from '#Logging.js';

const redis = new Redis({
    host: c.redis.host,
    port: c.redis.port
});

/**
 * Waits for a connection with redis for 5 times
 * with a second delay between attempts.
 *
 * @async
 * @returns {Promise<boolean>}
 */
export async function startRedisConnection (): Promise<boolean> {
    log.info('REDIS', 'Checking for redis connection....');

    const connectionAttempts: number = 5;
    const connectionDelay: number = 1000;
    let status: string = redis.status;

    // Attempt a few times to connect to redis
    for (let i: number = 0; i < connectionAttempts; i++) {
        status = redis.status;
        log.debug('REDIS', `Connection attempt ${i + 1}/${connectionAttempts}...`);
        if (status === 'ready') {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, connectionDelay));
    }

    if (status !== 'ready') {
        log.error('REDIS', 'Redis connection failed!');
        throw new Error('Redis connection failed!');
    }

    const ping = await redis.ping();
    if (ping !== 'PONG') {
        log.error('REDIS', 'Redis ping failed!');
        throw new Error('Redis ping failed!');
    }
    log.info('REDIS', 'Redis connection established!');

    return status === 'ready';
}

export default redis;
