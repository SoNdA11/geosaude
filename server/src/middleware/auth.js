import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'geosaude-segredo-token-jwt-2026-mossoro');
    
    // Buscar o perfil no banco para confirmar a existência
    const profile = await prisma.profiles.findUnique({
      where: { id: BigInt(decoded.id) }
    });

    if (!profile) {
      return res.status(401).json({ error: 'Usuário não encontrado ou token inválido.' });
    }

    // Anexar o usuário à requisição
    req.user = {
      id: Number(profile.id),
      email: profile.email,
      name: profile.name,
      role: profile.role,
      unitId: profile.unit_id ? Number(profile.unit_id) : null
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso proibido. Permissão insuficiente.' });
    }
    next();
  };
};
