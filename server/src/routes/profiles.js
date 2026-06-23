import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apenas administradores do sistema podem acessar o controle de perfis
router.use(requireAuth, requireRole(['system_admin']));

// GET /profiles - Listar todos os administradores de unidades
router.get('/', async (req, res) => {
  try {
    const list = await prisma.profiles.findMany({
      where: {
        role: 'unit_admin'
      },
      include: {
        unit: {
          select: {
            name: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Formatar a resposta
    const formatted = list.map(profile => ({
      id: Number(profile.id),
      name: profile.name,
      email: profile.email,
      role: profile.role,
      unitId: profile.unit_id ? Number(profile.unit_id) : null,
      unitName: profile.unit ? profile.unit.name : 'Nenhuma',
      lastAccess: profile.last_access ? profile.last_access.toISOString() : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({ error: 'Erro interno ao listar perfis.' });
  }
});

// POST /profiles - Criar um novo administrador de unidade
router.post('/', async (req, res) => {
  const { name, email, password, unitId } = req.body;

  if (!name || !email || !password || !unitId) {
    return res.status(400).json({ error: 'Nome, e-mail, senha e unidade vinculada são obrigatórios.' });
  }

  try {
    const existing = await prisma.profiles.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profile = await prisma.profiles.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'unit_admin',
        unit_id: BigInt(unitId)
      }
    });

    // Registrar log
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Criou novo administrador de unidade: ${name}`,
        table_name: 'profiles',
        record_id: profile.id,
        unit_id: BigInt(unitId)
      }
    });

    res.status(201).json({
      id: Number(profile.id),
      name: profile.name,
      email: profile.email,
      role: profile.role,
      unitId: Number(profile.unit_id)
    });
  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: 'Erro interno ao criar administrador.' });
  }
});

// PUT /profiles/:id - Atualizar dados do administrador
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, unitId } = req.body;

  if (!name || !email || !unitId) {
    return res.status(400).json({ error: 'Nome, e-mail e unidade vinculada são obrigatórios.' });
  }

  try {
    const existing = await prisma.profiles.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    const updated = await prisma.profiles.update({
      where: { id: BigInt(id) },
      data: {
        name,
        email,
        unit_id: BigInt(unitId)
      }
    });

    // Registrar log
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Atualizou dados do administrador: ${updated.name}`,
        table_name: 'profiles',
        record_id: updated.id,
        unit_id: BigInt(unitId)
      }
    });

    res.json({
      id: Number(updated.id),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      unitId: updated.unit_id ? Number(updated.unit_id) : null
    });
  } catch (error) {
    console.error('Erro ao editar perfil:', error);
    res.status(500).json({ error: 'Erro interno ao editar administrador.' });
  }
});

// PUT /profiles/:id/reset-password - Redefinir senha do administrador
router.put('/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'Nova senha é obrigatória.' });
  }

  try {
    const existing = await prisma.profiles.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.profiles.update({
      where: { id: BigInt(id) },
      data: {
        password: hashedPassword
      }
    });

    // Registrar log
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Redefiniu a senha do administrador: ${existing.name}`,
        table_name: 'profiles',
        record_id: BigInt(id),
        unit_id: existing.unit_id
      }
    });

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
});

// DELETE /profiles/:id - Remover administrador
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.profiles.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    await prisma.profiles.delete({ where: { id: BigInt(id) } });

    // Registrar log
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Removeu o administrador de unidade: ${existing.name}`,
        table_name: 'profiles',
        record_id: BigInt(id),
        unit_id: existing.unit_id
      }
    });

    res.json({ message: 'Administrador removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover perfil:', error);
    res.status(500).json({ error: 'Erro interno ao deletar administrador.' });
  }
});

export default router;
