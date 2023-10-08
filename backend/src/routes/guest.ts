import { type WebRoute } from '../Kernel/Routes/RouteRegistrar';
// import * as RoomController from '@app/Controllers/RoomController';
import * as LoginController from '@Controllers/LoginController';

const guest: WebRoute = {
    prefix: '',
    name: 'guest',
    middlewares: [],
    routes: [
        ['GET', 'logincallback', '/auth/login/callback', LoginController.loginCallback],
        ['GET', 'user', '/auth/user', LoginController.user]
    ]
};

export default guest;
