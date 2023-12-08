import { type socketMiddleware } from '#Kernel/Routes/SocketRegistrar.js';

const AdminSocket: socketMiddleware = (socket, next) => {
    const user = socket.request.user;
    if (user === null) {
        next(new Error('User not found'));
        return;
    }

    if (user.isAdmin()) {
        next();
    } else {
        next(new Error('Only for admins!'));
    }
};

export default AdminSocket;
