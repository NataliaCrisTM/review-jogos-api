import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../db.json');

const defaultData = {
  games: [],
  reviews: [],
};

const db = await JSONFilePreset(dbPath, defaultData);

export default db;
