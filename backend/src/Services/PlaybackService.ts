import { Queue } from '#Modules/Queue.js';
import { PlaybackHandler } from '#Modules/PlaybackHandler.js';
import log from '#Kernel/Services/Logging.js';

export const queue = new Queue('regular');
export const priorityQueue = new Queue('priority');

const playbackHandler = new PlaybackHandler(queue, priorityQueue);

log.info('PLAYBACKHANDLER', 'Playback handler started');

export default playbackHandler;
