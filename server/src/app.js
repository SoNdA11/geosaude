import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import unitRoutes from './routes/units.js';
import historyRoutes from './routes/history.js';
import profileRoutes from './routes/profiles.js';
import documentRoutes from './routes/documents.js';
import reviewRoutes from './routes/reviews.js';
import dashboardRoutes from './routes/dashboard.js';
import { logError } from './utils/logger.js';

const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rota de Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Registro de Rotas da API
app.use('/auth', authRoutes);
app.use('/units', unitRoutes);
app.use('/history', historyRoutes);
app.use('/profiles', profileRoutes);
app.use('/documents', documentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/dashboard', dashboardRoutes);

// Tratamento de Rotas Não Encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Middleware de Erro Global
app.use((err, req, res, next) => {
  console.error('Erro detectado na aplicação:', err);
  logError(err, req);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

export default app;
