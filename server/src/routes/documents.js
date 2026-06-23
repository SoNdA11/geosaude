import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Garantir que a pasta de uploads existe
const UPLOADS_DIR = 'uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuração do Multer para salvamento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // limite de 15MB
});

// Helper para converter BigInt para JSON
const serializeDoc = (doc) => {
  if (!doc) return null;
  return {
    ...doc,
    tamanho_bytes: doc.tamanho_bytes ? Number(doc.tamanho_bytes) : 0
  };
};

// GET /documents/public - Listagem pública de documentos (APENAS status == 'Publicado')
router.get('/public', async (req, res) => {
  const { categoria, q } = req.query;

  const where = {
    status: 'Publicado'
  };

  if (categoria) {
    where.categoria = categoria;
  }

  if (q && q.trim()) {
    where.OR = [
      { titulo: { contains: q, mode: 'insensitive' } },
      { descricao: { contains: q, mode: 'insensitive' } }
    ];
  }

  try {
    const docs = await prisma.documentoInformativo.findMany({
      where,
      orderBy: {
        data_publicacao: 'desc'
      }
    });

    res.json(docs.map(serializeDoc));
  } catch (error) {
    console.error('Erro ao buscar documentos públicos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar documentos públicos.' });
  }
});

// GET /documents/public/:id - Obter um documento público específico (Garante visibilidade estrita)
router.get('/public/:id', async (req, res) => {
  try {
    const doc = await prisma.documentoInformativo.findFirst({
      where: {
        id: req.params.id,
        status: 'Publicado'
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado ou não publicado.' });
    }

    res.json(serializeDoc(doc));
  } catch (error) {
    console.error('Erro ao buscar documento público:', error);
    res.status(500).json({ error: 'Erro interno ao buscar documento.' });
  }
});

// GET /documents - Obter todos os documentos (Apenas Administrador Autenticado)
router.get('/', requireAuth, async (req, res) => {
  const { status, categoria } = req.query;
  const where = {};
  if (status) {
    where.status = status;
  }
  if (categoria) {
    where.categoria = categoria;
  }

  try {
    const docs = await prisma.documentoInformativo.findMany({
      where,
      orderBy: {
        data_publicacao: { sort: 'desc', nulls: 'last' }
      }
    });

    res.json(docs.map(serializeDoc));
  } catch (error) {
    console.error('Erro ao listar documentos no admin:', error);
    res.status(500).json({ error: 'Erro ao listar documentos.' });
  }
});

// POST /documents - Criar documento informativo (Apenas Administrador Autenticado)
router.post('/', requireAuth, upload.single('arquivo'), async (req, res) => {
  const { titulo, descricao, categoria, orgao_emissor, status: clientStatus } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo do documento é obrigatório.' });
  }
  if (!titulo || !descricao || !categoria || !orgao_emissor) {
    // Apagar o arquivo que foi salvo
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Título, descrição, categoria e órgão emissor são obrigatórios.' });
  }

  const isPublic = clientStatus === 'Publicado';
  const status = isPublic ? 'Publicado' : 'Rascunho';
  const data_publicacao = isPublic ? new Date() : null;

  const caminho_arquivo = `/uploads/${req.file.filename}`;
  const formato_extensao = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'bin';
  const tamanho_bytes = BigInt(req.file.size);

  try {
    const doc = await prisma.documentoInformativo.create({
      data: {
        titulo,
        descricao,
        caminho_arquivo,
        formato_extensao,
        tamanho_bytes,
        categoria,
        orgao_emissor,
        status,
        data_publicacao
      }
    });

    // Registrar no histórico de logs
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Cadastrou documento: "${titulo}" (${status})`,
        table_name: 'documento_informativo',
        record_id: null,
        unit_id: req.user.unitId ? BigInt(req.user.unitId) : null,
        details: { docId: doc.id }
      }
    });

    res.status(201).json(serializeDoc(doc));
  } catch (error) {
    console.error('Erro ao cadastrar documento:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Erro interno ao cadastrar documento.' });
  }
});

// PUT /documents/:id - Atualizar documento informativo (Apenas Administrador Autenticado)
router.put('/:id', requireAuth, upload.single('arquivo'), async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, categoria, orgao_emissor, status: targetStatus } = req.body;

  try {
    const existing = await prisma.documentoInformativo.findUnique({
      where: { id }
    });

    if (!existing) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    const data = {
      titulo: titulo || existing.titulo,
      descricao: descricao || existing.descricao,
      categoria: categoria || existing.categoria,
      orgao_emissor: orgao_emissor || existing.orgao_emissor
    };

    // Atualizar arquivo se fornecido
    if (req.file) {
      data.caminho_arquivo = `/uploads/${req.file.filename}`;
      data.formato_extensao = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'bin';
      data.tamanho_bytes = BigInt(req.file.size);

      // Excluir arquivo antigo
      const oldPath = path.join(process.cwd(), existing.caminho_arquivo.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Erro ao excluir arquivo antigo:', e);
        }
      }
    }

    // Regra de Status:
    // Se o documento estava como Rascunho e o admin clicar em "Publicar" (targetStatus === 'Publicado')
    // Se o documento já estava Publicado, pode mudar para Rascunho ou manter Publicado
    if (targetStatus && targetStatus !== existing.status) {
      data.status = targetStatus;
      if (targetStatus === 'Publicado') {
        data.data_publicacao = new Date();
      } else {
        data.data_publicacao = null;
      }
    }

    const updated = await prisma.documentoInformativo.update({
      where: { id },
      data
    });

    // Registrar no histórico de logs
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Atualizou documento: "${updated.titulo}" (${updated.status})`,
        table_name: 'documento_informativo',
        record_id: null,
        unit_id: req.user.unitId ? BigInt(req.user.unitId) : null,
        details: { docId: id }
      }
    });

    res.json(serializeDoc(updated));
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Erro interno ao atualizar documento.' });
  }
});

