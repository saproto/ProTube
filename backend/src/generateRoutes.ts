/* eslint-disable import/first */
// We can't run this file if the file doesn't exist
import { closeSync, existsSync, mkdirSync, openSync } from 'fs';
import path from 'path';
import root from '@app/rootPath';

if (!existsSync(path.resolve(root(), 'routes/typings'))) {
    mkdirSync(path.resolve(root(), 'routes/typings'), { recursive: true });
}

closeSync(openSync(path.resolve(root(), 'routes/typings/route-typings.ts'), 'w'));

import WebRoutes from '@routes/web';
import ApiRoutes from '@routes/guest';
import SocketRoutes from '@routes/socket';
import RouteRegistrar from '@app/Kernel/Routes/RouteRegistrar';
import SocketRegistrar from '@app/Kernel/Routes/SocketRegistrar';

const registrar = new RouteRegistrar();
const socketRegistrar = new SocketRegistrar();

registrar.onlyLoadRoutes(WebRoutes, WebRoutes.name);
registrar.onlyLoadRoutes(ApiRoutes, ApiRoutes.name);
socketRegistrar.onlyLoadRoutes(SocketRoutes, 'socket.');

registrar.exportRouteTypings();
socketRegistrar.exportRouteTypings();

console.log('Built routes!');
