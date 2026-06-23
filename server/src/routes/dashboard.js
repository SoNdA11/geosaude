import express from 'express';
import prisma from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /dashboard/gestor - Obter estatísticas analíticas para o gestor da unidade logado
router.get('/gestor', requireAuth, async (req, res) => {
  const unitId = req.user.unitId;
  if (!unitId) {
    return res.status(400).json({ error: 'Este usuário não está vinculado a nenhuma unidade de saúde.' });
  }

  try {
    const BigIntUnitId = BigInt(unitId);

    // 1. Total de Médicos
    const totalDoctors = await prisma.doctors.count({
      where: { unit_id: BigIntUnitId }
    });

    // 2. Total de Serviços distintos cadastrados
    const totalServices = await prisma.services.count({
      where: { unit_id: BigIntUnitId }
    });

    // 3. Nota média das avaliações dos serviços da unidade
    const avgRating = await prisma.avaliacao.aggregate({
      where: { unit_id: BigIntUnitId },
      _avg: { nota: true }
    });
    const averageRating = avgRating._avg.nota ? parseFloat(avgRating._avg.nota.toFixed(2)) : 0;

    // 4. Quantidade de acessos ao longo dos meses do último ano
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setDate(1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const accesses = await prisma.acessosUnidade.findMany({
      where: {
        unit_id: BigIntUnitId,
        timestamp: { gte: oneYearAgo }
      },
      select: { timestamp: true }
    });

    const monthsData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const year = d.getFullYear();
      monthsData.push({
        label: `${monthName}/${String(year).slice(-2)}`,
        year: year,
        month: d.getMonth(),
        count: 0
      });
    }

    accesses.forEach(acc => {
      const date = new Date(acc.timestamp);
      const accYear = date.getFullYear();
      const accMonth = date.getMonth();
      const m = monthsData.find(item => item.year === accYear && item.month === accMonth);
      if (m) {
        m.count++;
      }
    });

    res.json({
      totalDoctors,
      totalServices,
      averageRating,
      accessesChart: monthsData.map(item => ({ label: item.label, value: item.count }))
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard do gestor:', error);
    res.status(500).json({ error: 'Erro interno ao buscar estatísticas do dashboard.' });
  }
});

// GET /dashboard/admin - Obter estatísticas analíticas para o administrador do sistema
router.get('/admin', requireAuth, requireRole(['system_admin']), async (req, res) => {
  const severity = req.query.severity || 'all'; // filtro de triagens: red, orange, blue, emerald, all

  try {
    // 1. Métricas de contagem gerais
    const totalUnits = await prisma.unidades.count();
    const totalGestores = await prisma.profiles.count({ where: { role: 'unit_admin' } });
    const totalDoctors = await prisma.doctors.count();
    const totalAccesses = await prisma.acessosUnidade.count();
    
    // "Total de Serviços prestados" / "Total de Serviços": A quantidade de serviços distintos cadastrados no sistema (sem filtrar por avaliações)
    const totalServices = await prisma.services.count();

    // 2. TOP 5: Especialidade com mais serviços (distinct services)
    const specialtyCounts = await prisma.services.groupBy({
      by: ['specialty'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topSpecialties = specialtyCounts.map(item => ({
      specialty: item.specialty,
      count: item._count.id
    }));

    // TOP 5: Unidades com maior avaliação média (apenas unidades com avaliações)
    const unitAvgRatings = await prisma.avaliacao.groupBy({
      by: ['unit_id'],
      _avg: { nota: true },
      _count: { id: true },
      orderBy: { _avg: { nota: 'desc' } },
      take: 5
    });
    const topUnitsByRating = await Promise.all(
      unitAvgRatings
        .filter(item => item.unit_id !== null)
        .map(async item => {
          const unit = await prisma.unidades.findUnique({
            where: { id: item.unit_id },
            select: { name: true }
          });
          return {
            id: Number(item.unit_id),
            name: unit ? unit.name : 'Desconhecida',
            rating: parseFloat(item._avg.nota.toFixed(2)),
            count: item._count.id
          };
        })
    );

    // TOP 5: Unidade com mais serviços (distinct services)
    const unitServices = await prisma.services.groupBy({
      by: ['unit_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topUnitsByServices = await Promise.all(
      unitServices.map(async item => {
        const unit = await prisma.unidades.findUnique({
          where: { id: item.unit_id },
          select: { name: true }
        });
        return {
          id: Number(item.unit_id),
          name: unit ? unit.name : 'Desconhecida',
          count: item._count.id
        };
      })
    );

    // TOP 5: Unidades com mais acesso
    const unitAccesses = await prisma.acessosUnidade.groupBy({
      by: ['unit_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topUnitsByAccess = await Promise.all(
      unitAccesses.map(async item => {
        const unit = await prisma.unidades.findUnique({
          where: { id: item.unit_id },
          select: { name: true }
        });
        return {
          id: Number(item.unit_id),
          name: unit ? unit.name : 'Desconhecida',
          count: item._count.id
        };
      })
    );

    // TOP 5: Unidades com maior equipe médica
    const unitDoctors = await prisma.doctors.groupBy({
      by: ['unit_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topUnitsByDoctors = await Promise.all(
      unitDoctors.map(async item => {
        const unit = await prisma.unidades.findUnique({
          where: { id: item.unit_id },
          select: { name: true }
        });
        return {
          id: Number(item.unit_id),
          name: unit ? unit.name : 'Desconhecida',
          count: item._count.id
        };
      })
    );

    // 3. Quantidade de Triagens realizadas ao longo dos meses (gráfico de 12 meses), filterable por gravidade (details.result.color)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setDate(1);
    oneYearAgo.setHours(0, 0, 0, 0);

    const triageLogs = await prisma.history.findMany({
      where: {
        table_name: 'triage',
        timestamp: { gte: oneYearAgo }
      },
      select: { timestamp: true, details: true }
    });

    let filteredTriageLogs = triageLogs;
    if (severity && severity !== 'all') {
      filteredTriageLogs = triageLogs.filter(log => {
        try {
          const detailsObj = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          return detailsObj?.result?.color === severity;
        } catch (e) {
          return false;
        }
      });
    }

    const triageMonthsData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const year = d.getFullYear();
      triageMonthsData.push({
        label: `${monthName}/${String(year).slice(-2)}`,
        year: year,
        month: d.getMonth(),
        count: 0
      });
    }

    filteredTriageLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const logYear = date.getFullYear();
      const logMonth = date.getMonth();
      const m = triageMonthsData.find(item => item.year === logYear && item.month === logMonth);
      if (m) {
        m.count++;
      }
    });

    res.json({
      totalUnits,
      totalGestores,
      totalDoctors,
      totalAccesses,
      totalServices,
      topSpecialties,
      topUnitsByRating,
      topUnitsByServices,
      topUnitsByAccess,
      topUnitsByDoctors,
      triageChart: triageMonthsData.map(item => ({ label: item.label, value: item.count }))
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard do admin:', error);
    res.status(500).json({ error: 'Erro interno ao buscar estatísticas do dashboard.' });
  }
});

export default router;
