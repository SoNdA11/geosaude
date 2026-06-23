import express from 'express';
import prisma from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to serialize BigInts
const serializeReview = (rev) => {
  if (!rev) return null;
  return {
    ...rev,
    id: Number(rev.id),
    service_id: rev.service_id ? Number(rev.service_id) : null,
    unit_id: rev.unit_id ? Number(rev.unit_id) : null,
    serviceName: rev.service ? rev.service.name : 'Geral',
    unitName: rev.unit ? rev.unit.name : 'Geral'
  };
};

// POST /reviews - Enviar uma avaliação de serviço/UBS
router.post('/', async (req, res) => {
  const { nota, comentario, service_id, unit_id } = req.body;

  const intNota = parseInt(nota);
  if (isNaN(intNota) || intNota < 0 || intNota > 5) {
    return res.status(400).json({ error: 'A nota deve ser um número inteiro entre 0 e 5.' });
  }

  try {
    let targetUnitId = unit_id ? BigInt(unit_id) : null;
    let targetServiceId = service_id ? BigInt(service_id) : null;

    if (targetServiceId && !targetUnitId) {
      const srv = await prisma.services.findUnique({
        where: { id: targetServiceId }
      });
      if (srv) {
        targetUnitId = srv.unit_id;
      }
    }

    const review = await prisma.avaliacao.create({
      data: {
        nota: intNota,
        comentario: comentario ? comentario.trim() : null,
        service_id: targetServiceId,
        unit_id: targetUnitId
      },
      include: {
        service: true,
        unit: true
      }
    });

    res.status(201).json(serializeReview(review));
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
    res.status(500).json({ error: 'Erro interno ao registrar avaliação.' });
  }
});

// GET /reviews - Listar avaliações (Administradores/Gestores)
router.get('/', requireAuth, async (req, res) => {
  const { status } = req.query;

  const where = {};

  if (req.user.role === 'unit_admin') {
    if (!req.user.unitId) {
      return res.status(400).json({ error: 'Gestor sem unidade associada.' });
    }
    where.unit_id = BigInt(req.user.unitId);
  }

  if (status === 'unread') {
    where.lido_pelo_gestor = false;
  } else if (status === 'read') {
    where.lido_pelo_gestor = true;
  }

  try {
    const list = await prisma.avaliacao.findMany({
      where,
      include: {
        service: {
          select: {
            name: true
          }
        },
        unit: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(list.map(serializeReview));
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ error: 'Erro interno ao listar feedbacks.' });
  }
});

// PUT /reviews/:id/read - Marcar avaliação como lida
router.put('/:id/read', requireAuth, async (req, res) => {
  const id = BigInt(req.params.id);

  try {
    const review = await prisma.avaliacao.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    if (req.user.role === 'unit_admin' && review.unit_id !== BigInt(req.user.unitId)) {
      return res.status(403).json({ error: 'Acesso negado a avaliações de outras unidades.' });
    }

    const updated = await prisma.avaliacao.update({
      where: { id },
      data: {
        lido_pelo_gestor: true
      },
      include: {
        service: true,
        unit: true
      }
    });

    // Registrar ação no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Visualizou e marcou feedback ID #${updated.id} como lido`,
        table_name: 'avaliacao',
        record_id: updated.id,
        unit_id: updated.unit_id,
        details: { rating: updated.nota }
      }
    });

    res.json(serializeReview(updated));
  } catch (error) {
    console.error('Erro ao marcar avaliação como lida:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do feedback.' });
  }
});

export default router;
