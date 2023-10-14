import { type SocketRoute } from '@app/Kernel/Routes/SocketRegistrar';
import * as dashboardSocket from '@app/SocketControllers/DashboardSocket';
import { sessionRefreshMiddleware } from 'fastify-socketio-session';
import loadUser from '@app/SocketMiddlewares/User';

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
        ['homeevent', dashboardSocket.testRoute]
    ]
}, {
    name: 'socket2',
    namespace: '/socket2',
    preConnectionMiddlewares: [],
    postConnectionMiddlewares: [],
    routes: [
        ['homeevent2', dashboardSocket.testRoute2]
    ]
}];

export default socket;
