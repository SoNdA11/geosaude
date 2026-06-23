import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import jwt from 'jsonwebtoken';

// Mocking Prisma Client methods for DocumentoInformativo
prisma.documentoInformativo = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
prisma.profiles.findUnique = jest.fn();
prisma.history.create = jest.fn();

const JWT_SECRET = 'geosaude-segredo-token-jwt-2026-mossoro';

// Helper para gerar token JWT
const generateTestToken = (userId, email, role) => {
  return jwt.sign({ id: userId.toString(), email, role }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Documents Endpoints', () => {
  let adminToken;

  beforeAll(() => {
    adminToken = generateTestToken(1, 'admin@saude.com', 'system_admin');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /documents/public', () => {
    it('deve listar apenas documentos publicados para o cidadão', async () => {
      const mockDocs = [
        {
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          titulo: 'Calendário de Vacinação',
          descricao: 'Campanha 2026',
          caminho_arquivo: '/uploads/vacina.pdf',
          formato_extensao: 'pdf',
          tamanho_bytes: 1024n,
          categoria: 'Campanhas e Vacinação',
          orgao_emissor: 'Secretaria de Saúde',
          contador_downloads: 5,
          contador_visualizacoes: 10,
          data_publicacao: new Date(),
          status: 'Publicado'
        }
      ];

      prisma.documentoInformativo.findMany.mockResolvedValue(mockDocs);

      const res = await request(app).get('/documents/public');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('status', 'Publicado');
      expect(res.body[0]).toHaveProperty('tamanho_bytes', 1024);
      expect(prisma.documentoInformativo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'Publicado' })
        })
      );
    });
  });

  describe('GET /documents (Privado)', () => {
    it('deve rejeitar acesso para usuário não autenticado', async () => {
      const res = await request(app).get('/documents');
      expect(res.statusCode).toEqual(401);
    });

    it('deve permitir acesso para administrador autenticado', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 1n, email: 'admin@saude.com', role: 'system_admin' });
      prisma.documentoInformativo.findMany.mockResolvedValue([
        {
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          titulo: 'Documento Rascunho',
          descricao: 'Em edição',
          caminho_arquivo: '/uploads/rascunho.pdf',
          formato_extensao: 'pdf',
          tamanho_bytes: 2048n,
          categoria: 'Lista de Medicamentos',
          orgao_emissor: 'Vigilância Sanitária',
          contador_downloads: 0,
          contador_visualizacoes: 0,
          data_publicacao: null,
          status: 'Rascunho'
        }
      ]);

      const res = await request(app)
        .get('/documents')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body[0]).toHaveProperty('status', 'Rascunho');
      expect(prisma.documentoInformativo.findMany).toHaveBeenCalled();
    });
  });

  describe('POST /documents (Privado)', () => {
    it('deve permitir cadastrar um novo documento informativo', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 1n, email: 'admin@saude.com', role: 'system_admin' });
      prisma.documentoInformativo.create.mockResolvedValue({
        id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        titulo: 'Guia do Cidadão',
        descricao: 'Serviços do SUS Mossoró',
        caminho_arquivo: '/uploads/guia.pdf',
        formato_extensao: 'pdf',
        tamanho_bytes: 5120n,
        categoria: 'Guias e Serviços ao Cidadão',
        orgao_emissor: 'Secretaria de Saúde',
        contador_downloads: 0,
        contador_visualizacoes: 0,
        data_publicacao: new Date(),
        status: 'Publicado'
      });

      const res = await request(app)
        .post('/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('titulo', 'Guia do Cidadão')
        .field('descricao', 'Serviços do SUS Mossoró')
        .field('categoria', 'Guias e Serviços ao Cidadão')
        .field('orgao_emissor', 'Secretaria de Saúde')
        .field('status', 'Publicado')
        .attach('arquivo', Buffer.from('fake pdf data'), 'test.pdf');

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('titulo', 'Guia do Cidadão');
      expect(res.body).toHaveProperty('status', 'Publicado');
      expect(prisma.documentoInformativo.create).toHaveBeenCalled();
      expect(prisma.history.create).toHaveBeenCalled();
    });
  });

  describe('DELETE /documents/:id (Privado)', () => {
    it('deve permitir remover um documento informativo cadastrado', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 1n, email: 'admin@saude.com', role: 'system_admin' });
      prisma.documentoInformativo.findUnique.mockResolvedValue({
        id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        titulo: 'Guia do Cidadão',
        caminho_arquivo: '/uploads/guia.pdf'
      });
      prisma.documentoInformativo.delete.mockResolvedValue({});

      const res = await request(app)
        .delete('/documents/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Documento excluído com sucesso.');
      expect(prisma.documentoInformativo.delete).toHaveBeenCalled();
    });
  });
});
