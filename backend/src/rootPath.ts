
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Get the root path of the project (from src)
 *
 * @returns {string} The root path of the project
 */
export default function root (): string {
    return __dirname;
}
