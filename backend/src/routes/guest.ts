import * as LoginController from '#Controllers/LoginController.js';
import { type WebRoute } from '#Kernel/Routes/Web/Registrar.js';

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
