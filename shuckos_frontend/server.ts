import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import routes from './src/server/routes.js';
import { User, Restaurant, MenuItem, Order, Review, Visit, QualityInspection } from './src/server/models.js';

// Función para serializar objetos de forma segura (evita errores circulares)
function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Omitir objetos internos de MongoDB/Mongoose que causan circularidad
      if (key === 'session' || key === 'client' || key === '_Config' || key === 'db') return undefined;
      return value;
    });
  } catch (e) {
    return "[Error de serialización]";
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Start MongoDB Memory Replica Set (Required for Transactions)
  const replset = await MongoMemoryReplSet.create({ replSet: { storageEngine: 'wiredTiger' } });
  const uri = replset.getUri();
  console.log(`MongoDB Memory Replica Set started at: ${uri}`);

  // Connect Mongoose
  await mongoose.connect(uri);
  console.log('Mongoose connected to Replica Set');

  // Force create collections (Required for transactions)
  await Promise.all([
    User.createCollection(),
    Restaurant.createCollection(),
    MenuItem.createCollection(),
    Order.createCollection(),
    Review.createCollection(),
    Visit.createCollection(),
    QualityInspection.createCollection()
  ]);
  console.log('Collections initialized');

  // Intercept Mongoose Queries and emit via Socket.io
  mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any, options: any) => {
    // Usar safeStringify para evitar que el logger rompa la ejecución del API
    const log = {
      collection: collectionName,
      method,
      query: safeStringify(query),
      doc: safeStringify(doc),
      options: safeStringify(options),
      timestamp: new Date().toISOString()
    };
    
    console.log(`[MongoDB] ${collectionName}.${method}`, query);
    io.emit('mongo-query', log);
  });

  // API Routes
  app.use('/api', routes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
