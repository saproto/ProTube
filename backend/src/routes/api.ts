import { type DefinedRoutes } from './RouteRegistrar';
// import * as RoomController from '@app/Controllers/RoomController';

const api: DefinedRoutes = {
    prefix: '/',
    name: 'web',
    middlewares: [],
    routes: [
        // ['PUT', 'room', '/room', RoomController.get],
        // {
        //     prefix: '/v1',
        //     middlewares: [],
        //     name: 'v1',
        //     routes: [
        //         ['GET', 'test', '/test/:id?', RoomController.test],
        //         ['POST', 'test2', '/example/at/:hour(^\\d{2})h:minute(^\\d{2})m', RoomController.test]
        //     ]
        // }
    ]
};

export default api;
