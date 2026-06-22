import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import jwt from 'jsonwebtoken';

// Mocking Prisma Client methods
prisma.unidades.findMany = jest.fn();
prisma.unidades.findUnique = jest.fn();
prisma.unidades.create = jest.fn();
prisma.unidades.update = jest.fn();
prisma.unidades.delete = jest.fn();
prisma.profiles.findUnique = jest.fn();
prisma.history.create = jest.fn();

const JWT_SECRET = 'geosaude-segredo-token-jwt-2026-mossoro';

// Helper para gerar token JWT
const generateTestToken = (userId, email, role) => {
  return jwt.sign({ id: userId.toString(), email, role }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Units Endpoints', () => {
  let sysAdminToken;
  let unitAdminToken;

  beforeAll(() => {
    sysAdminToken = generateTestToken(1, 'admin@saude.com', 'system_admin');
    unitAdminToken = generateTestToken(2, 'gestor@saude.com', 'unit_admin');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /units', () => {
    it('deve listar todas as unidades de saude', async () => {
      prisma.unidades.findMany.mockResolvedValue([
        { id: 1n, name: 'UBS Centro', type: 'UBS', bairro: 'Centro', lat: -5.2, lng: -37.3 }
      ]);

      const res = await request(app).get('/units');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('id', 1);
      expect(res.body[0]).toHaveProperty('name', 'UBS Centro');
    });
  });

  describe('POST /units', () => {
    it('deve permitir system_admin criar uma unidade', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 1n, email: 'admin@saude.com', role: 'system_admin' });
      prisma.unidades.create.mockResolvedValue({
        id: 4n,
        name: 'UPA Norte',
        type: 'UPA',
        bairro: 'Abolição',
        cep: '59600-000',
        rua: 'Rua Principal',
        lat: -5.21,
        lng: -37.32,
        phone: '(84) 3315-1111',
        hours: '24h',
        target: 'Geral',
        urgency: true,
        open24h: true
      });

      const res = await request(app)
        .post('/units')
        .set('Authorization', `Bearer ${sysAdminToken}`)
        .send({
          name: 'UPA Norte',
          type: 'UPA',
          bairro: 'Abolição',
          cep: '59600-000',
          rua: 'Rua Principal',
          lat: -5.21,
          lng: -37.32,
          phone: '(84) 3315-1111',
          hours: '24h',
          target: 'Geral',
          urgency: true,
          open24h: true
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'UPA Norte');
      expect(prisma.unidades.create).toHaveBeenCalled();
    });

    it('deve proibir unit_admin de criar uma unidade', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 2n, email: 'gestor@saude.com', role: 'unit_admin' });

      const res = await request(app)
        .post('/units')
        .set('Authorization', `Bearer ${unitAdminToken}`)
        .send({
          name: 'UPA Norte',
          type: 'UPA',
          bairro: 'Abolição',
          cep: '59600-000',
          rua: 'Rua Principal',
          lat: -5.21,
          lng: -37.32,
          phone: '(84) 3315-1111',
          hours: '24h',
          target: 'Geral',
          urgency: true,
          open24h: true
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('error', 'Acesso proibido. Permissão insuficiente.');
    });
  });

  describe('POST /units/triage/log', () => {
    it('deve permitir que qualquer usuario registre um log de triagem anonimo', async () => {
      prisma.history.create.mockResolvedValue({
        id: 10n,
        action: 'Triagem Inteligente: Classificação EMERGÊNCIA MÉDICA',
        table_name: 'triage',
        unit_id: null,
        details: { answers: {}, result: {} }
      });

      const res = await request(app)
        .post('/units/triage/log')
        .send({
          action: 'Triagem Inteligente: Classificação EMERGÊNCIA MÉDICA',
          unit_id: null,
          details: { answers: {}, result: {} }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('action', 'Triagem Inteligente: Classificação EMERGÊNCIA MÉDICA');
      expect(prisma.history.create).toHaveBeenCalled();
    });
  });
});
