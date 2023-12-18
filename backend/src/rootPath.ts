
import { fileURLToPath } from 'url';
import path from 'path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/**
 * Get the root path of the project (from src)
 *
 * @returns {string} The root path of the project
 */
export default function root (): string {
    return _dirname;
}
