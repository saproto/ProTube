import { Socket, io } from 'socket.io-client';
import { requestMappings, responseMappings } from './route-typings/socket-route-typings';

interface socketEmitInterface<
    EventResponseData extends keyof responseMappings,
    EventRequestData extends keyof requestMappings
> {
    emit: (
        ...args: EventRequestData extends undefined
            ? [
                  EventResponseData extends undefined
                      ? [callback: () => Promise<void> | void]
                      : [callback: (data: responseMappings[EventResponseData]) => void]
              ]
            : EventResponseData extends undefined
            ? [data: requestMappings[EventRequestData], callback: () => Promise<void> | void]
            : [data: requestMappings[EventRequestData], callback: (data: responseMappings[EventResponseData]) => void]
    ) => void;
}

export function socketEmit<T extends keyof responseMappings>(socket: Socket, eventName: T): socketEmitInterface<T, T> {
    return {
        emit: (...args) => {
            socket.emit(eventName, args);
        },
    };
}

export function serverEvent<T extends keyof>(eventName: T)

const socket = io();
const someDefinedEvent = socketEmit(socket, 'socket.devsocket.homeevent');
someDefinedEvent.emit({ name: 'test' }, async (data) => {
    console.log(data);
});

// interface socketEmitInterface<
//     EventName extends keyof responseMappings,
//     EventResponseData extends keyof responseMappings,
//     EventRequestData extends keyof requestMappings
// > {
//     socket: Socket;
//     eventName: EventName;
//     callback: (...args: EventResponseData extends undefined ? [] : [data: responseMappings[EventResponseData]]) => void;
// }

// export function socketEmit<T extends keyof responseMappings>(
//     socket: Socket,
//     eventName: T,
//     ...args: T extends undefined ? [] : [callback: (data: responseMappings[T]) => void]
// ): socketEmitInterface<T, T, T> {
//     return {
//         socket,
//         eventName,
//         callback: (...args) => {},
//     };
// }
