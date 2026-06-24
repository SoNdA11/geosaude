import express from 'express';
import prisma from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const formatUnit = (unit) => {
  if (!unit) return null;
  
  // Mapeamos os médicos da tabela real
  const doctors = (unit.doctors || []).map(doc => ({
    id: Number(doc.id),
    unit_id: Number(doc.unit_id),
    name: doc.name,
    specialty: doc.specialty,
    crm: doc.crm || "CRM-RN"
  }));

  // Mapeamos os serviços incluindo a string doctor para compatibilidade retroativa
  const services = (unit.services || []).map(s => ({
    ...s,
    id: Number(s.id),
    unit_id: Number(s.unit_id),
    doctor_id: s.doctor_id ? Number(s.doctor_id) : null,
    doctor: s.doctor ? s.doctor.name : null
  }));

  const news = (unit.news || []).map(n => ({
    ...n,
    id: Number(n.id),
    unit_id: Number(n.unit_id)
  }));

  return {
    ...unit,
    id: Number(unit.id),
    lat: unit.lat ? Number(unit.lat) : 0,
    lng: unit.lng ? Number(unit.lng) : 0,
    doctors,
    services,
    news,
    reviews: []
  };
};

// GET /units - Obter todas as unidades com serviços e notícias
router.get('/', async (req, res) => {
  try {
    const list = await prisma.unidades.findMany({
      include: {
        services: {
          include: {
            doctor: true
          }
        },
        news: true,
        doctors: true
      },
      orderBy: { id: 'asc' }
    });
    res.json(list.map(formatUnit));
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    res.status(500).json({ error: 'Erro interno ao buscar as unidades de saúde.' });
  }
});

// Coordenadas de Bairros e CEPs comuns de Mossoró
const MOSSORO_COORDS = {
  'centro': { lat: -5.1883, lng: -37.3441 },
  'abolicao': { lat: -5.2012, lng: -37.3625 },
  'nova betania': { lat: -5.1895, lng: -37.3551 },
  'santo antonio': { lat: -5.1764, lng: -37.3391 },
  'belo horizonte': { lat: -5.2152, lng: -37.3591 },
  'alto de sao manoel': { lat: -5.1951, lng: -37.3274 },
  'paredoes': { lat: -5.1812, lng: -37.3491 },
  'rincao': { lat: -5.2192, lng: -37.3191 },
  'barrocas': { lat: -5.1712, lng: -37.3481 },
  'boa vista': { lat: -5.1862, lng: -37.3321 },
  'aeroporto': { lat: -5.2102, lng: -37.3712 },
  'dix-sept rosado': { lat: -5.1982, lng: -37.3512 },
  'redencao': { lat: -5.2201, lng: -37.3645 },
  'vicosa': { lat: -5.2052, lng: -37.3151 },
  
  // CEPs
  '59600000': { lat: -5.1883, lng: -37.3441 },
  '59612000': { lat: -5.2012, lng: -37.3625 },
  '59611000': { lat: -5.1895, lng: -37.3551 },
  '59615000': { lat: -5.1764, lng: -37.3391 },
  '59607000': { lat: -5.2152, lng: -37.3591 },
  '59628000': { lat: -5.1951, lng: -37.3274 },
  '59618000': { lat: -5.1812, lng: -37.3491 },
  '59625000': { lat: -5.2192, lng: -37.3191 },
  '59616000': { lat: -5.1712, lng: -37.3481 },
  '59605000': { lat: -5.1862, lng: -37.3321 }
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// GET /units/closest - Obter a UBS mais próxima via Haversine
router.get('/closest', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Termo de busca (q) é obrigatório.' });
  }

  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const cleanQuery = normalizeText(q);
  let searchCoords = null;

  const targetKey = Object.keys(MOSSORO_COORDS).find(k => {
    const normKey = normalizeText(k);
    return normKey === cleanQuery || normKey.includes(cleanQuery) || cleanQuery.includes(normKey);
  });

  if (targetKey) {
    searchCoords = MOSSORO_COORDS[targetKey];
  }

  if (!searchCoords) {
    searchCoords = MOSSORO_COORDS['centro'];
  }

  try {
    const ubsList = await prisma.unidades.findMany({
      where: {
        type: {
          equals: 'UBS',
          mode: 'insensitive'
        }
      }
    });

    if (ubsList.length === 0) {
      return res.status(404).json({ error: 'Nenhuma UBS cadastrada no sistema.' });
    }

    let closestUbs = null;
    let minDistance = Infinity;

    for (const ubs of ubsList) {
      const ubsLat = Number(ubs.lat);
      const ubsLng = Number(ubs.lng);
      const distance = haversineDistance(searchCoords.lat, searchCoords.lng, ubsLat, ubsLng);
      if (distance < minDistance) {
        minDistance = distance;
        closestUbs = ubs;
      }
    }

    res.json({
      ubs: {
        id: Number(closestUbs.id),
        name: closestUbs.name,
        type: closestUbs.type,
        bairro: closestUbs.bairro,
        lat: Number(closestUbs.lat),
        lng: Number(closestUbs.lng)
      },
      distanceKm: parseFloat(minDistance.toFixed(2))
    });
  } catch (error) {
    console.error('Erro ao calcular UBS mais próxima:', error);
    res.status(500).json({ error: 'Erro interno ao calcular UBS mais próxima.' });
  }
});

