// import * as RoomController from '@app/Controllers/DemoController';
import * as UserController from '@app/Controllers/UserController';
import { type DefinedRoutes } from '@Kernel/RouteRegistrar';

const web: DefinedRoutes = {
    prefix: '',
    middlewares: [],
    name: 'http',
    routes: [
        ['GET', 'user', '/user', UserController.userInfo]
        // {
        //     prefix: '/create',
        //     middlewares: [],
        //     name: 'create',
        //     routes: [
        //         ['GET', 'test', '/new', RoomController.createUser],
        //         ['POST', 'test2', '/post', RoomController.demoPost],
        //         ['POST', 'test3', '/post/:id', RoomController.demoPost]
        //     ]
        // }
    ]
};

export default web;
