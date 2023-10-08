import { type SocketRoute } from '@app/Kernel/SocketRegistrar';
import * as dashboardSocket from '@app/SocketControllers/DashboardSocket';
import { sessionRefreshMiddleware } from 'fastify-socketio-session';
import loadUser from '@app/SocketMiddlewares/User';

const socket: SocketRoute[] = [{
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
}];

export default socket;