// GET /units/:id - Obter uma unidade específica
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unit = await prisma.unidades.findUnique({
      where: { id: BigInt(id) },
      include: {
        services: {
          include: {
            doctor: true
          }
        },
        news: true,
        doctors: true
      }
    });

    if (!unit) {
      return res.status(404).json({ error: 'Unidade não encontrada.' });
    }

    res.json(formatUnit(unit));
  } catch (error) {
    console.error('Erro ao buscar unidade:', error);
    res.status(500).json({ error: 'Erro interno ao buscar a unidade.' });
  }
});

// POST /units - Criar unidade (Apenas system_admin)
router.post('/', requireAuth, requireRole(['system_admin']), async (req, res) => {
  const { name, type, bairro, cep, rua, lat, lng, phone, hours, target, urgency, open24h, federativeEntity } = req.body;

  if (!name || !type || !bairro || !cep || !rua || lat === undefined || lng === undefined || !phone || !hours || !target) {
    return res.status(400).json({ error: 'Todos os campos cadastrais da unidade (nome, tipo, bairro, cep, rua, lat, lng, telefone, horário, público alvo) são obrigatórios.' });
  }

  try {
    const unit = await prisma.unidades.create({
      data: {
        name,
        type,
        bairro,
        cep,
        rua,
        lat: Number(lat),
        lng: Number(lng),
        phone,
        hours,
        target,
        urgency: !!urgency,
        open24h: !!open24h,
        federativeEntity: federativeEntity || 'Municipal'
      }
    });

    // Registra no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Cadastrou nova unidade: ${name}`,
        table_name: 'unidades',
        record_id: unit.id,
        unit_id: unit.id
      }
    });

    res.status(201).json(formatUnit(unit));
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    res.status(500).json({ error: 'Erro interno ao criar unidade.' });
  }
});

