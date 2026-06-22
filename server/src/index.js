import 'dotenv/config';
import app from './app.js';
import { startExpiredNewsCleanup } from './utils/scheduler.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  startExpiredNewsCleanup();
});
