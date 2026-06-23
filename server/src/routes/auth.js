import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const router = express.Router();

// Rota de registro (/auth/register)
router.post('/register', async (req, res) => {
  const { email, password, name, role, unitId } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    // Verificar se usuário já existe
    const existingUser = await prisma.profiles.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o perfil
    const user = await prisma.profiles.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        unit_id: unitId ? BigInt(unitId) : null
      }
    });

    // Retornar dados (sem a senha)
    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        unitId: user.unit_id ? Number(user.unit_id) : null
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
});

// Rota de login (/auth/login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Buscar usuário pelo e-mail
    const user = await prisma.profiles.findUnique({
      where: { email }
    });

    if (!user) {
      await prisma.history.create({
        data: {
          action: `Tentativa de login mal-sucedida: Conta inexistente (${email})`,
          table_name: 'profiles',
          details: { email, reason: 'Conta de e-mail não encontrada' }
        }
      });
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Comparar senhas
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await prisma.history.create({
        data: {
          action: `Tentativa de login mal-sucedida: Senha incorreta (${email})`,
          table_name: 'profiles',
          record_id: user.id,
          unit_id: user.unit_id,
          details: { email, reason: 'Senha incorreta' }
        }
      });
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'geosaude-segredo-token-jwt-2026-mossoro',
      { expiresIn: '24h' }
    );

    // Registrar login bem-sucedido e atualizar last_access
    await prisma.profiles.update({
      where: { id: user.id },
      data: { last_access: new Date() }
    });

    await prisma.history.create({
      data: {
        user_id: user.id,
        action: `Login realizado com sucesso: ${user.name}`,
        table_name: 'profiles',
        record_id: user.id,
        unit_id: user.unit_id
      }
    });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        unitId: user.unit_id ? Number(user.unit_id) : null
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

export default router;