// PUT /units/:id - Atualizar unidade (system_admin ou unit_admin da própria unidade)
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, type, bairro, cep, rua, lat, lng, phone, hours, target, urgency, open24h, federativeEntity } = req.body;

  // Controle de permissão: unit_admin só edita sua própria unidade
  if (req.user.role !== 'system_admin' && req.user.unitId !== Number(id)) {
    return res.status(403).json({ error: 'Acesso negado. Você só tem permissão para editar sua própria unidade.' });
  }

  if (!name || !type || !bairro || !cep || !rua || lat === undefined || lng === undefined || !phone || !hours || !target) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios para atualizar a unidade.' });
  }

  try {
    const existing = await prisma.unidades.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Unidade não encontrada.' });
    }

    const updated = await prisma.unidades.update({
      where: { id: BigInt(id) },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        bairro: bairro !== undefined ? bairro : existing.bairro,
        cep: cep !== undefined ? cep : existing.cep,
        rua: rua !== undefined ? rua : existing.rua,
        lat: lat !== undefined ? Number(lat) : existing.lat,
        lng: lng !== undefined ? Number(lng) : existing.lng,
        phone: phone !== undefined ? phone : existing.phone,
        hours: hours !== undefined ? hours : existing.hours,
        target: target !== undefined ? target : existing.target,
        urgency: urgency !== undefined ? !!urgency : existing.urgency,
        open24h: open24h !== undefined ? !!open24h : existing.open24h,
        federativeEntity: federativeEntity !== undefined ? federativeEntity : existing.federativeEntity
      }
    });

    // Registra no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Atualizou dados da unidade: ${updated.name}`,
        table_name: 'unidades',
        record_id: updated.id,
        unit_id: updated.id
      }
    });

    res.json(formatUnit(updated));
  } catch (error) {
    console.error('Erro ao atualizar unidade:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar a unidade.' });
  }
});

// DELETE /units/:id - Remover unidade (Apenas system_admin)
router.delete('/:id', requireAuth, requireRole(['system_admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.unidades.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Unidade não encontrada.' });
    }

    await prisma.unidades.delete({
      where: { id: BigInt(id) }
    });

    // Registra no histórico (sem linkar o unit_id já deletado)
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Removeu unidade: ${existing.name}`,
        table_name: 'unidades',
        record_id: BigInt(id)
      }
    });

    res.json({ message: 'Unidade removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover unidade:', error);
    res.status(500).json({ error: 'Erro interno ao deletar a unidade.' });
  }
});

// ============================================
// SERVIÇOS (Services)
// ============================================

// POST /units/:unitId/services - Criar serviço
router.post('/:unitId/services', requireAuth, async (req, res) => {
  const { unitId } = req.params;
  const { name, specialty, doctor_id, description, hours } = req.body;

  if (req.user.role !== 'system_admin' && req.user.unitId !== Number(unitId)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (!name || !specialty || !doctor_id || !description || !hours) {
    return res.status(400).json({ error: 'Todos os campos (Nome, Especialidade, Profissional Responsável, Descrição e Horários) são obrigatórios.' });
  }

  try {
    const service = await prisma.services.create({
      data: {
        unit_id: BigInt(unitId),
        name,
        specialty,
        doctor_id: doctor_id ? BigInt(doctor_id) : null,
        description,
        hours
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Adicionou serviço (${name}) à unidade`,
        table_name: 'services',
        record_id: service.id,
        unit_id: BigInt(unitId)
      }
    });

    res.status(201).json({
      ...service,
      id: Number(service.id),
      unit_id: Number(service.unit_id),
      doctor_id: service.doctor_id ? Number(service.doctor_id) : null
    });
  } catch (error) {
    console.error('Erro ao adicionar serviço:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar serviço.' });
  }
});

