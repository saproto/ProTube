import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import root from '#App/rootPath.js';

import WebRoutes from '#Routes/web.js';
import GuestRoutes from '#Routes/guest.js';
import SocketRoutes from '#Routes/socket.js';
import TypescriptExporter from '#Kernel/Routes/Web/TypescriptExporter.js';
import { default as SocketTypescriptExporter } from '#Kernel/Routes/Socket/TypescriptExporter.js';

if (!existsSync(path.resolve(root(), 'Routes/typings'))) {
    mkdirSync(path.resolve(root(), 'Routes/typings'), { recursive: true });
}

const exporter = new TypescriptExporter();
exporter.load(WebRoutes);
exporter.load(GuestRoutes);
exporter.export();

const socketExporter = new SocketTypescriptExporter();
socketExporter.load(SocketRoutes);
socketExporter.export();

console.log('Built routes!');
