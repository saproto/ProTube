import * as RoomController from '@app/Controllers/DemoController';
import { type DefinedRoutes } from '@Kernel/RouteRegistrar';

const web: DefinedRoutes = {
    prefix: '/users',
    middlewares: [],
    name: 'users',
    routes: [
        ['GET', 'all', '', RoomController.firstRoute],
        {
            prefix: '/create',
            middlewares: [],
            name: 'create',
            routes: [
                ['GET', 'test', '/new', RoomController.createUser],
                ['POST', 'test2', '/post', RoomController.demoPost],
                ['POST', 'test3', '/post/:id', RoomController.demoPost]
            ]
        }
    ]
};

export default web;
