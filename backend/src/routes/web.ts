// import * as RoomController from '@app/Controllers/DemoController';
import * as UserController from '#Controllers/UserController.js';
import UserPlugin from '#Middlewares/User.js';
import AdminPlugin from '#Middlewares/Admin.js';
import { type WebRoute } from '#Kernel/Routes/Web/Registrar.js';

const web: WebRoute = {
    prefix: '/api',
    middlewares: [UserPlugin],
    name: 'http',
    routes: [
        ['GET', 'user', '/user', UserController.userInfo],
        {
            prefix: '',
            middlewares: [AdminPlugin],
            name: '',
            routes: [
                ['GET', 'admin', '/admin', UserController.adminInfo],
                {
                    prefix: '/test',
                    middlewares: [],
                    name: 'prefix',
                    routes: [
                        ['GET', 'admin', '/admin2', UserController.adminInfo]
                    ]
                }
            ]
        }
    ]
};

export default web;
