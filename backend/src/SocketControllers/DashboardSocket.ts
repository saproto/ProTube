import QueuedVideo from '#App/Schemas/QueuedVideo.js';
import { type bootedNamespace, onSocketEvent, socketEmit } from '#Kernel/Routes/Socket/Registrar.js';
import { queue } from '#Services/PlaybackService.js';
import z from 'zod';

export const booted: bootedNamespace = async (namespace) => {
    console.log('booted namespace', namespace.name);
    queue.on('queue-updated', (newQueue) => {
        queueUpdate.broadcast(namespace, newQueue);
    });
};

export const queueUpdate = socketEmit({
    name: 'queueUpdate',
    schema: z.array(QueuedVideo)
});

export const testSock = onSocketEvent({
    handler: (socket) => {
        console.log('sokken');
    }
});

export const testRoute = onSocketEvent({
    callbackSchema: z.object({
        name: z.string()
    }),
    handler: (socket, callback) => {
        console.log('some cool socket stuff');
        console.log(callback);

        const c = { name: 'some cool name' };
        callback(c);
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
