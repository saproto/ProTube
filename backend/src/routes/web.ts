import * as RoomController from '@app/Controllers/DemoController';
import { type DefinedRoutes } from './RouteRegistrar';

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
                ['GET', 'test', '/new', RoomController.createUser]
                // ['POST', 'test2', '/example/at/:hour(^\\d{2})h:minute(^\\d{2})m', RoomController.test],
            ]
        }
    ]
};

export default web;
