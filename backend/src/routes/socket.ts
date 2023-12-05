import * as dashboardSocket from '@app/SocketControllers/DashboardSocket';
import { sessionRefreshMiddleware } from 'fastify-socketio-session';
import loadUser from '@app/SocketMiddlewares/User';
import { type SocketRoute } from '@app/Kernel/Routes/Socket/Registrar';

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
            console.log('postconnection middleware');
            console.log(socket.request.user);
            next();
        };
    }, sessionRefreshMiddleware],
    routes: [
        ['listen for', 'testRoute', dashboardSocket.testRoute]
    ]
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
