// import * as RoomController from '@app/Controllers/DemoController';
import * as UserController from '#Controllers/UserController.js';
import UserPlugin from '#Middlewares/User.js';
import AdminPlugin from '#Middlewares/Admin.js';
import * as VideoController from '#Controllers/VideoController.js';
import { type WebRoute } from '#Kernel/Routes/Web/Registrar.js';

const web: WebRoute = {
    prefix: '/api',
    middlewares: [UserPlugin],
    name: 'http',
    routes: [
        ['GET', 'searchYoutube', '/search', VideoController.searchYouTubeVideos],
        ['POST', 'addVideoToQueue', '/queue', VideoController.addVideoToQueue],
        ['GET', 'user', '/user', UserController.userInfo],
        {
            prefix: '',
            middlewares: [AdminPlugin],
            name: 'admin',
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
