import { type preConnectionSocketMiddleware } from '@app/Kernel/SocketRegistrar';
import { User } from '@app/Models/User';

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

    User.findByPk(userId).then((user) => {
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
