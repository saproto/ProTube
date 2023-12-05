/* eslint-disable import/first */
// We can't run this file if the file doesn't exist
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import root from '@app/rootPath';

if (!existsSync(path.resolve(root(), 'routes/typings'))) {
    mkdirSync(path.resolve(root(), 'routes/typings'), { recursive: true });
}

import WebRoutes from '@routes/web';
import GuestRoutes from '@routes/guest';
import SocketRoutes from '@routes/socket';
import TypescriptExporter from './Kernel/Routes/Web/TypescriptExporter';
// eslint-disable-next-line import/no-named-default
import { default as SocketTypescriptExporter } from './Kernel/Routes/Socket/TypescriptExporter';

const exporter = new TypescriptExporter();
exporter.load(WebRoutes);
exporter.load(GuestRoutes);
exporter.export();

const socketExporter = new SocketTypescriptExporter();
socketExporter.load(SocketRoutes);
socketExporter.export();

console.log('Built routes!');