// PUT /services/:id - Atualizar serviço
router.put('/services/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, specialty, doctor_id, description, hours } = req.body;

  try {
    const existing = await prisma.services.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!name || !specialty || !doctor_id || !description || !hours) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para a edição do serviço.' });
    }

    const updated = await prisma.services.update({
      where: { id: BigInt(id) },
      data: {
        name: name !== undefined ? name : existing.name,
        specialty: specialty !== undefined ? specialty : existing.specialty,
        doctor_id: doctor_id !== undefined ? (doctor_id ? BigInt(doctor_id) : null) : existing.doctor_id,
        description: description !== undefined ? description : existing.description,
        hours: hours !== undefined ? hours : existing.hours
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Editou serviço (${updated.name}) da unidade`,
        table_name: 'services',
        record_id: updated.id,
        unit_id: updated.unit_id
      }
    });

    res.json({
      ...updated,
      id: Number(updated.id),
      unit_id: Number(updated.unit_id),
      doctor_id: updated.doctor_id ? Number(updated.doctor_id) : null
    });
  } catch (error) {
    console.error('Erro ao editar serviço:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar o serviço.' });
  }
});

// DELETE /services/:id - Deletar serviço
router.delete('/services/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.services.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.services.delete({ where: { id: BigInt(id) } });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Removeu serviço (${existing.name}) da unidade`,
        table_name: 'services',
        record_id: BigInt(id),
        unit_id: existing.unit_id
      }
    });

    res.json({ message: 'Serviço removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    res.status(500).json({ error: 'Erro interno ao remover o serviço.' });
  }
});

// ============================================
// NOTÍCIAS (News)
// ============================================

// POST /units/:unitId/news - Criar notícia
router.post('/:unitId/news', requireAuth, async (req, res) => {
  const { unitId } = req.params;
  const { title, content, date, expires_at } = req.body;

  if (req.user.role !== 'system_admin' && req.user.unitId !== Number(unitId)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (!title || !content || !date || !expires_at) {
    return res.status(400).json({ error: 'Todos os campos (Título, Conteúdo, Data e Prazo Limite) são obrigatórios.' });
  }

  try {
    const news = await prisma.news.create({
      data: {
        unit_id: BigInt(unitId),
        title,
        content,
        date,
        expires_at: expires_at ? new Date(expires_at) : null
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Criou notícia (${title}) na unidade`,
        table_name: 'news',
        record_id: news.id,
        unit_id: BigInt(unitId)
      }
    });

    res.status(201).json({
      ...news,
      id: Number(news.id),
      unit_id: Number(news.unit_id)
    });
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ error: 'Erro interno ao criar notícia.' });
  }
});

// PUT /news/:id - Editar notícia
router.put('/news/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, date, expires_at } = req.body;

  try {
    const existing = await prisma.news.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!title || !content || !date || !expires_at) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para a edição da notícia.' });
    }

    const updated = await prisma.news.update({
      where: { id: BigInt(id) },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        date: date !== undefined ? date : existing.date,
        expires_at: expires_at !== undefined ? (expires_at ? new Date(expires_at) : null) : existing.expires_at
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Editou notícia (${updated.title}) da unidade`,
        table_name: 'news',
        record_id: updated.id,
        unit_id: updated.unit_id
      }
    });

    res.json({
      ...updated,
      id: Number(updated.id),
      unit_id: Number(updated.unit_id)
    });
  } catch (error) {
    console.error('Erro ao editar notícia:', error);
    res.status(500).json({ error: 'Erro interno ao editar a notícia.' });
  }
});

// DELETE /news/:id - Deletar notícia
router.delete('/news/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.news.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.news.delete({ where: { id: BigInt(id) } });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Removeu notícia (${existing.title}) da unidade`,
        table_name: 'news',
        record_id: BigInt(id),
        unit_id: existing.unit_id
      }
    });

    res.json({ message: 'Notícia removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover notícia:', error);
    res.status(500).json({ error: 'Erro interno ao remover a notícia.' });
  }
});

// ============================================
// MÉDICOS (Doctors)
// ============================================

// GET /units/:unitId/doctors - Obter médicos da unidade
router.get('/:unitId/doctors', async (req, res) => {
  const { unitId } = req.params;
  try {
    const list = await prisma.doctors.findMany({
      where: { unit_id: BigInt(unitId) },
      orderBy: { name: 'asc' }
    });
    res.json(list.map(doc => ({
      id: Number(doc.id),
      unit_id: Number(doc.unit_id),
      name: doc.name,
      specialty: doc.specialty,
      crm: doc.crm
    })));
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar médicos.' });
  }
});

