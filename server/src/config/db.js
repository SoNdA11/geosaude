import { PrismaClient } from '@prisma/client';

// Polyfill global para permitir que o Express serialize campos BigInt (int8 no PostgreSQL)
// como Numbers padrão ao retornar respostas JSON.
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function() {
    return Number(this);
  };
}

const prisma = new PrismaClient();

export default prisma;
