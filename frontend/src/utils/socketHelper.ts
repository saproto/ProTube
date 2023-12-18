import { Socket } from 'socket.io-client';
import { clientEmits, namespacePathMappings, namespaceUrlMappings, serverEmits } from './route-typings/socket-routes';

// Define a helper type to extract req type based on a key
type TypeForKey<T, K extends keyof T, S extends 'req' | 'res'> = K extends keyof T
    ? S extends keyof T[K]
        ? T[K][S]
        : null
    : null;

type CallbackFunction<T> = (result: T) => void | Promise<void>;

/**
 * Emit an event to the server
 */
export function emit<K extends keyof clientEmits>(
    socket: Socket,
    key: K,
    req: TypeForKey<clientEmits, K, 'req'>,
    ...args: TypeForKey<clientEmits, K, 'res'> extends null | never | undefined
        ? []
        : [res: CallbackFunction<TypeForKey<clientEmits, K, 'res'>>]
): void {
    socket.emit(namespacePathMappings[key], req, ...args);
}

/**
 * Listen for an event from the server
 *
 * @param socket Listener socket
 * @param key Event name
 * @param req The request body
 * @param args The response callback
 */
export function onEvent<K extends keyof serverEmits>(
    socket: Socket,
    key: K,
    req: TypeForKey<serverEmits, K, 'req'>,
    ...args: TypeForKey<serverEmits, K, 'res'> extends null | never | undefined
        ? []
        : [res: CallbackFunction<TypeForKey<serverEmits, K, 'res'>>]
): void {
    // @ts-expect-error idk why it throws an error
    socket.on(namespacePathMappings[key], req, ...args);
}

/**
 * Retrieve the url for a namespace
 *
 * @param namespace The namespace of which to retrieve the url/prefix
 * @returns string
 */
export function namespace(namespace: keyof typeof namespaceUrlMappings): string {
    return namespaceUrlMappings[namespace];
}
