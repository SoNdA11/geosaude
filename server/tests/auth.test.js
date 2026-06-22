import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Sobrescrever métodos do prisma com mocks do Jest
prisma.profiles.findUnique = jest.fn();
prisma.profiles.create = jest.fn();
prisma.history.create = jest.fn();

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuario com sucesso', async () => {
      prisma.profiles.findUnique.mockResolvedValue(null);
      prisma.profiles.create.mockResolvedValue({
        id: 10n,
        name: 'Test User',
        email: 'test@saude.com',
        role: 'unit_admin',
        unit_id: 1n
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@saude.com',
          password: 'password123',
          name: 'Test User',
          role: 'unit_admin',
          unitId: 1
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.user).toHaveProperty('id', 10);
      expect(res.body.user).toHaveProperty('email', 'test@saude.com');
      expect(prisma.profiles.create).toHaveBeenCalled();
    });

    it('deve falhar se o email ja estiver registrado', async () => {
      prisma.profiles.findUnique.mockResolvedValue({ id: 1n, email: 'test@saude.com' });

      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@saude.com',
          password: 'password123',
          name: 'Test User',
          role: 'unit_admin'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'E-mail já cadastrado.');
    });
  });

  describe('POST /auth/login', () => {
    it('deve logar e retornar token JWT para credenciais validas', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.profiles.findUnique.mockResolvedValue({
        id: 1n,
        email: 'test@saude.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'system_admin',
        unit_id: null
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@saude.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@saude.com');
      expect(res.body.user).toHaveProperty('role', 'system_admin');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.profiles.findUnique.mockResolvedValue({
        id: 1n,
        email: 'test@saude.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'system_admin'
      });

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@saude.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Credenciais inválidas.');
    });
  });
});