// POST /units/:unitId/doctors - Criar médico
router.post('/:unitId/doctors', requireAuth, async (req, res) => {
  const { unitId } = req.params;
  const { name, specialty, crm } = req.body;

  if (req.user.role !== 'system_admin' && req.user.unitId !== Number(unitId)) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (!name || !specialty || !crm) {
    return res.status(400).json({ error: 'Todos os campos (Nome, Especialidade e CRM) são obrigatórios.' });
  }

  try {
    const doctor = await prisma.doctors.create({
      data: {
        unit_id: BigInt(unitId),
        name,
        specialty,
        crm
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Adicionou profissional (${name}) à unidade`,
        table_name: 'doctors',
        record_id: doctor.id,
        unit_id: BigInt(unitId)
      }
    });

    res.status(201).json({
      id: Number(doctor.id),
      unit_id: Number(doctor.unit_id),
      name: doctor.name,
      specialty: doctor.specialty,
      crm: doctor.crm
    });
  } catch (error) {
    console.error('Erro ao adicionar profissional:', error);
    res.status(500).json({ error: 'Erro interno ao adicionar profissional.' });
  }
});

// PUT /units/doctors/:id - Atualizar médico
router.put('/doctors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, specialty, crm } = req.body;

  try {
    const existing = await prisma.doctors.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    if (!name || !specialty || !crm) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para a edição do profissional.' });
    }

    const updated = await prisma.doctors.update({
      where: { id: BigInt(id) },
      data: {
        name: name !== undefined ? name : existing.name,
        specialty: specialty !== undefined ? specialty : existing.specialty,
        crm: crm !== undefined ? crm : existing.crm
      }
    });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Editou profissional (${updated.name}) da unidade`,
        table_name: 'doctors',
        record_id: updated.id,
        unit_id: updated.unit_id
      }
    });

    res.json({
      id: Number(updated.id),
      unit_id: Number(updated.unit_id),
      name: updated.name,
      specialty: updated.specialty,
      crm: updated.crm
    });
  } catch (error) {
    console.error('Erro ao editar profissional:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar profissional.' });
  }
});

// DELETE /units/doctors/:id - Deletar médico
router.delete('/doctors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.doctors.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Profissional não encontrado.' });
    }

    if (req.user.role !== 'system_admin' && req.user.unitId !== Number(existing.unit_id)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    await prisma.doctors.delete({ where: { id: BigInt(id) } });

    // Registrar no histórico
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Removeu profissional (${existing.name}) da unidade`,
        table_name: 'doctors',
        record_id: BigInt(id),
        unit_id: existing.unit_id
      }
    });

    res.json({ message: 'Profissional removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover profissional:', error);
    res.status(500).json({ error: 'Erro interno ao remover profissional.' });
  }
});

// POST /triage/log - Registrar triagem inteligente (Público)
router.post('/triage/log', async (req, res) => {
  const { action, unit_id, details } = req.body;
  try {
    const log = await prisma.history.create({
      data: {
        action: action || 'Triagem Inteligente Realizada',
        table_name: 'triage',
        unit_id: unit_id ? BigInt(unit_id) : null,
        details: details || {}
      }
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Erro ao registrar triagem:', error);
    res.status(500).json({ error: 'Erro interno ao registrar log de triagem.' });
  }
});

// POST /units/:id/access - Registrar acesso à unidade de saúde (Público)
router.post('/:id/access', async (req, res) => {
  const { id } = req.params;
  try {
    const unit = await prisma.unidades.findUnique({
      where: { id: BigInt(id) }
    });
    if (!unit) {
      return res.status(404).json({ error: 'Unidade não encontrada.' });
    }
    await prisma.acessosUnidade.create({
      data: {
        unit_id: BigInt(id)
      }
    });
    res.status(201).json({ message: 'Acesso registrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    res.status(500).json({ error: 'Erro interno ao registrar acesso.' });
  }
});

export default router;
