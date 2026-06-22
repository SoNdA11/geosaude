import express from 'express';
import prisma from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /history - Obter todo o histórico de logs (ordenado pelo mais recente)
router.get('/', requireAuth, async (req, res) => {
  try {
    const logs = await prisma.history.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        unit: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Formatar a resposta para o frontend
    const formattedLogs = logs.map(log => ({
      id: Number(log.id),
      user: log.user ? log.user.name : 'Sistema/Desconhecido',
      email: log.user ? log.user.email : '',
      action: log.action,
      unit: log.unit ? log.unit.name : 'Geral',
      date: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
      details: log.details
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno ao buscar logs de histórico.' });
  }
});

// POST /history - Adicionar um registro manual no histórico
router.post('/', requireAuth, async (req, res) => {
  const { action, table_name, record_id, unit_id, details } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Ação é um campo obrigatório.' });
  }

  try {
    const log = await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action,
        table_name,
        record_id: record_id ? BigInt(record_id) : null,
        unit_id: unit_id ? BigInt(unit_id) : null,
        details
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Erro ao registrar no histórico:', error);
    res.status(500).json({ error: 'Erro interno ao registrar log.' });
  }
});

export default router;
