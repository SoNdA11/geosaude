import express from 'express';
import prisma from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /history - Obter o histórico de logs paginado e filtrado (ordenado pelo mais recente)
router.get('/', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const unitId = req.query.unitId ? String(req.query.unitId) : null;
  const actionType = req.query.actionType ? String(req.query.actionType).toLowerCase() : null;
  const startDate = req.query.startDate ? String(req.query.startDate) : null;
  const endDate = req.query.endDate ? String(req.query.endDate) : null;

  const where = {};
  if (unitId) {
    where.unit_id = BigInt(unitId);
  }

  // Filtragem por período de datas
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      where.timestamp.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  // Filtragem por tipo de ação
  if (actionType) {
    if (actionType === 'criação' || actionType === 'criacao') {
      where.OR = [
        { action: { contains: 'cadastr', mode: 'insensitive' } },
        { action: { contains: 'cri', mode: 'insensitive' } },
        { action: { contains: 'adicion', mode: 'insensitive' } },
        { action: { contains: 'envi', mode: 'insensitive' } },
        { action: { contains: 'public', mode: 'insensitive' } }
      ];
    } else if (actionType === 'edição' || actionType === 'edicao') {
      where.OR = [
        { action: { contains: 'atualiz', mode: 'insensitive' } },
        { action: { contains: 'edit', mode: 'insensitive' } },
        { action: { contains: 'alter', mode: 'insensitive' } },
        { action: { contains: 'reset', mode: 'insensitive' } },
        { action: { contains: 'visualiz', mode: 'insensitive' } }
      ];
    } else if (actionType === 'exclusão' || actionType === 'exclusao') {
      where.OR = [
        { action: { contains: 'remov', mode: 'insensitive' } },
        { action: { contains: 'exclu', mode: 'insensitive' } },
        { action: { contains: 'delet', mode: 'insensitive' } }
      ];
    } else if (actionType === 'login') {
      where.OR = [
        { action: { contains: 'login', mode: 'insensitive' } },
        { action: { contains: 'autentic', mode: 'insensitive' } }
      ];
    }
  }

  try {
    const total = await prisma.history.count({ where });

    const logs = await prisma.history.findMany({
      where,
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
      },
      skip: (page - 1) * limit,
      take: limit
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

    res.json({
      logs: formattedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
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
