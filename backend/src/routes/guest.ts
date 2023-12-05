import * as LoginController from '@Controllers/LoginController';
import { type WebRoute } from '@app/Kernel/Routes/Web/Registrar';

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
