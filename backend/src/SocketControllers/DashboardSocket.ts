import { socketRoute } from '@app/Kernel/Routes/SocketRegistrar';
import z from 'zod';

export const testRoute = socketRoute({
    handler: (socket) => {
        console.log('some cool socket stuff');
    }
});

export const testRoute2 = socketRoute({
    schema: z.object({
        name: z.string()
    }),
    handler: (socket, data) => {
        console.log('some cool socket stuff');
    }
});
