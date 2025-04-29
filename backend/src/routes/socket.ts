import * as dashboardSocket from '#SocketControllers/DashboardSocket.js';
import { sessionRefreshMiddleware } from 'fastify-socketio-session';
import loadUser from '#SocketMiddlewares/User.js';
import { type SocketRoute } from '#Kernel/Routes/Socket/Registrar.js';

const socket: SocketRoute[] = [{
    name: 'devsocket',
    namespace: '/dev-socket',
    preConnectionMiddlewares: [loadUser, (socket, next: (err?: Error) => void) => {
        console.log('preconnection middleware');
        next();
    }],
    connectionEvent: (socket) => {
        console.log('connection event');
        // socket.use(loadUser);
    },
    disconnectEvent: (socket) => {
        console.log('disconnect event');
    },
    postConnectionMiddlewares: [(socket) => {
        return (__, next) => {
            next();
        };
    }, sessionRefreshMiddleware],
    routes: [
        ['listen for', 'testRoute', dashboardSocket.testRoute],
        ['listen for', 'testSock', dashboardSocket.testSock],
        ['emit event', 'queueUpdate', dashboardSocket.queueUpdate]
    ],
    booted: dashboardSocket.booted
}, {
    name: 'nsp1',
    namespace: '/socket2',
    preConnectionMiddlewares: [],
    postConnectionMiddlewares: [],
    routes: [
        ['listen for', 'testRoute2', dashboardSocket.testRoute2],
        // ['emit event', 'someEvent', dashboardSocket.someEmit]
        ['emit event', 'soemEmit', dashboardSocket.someEmit]
    ]
}];

export default socket;
