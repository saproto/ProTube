// import * as RoomController from '@app/Controllers/DemoController';
import * as UserController from '@app/Controllers/UserController';
import UserPlugin from '@app/Middlewares/User';
import AdminPlugin from '@app/Middlewares/Admin';
import { type WebRoute } from '@app/Kernel/Routes/Web/Registrar';

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
