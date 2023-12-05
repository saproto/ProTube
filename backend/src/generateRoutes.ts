/* eslint-disable import/first */
// We can't run this file if the file doesn't exist
// import 'module-alias/register';
import { closeSync, existsSync, mkdirSync, openSync } from 'fs';
import path from 'path';
import root from '#App/rootPath.js';

if (!existsSync(path.resolve(root(), 'src/routes/typings'))) {
    mkdirSync(path.resolve(root(), 'src/routes/typings'), { recursive: true });
}

closeSync(openSync(path.resolve(root(), 'src/routes/typings/route-typings.ts'), 'w'));

// import WebRoutes from '#Routes/web.js';
// // import ApiRoutes from '@routes/guest';
// // import SocketRoutes from '@routes/socket';
// import RouteRegistrar from '#Kernel/Routes/RouteRegistrar';
// // import SocketRegistrar from '@app/Kernel/Routes/SocketRegistrar';

// const registrar = new RouteRegistrar();
// // const socketRegistrar = new SocketRegistrar();

// registrar.onlyLoadRoutes(WebRoutes, WebRoutes.name);
// // registrar.onlyLoadRoutes(ApiRoutes, ApiRoutes.name);
// // socketRegistrar.onlyLoadRoutes(SocketRoutes, 'socket.');

// registrar.exportRouteTypings();
// socketRegistrar.exportRouteTypings();
// import TypescriptExporter from '#Kernel/Routes/Web/TypescriptExporter.js';

// const exporter = new TypescriptExporter();
// exporter.load(WebRoutes);

// exporter.export();

// console.log('Built routes!');
