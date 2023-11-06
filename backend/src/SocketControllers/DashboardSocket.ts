import { onSocketEvent, socketEmit } from '@app/Kernel/Routes/SocketRegistrar';
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
    name: 'homeevent',
    // schema: z.object({
    //     name: z.string()
    // })
    schema: z.never()
});
