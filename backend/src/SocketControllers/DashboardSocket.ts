import { onSocketEvent, socketEmit } from '#Kernel/Routes/Socket/Registrar.js';
import z from 'zod';

export const testRoute = onSocketEvent({
    handler: (socket) => {
        console.log('some cool socket stuff');
    }
});

export const testRoute2 = onSocketEvent({
    schema: z.object({
        name: z.string()
    }),
    callbackSchema: z.boolean(),
    handler: (socket, data) => {
        console.log('some cool socket stuff');
        someEmit.emit(socket);
    }
});

export const someEmit = socketEmit({
    name: 'someEmit', // not used
    // schema: z.object({
    //     name: z.string()
    // })
    schema: z.never()
});
