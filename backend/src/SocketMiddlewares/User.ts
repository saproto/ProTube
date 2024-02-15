import { type preConnectionSocketMiddleware } from '#Kernel/Routes/Socket/Registrar.js';
import { User } from '#Models/User.js';

declare module 'http' {
    interface IncomingMessage {
        /*
        * The user that is currently logged in.
        * (Only available on authenticated routes)
        */
        user: User
    }
}

const loadUser: preConnectionSocketMiddleware = (socket, next) => {
    const userId = socket.request.session.get<'user_id'>('user_id');

    if (userId === undefined) {
        next(new Error('Unauthenticated'));
        return;
    }

    User.query()
        .where('id', userId)
        .preload('currentAdmins')
        .first()
        .then((user) => {
            if (user === null) {
                next();
                return;
            }

            socket.request.user = user;
            next();
        }).catch((error) => {
            next(error);
        });
};

export default loadUser;
