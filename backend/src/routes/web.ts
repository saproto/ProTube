// import * as RoomController from '@app/Controllers/DemoController';
import * as UserController from '@app/Controllers/UserController';
import UserPlugin from '@app/Middlewares/User';
import AdminPlugin from '@app/Middlewares/Admin';
import { type WebRoute } from '@app/Kernel/Routes/RouteRegistrar';

const web: WebRoute = {
    prefix: '/api',
    middlewares: [UserPlugin],
    name: 'http',
    routes: [
        ['POST', 'user', '/user', UserController.userInfo],
        {
            prefix: '',
            middlewares: [AdminPlugin],
            name: '',
            routes: [
                ['GET', 'admin', '/admin', UserController.adminInfor],
                {
                    prefix: '/test',
                    middlewares: [],
                    name: 'prefix',
                    routes: [
                        ['GET', 'admin', '/admin2', UserController.adminInfor]
                    ]
                }
            ]
        }
    ]
};

export default web;
