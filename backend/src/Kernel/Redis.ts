import { Redis } from 'ioredis';
import c from 'config';

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
    console.log('Checking for redis connection....');
    const connectionAttempts: number = 5;
    const connectionDelay: number = 1000;
    let status: string = redis.status;

    // Attempt a few times to connect to redis
    for (let i: number = 0; i < connectionAttempts; i++) {
        status = redis.status;
        console.log(`Redis connection status: ${status}`);
        if (status === 'ready') {
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, connectionDelay));
    }

    if (status !== 'ready') {
        throw new Error('Redis connection failed!');
    }

    const ping = await redis.ping();
    console.log(`Redis ping: ${ping}`);

    return status === 'ready';
}

export default redis;
