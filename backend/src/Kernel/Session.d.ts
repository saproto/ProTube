// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type SessionData } from '@mgcrea/fastify-session';

declare module '@mgcrea/fastify-session' {
    interface SessionData {
        user_id: number
    }
}
