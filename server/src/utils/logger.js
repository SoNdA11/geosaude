import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a pasta de logs (dentro de /server/logs)
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');

// Garantir que o diretório de logs exista
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ERROR: ${error.message || error}\n`;

  if (error.stack) {
    logMessage += `Stack: ${error.stack}\n`;
  }

  if (req) {
    logMessage += `Request: ${req.method} ${req.originalUrl}\n`;
    logMessage += `IP: ${req.ip}\n`;
    if (req.user) {
      logMessage += `User ID: ${req.user.id} (${req.user.email})\n`;
    }
  }

  logMessage += `${'-'.repeat(80)}\n`;

  // Escrever de forma assíncrona para não bloquear o event loop
  fs.appendFile(ERROR_LOG_PATH, logMessage, (err) => {
    if (err) {
      console.error('Falha ao escrever log de erro em arquivo:', err);
    }
  });
};
