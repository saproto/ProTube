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
import RouteRegistrar from '@Kernel/RouteRegistrar';

const registrar = new RouteRegistrar();

registrar.onlyLoadRoutes(WebRoutes, 'http');
registrar.onlyLoadRoutes(ApiRoutes, 'api');

registrar.exportRouteTypings();

console.log('Built routes!');
