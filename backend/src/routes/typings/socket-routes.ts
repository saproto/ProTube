export enum namespaceUrlMappings {
'socket.devsocket' = '/dev-socket',
'socket.nsp1' = '/socket2',

};
export const namespacePathMappings: Record<keyof clientEmits | keyof serverEmits, string> = {
'socket.devsocket.testRoute': 'testRoute',
'socket.devsocket.testSock': 'testSock',
'socket.devsocket.queueUpdate': 'queueUpdate',
'socket.nsp1.testRoute2': 'testRoute2',
'socket.nsp1.soemEmit': 'soemEmit',

};
export interface serverEmits {
'socket.devsocket.queueUpdate': {
req: socket.devsocket.queueUpdate,
res: never,
},
'socket.nsp1.soemEmit': {
req: socket.nsp1.soemEmit,
res: never,
},
}

export interface clientEmits {
'socket.devsocket.testRoute': {
req: undefined,
res: socket.devsocket.testRoute.callback,
},
'socket.devsocket.testSock': {
req: undefined,
res: never,
},
'socket.nsp1.testRoute2': {
req: socket.nsp1.testRoute2,
res: socket.nsp1.testRoute2.callback,
},
}
