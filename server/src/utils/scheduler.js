import prisma from '../config/db.js';

async function deleteExpiredNews() {
  try {
    const now = new Date();
    const deleted = await prisma.news.deleteMany({
      where: {
        expires_at: {
          lte: now
        }
      }
    });
    if (deleted.count > 0) {
      console.log(`[Scheduler] Removidas ${deleted.count} notícias expiradas.`);
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao deletar notícias expiradas:', error);
  }
}

export function startExpiredNewsCleanup() {
  // Executa uma vez na inicialização
  deleteExpiredNews();

  function scheduleNextRun() {
    const now = new Date();
    const nextRun = new Date();
    
    // Define para rodar às 12:00 (meio-dia) ou às 00:00 (meia-noite)
    if (now.getHours() < 12) {
      nextRun.setHours(12, 0, 0, 0);
    } else {
      nextRun.setDate(now.getDate() + 1);
      nextRun.setHours(0, 0, 0, 0);
    }
    
    const delay = nextRun.getTime() - now.getTime();
    console.log(`[Scheduler] Próxima limpeza de notícias expiradas agendada para: ${nextRun.toLocaleString('pt-BR')} (em ${Math.round(delay / 1000 / 60)} minutos)`);

    setTimeout(async () => {
      await deleteExpiredNews();
      scheduleNextRun(); // reagenda para a próxima execução
    }, delay);
  }

  scheduleNextRun();
}