// DELETE /documents/:id - Excluir documento informativo (Apenas Administrador Autenticado)
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.documentoInformativo.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    // Excluir arquivo físico
    const filePath = path.join(process.cwd(), existing.caminho_arquivo.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Erro ao excluir arquivo físico:', e);
      }
    }

    await prisma.documentoInformativo.delete({
      where: { id }
    });

    // Registrar no histórico de logs
    await prisma.history.create({
      data: {
        user_id: BigInt(req.user.id),
        action: `Excluiu documento: "${existing.titulo}"`,
        table_name: 'documento_informativo',
        record_id: null,
        unit_id: req.user.unitId ? BigInt(req.user.unitId) : null,
        details: { docId: id }
      }
    });

    res.json({ message: 'Documento excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ error: 'Erro ao excluir documento.' });
  }
});

// GET /documents/:id/view - Incrementar visualização e redirecionar/enviar arquivo
router.get('/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await prisma.documentoInformativo.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    // Incrementar contador de visualizações
    await prisma.documentoInformativo.update({
      where: { id },
      data: {
        contador_visualizacoes: { increment: 1 }
      }
    });

    res.redirect(doc.caminho_arquivo);
  } catch (error) {
    console.error('Erro ao visualizar documento:', error);
    res.status(500).json({ error: 'Erro ao acessar o documento.' });
  }
});

// GET /documents/:id/download - Incrementar downloads e realizar download
router.get('/:id/download', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await prisma.documentoInformativo.findUnique({
      where: { id }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    // Incrementar contador de downloads
    await prisma.documentoInformativo.update({
      where: { id },
      data: {
        contador_downloads: { increment: 1 }
      }
    });

    const filePath = path.join(process.cwd(), doc.caminho_arquivo.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      res.download(filePath, `${doc.titulo}.${doc.formato_extensao}`);
    } else {
      res.redirect(doc.caminho_arquivo);
    }
  } catch (error) {
    console.error('Erro ao fazer download do documento:', error);
    res.status(500).json({ error: 'Erro ao fazer download do documento.' });
  }
});

export default router;
