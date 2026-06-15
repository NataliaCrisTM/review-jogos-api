import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

try {
  await client.connect();
  db = client.db();
  console.log('✅ Conectado ao MongoDB Atlas');
} catch (error) {
  console.error('❌ Falha ao conectar ao MongoDB:', error.message);
  process.exit(1);
}

export default db;