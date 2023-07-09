import RoomController from '@app/Controllers/RoomController';
import { type DefinedRoutes } from './RouteRegistrar';

const web: DefinedRoutes = {
    prefix: '/api',
    middlewares: [],
    routes: [
        ['GET', '/room', RoomController.get],
        {
            prefix: '/v1',
            middlewares: [],
            routes: [
                ['GET', '/test', RoomController.test]
            ]
        }
    ]
};

export default web;
