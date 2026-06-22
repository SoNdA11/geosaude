import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados...');

  // Limpando tabelas existentes para garantir um seed limpo
  await prisma.history.deleteMany();
  await prisma.profiles.deleteMany();
  await prisma.news.deleteMany();
  await prisma.services.deleteMany();
  await prisma.doctors.deleteMany();
  await prisma.unidades.deleteMany();

  console.log('Tabelas limpas com sucesso.');

  // Criptografando senhas mockadas
  const hashedPasswordAdmin = await bcrypt.hash('@admin@', 10);
  const hashedPasswordMarcos = await bcrypt.hash('@marcosnunes@', 10);

  // 1. Criar Unidades de Saúde
  const ubsCentro = await prisma.unidades.create({
    data: {
      id: 1n,
      name: "UBS Centro Clínico - Dr. José Leão",
      type: "UBS",
      bairro: "Belo Horizonte",
      cep: "59600-465",
      rua: "R. Joaquim Nabuco",
      lat: -5.203840,
      lng: -37.358223,
      phone: "(84) 3315-0000",
      hours: "07:00 - 17:00",
      target: "Moradores do Belo Horizonte",
      urgency: false,
      open24h: false,
    }
  });

  const upaAlto = await prisma.unidades.create({
    data: {
      id: 2n,
      name: "UPA do Alto de São Manoel",
      type: "UPA",
      bairro: "Alto de São Manoel",
      cep: "59631-170",
      rua: "R. Chico Pedro",
      lat: -5.210417,
      lng: -37.337189,
      phone: "(84) 3316-9999",
      hours: "24 Horas",
      target: "Público Geral (Urgência)",
      urgency: true,
      open24h: true,
    }
  });

  const hospitalTarcisio = await prisma.unidades.create({
    data: {
      id: 3n,
      name: "Hospital Regional Tarcísio Maia",
      type: "Hospital",
      bairro: "Aeroporto",
      cep: "59607-000",
      rua: "Rua Projetada",
      lat: -5.189774,
      lng: -37.364643,
      phone: "(84) 3315-3416",
      hours: "24 Horas",
      target: "Alta Complexidade",
      urgency: true,
      open24h: true,
    }
  });

  console.log('Unidades criadas.');

  // 2. Criar Médicos
  const drSilva = await prisma.doctors.create({
    data: {
      id: 1n,
      unit_id: ubsCentro.id,
      name: "Dr. Silva",
      specialty: "Clínica Geral",
      crm: "CRM-RN 1234"
    }
  });

  const enfMaria = await prisma.doctors.create({
    data: {
      id: 2n,
      unit_id: ubsCentro.id,
      name: "Enf. Maria",
      specialty: "Enfermagem",
      crm: "COREN-RN 5678"
    }
  });

  const tecJoao = await prisma.doctors.create({
    data: {
      id: 3n,
      unit_id: upaAlto.id,
      name: "Téc. João",
      specialty: "Radiologia",
      crm: "CRTR-RN 9012"
    }
  });

  const drPedro = await prisma.doctors.create({
    data: {
      id: 4n,
      unit_id: hospitalTarcisio.id,
      name: "Dr. Pedro",
      specialty: "Cirurgia",
      crm: "CRM-RN 3456"
    }
  });

  console.log('Médicos criados.');

  // 3. Criar Serviços associados aos Médicos
  await prisma.services.createMany({
    data: [
      {
        unit_id: ubsCentro.id,
        name: "Consulta Geral",
        specialty: "Clínica Geral",
        doctor_id: drSilva.id,
        description: "Consulta de rotina.",
        hours: "Seg-Sex 08:00-12:00"
      },
      {
        unit_id: ubsCentro.id,
        name: "Curativos",
        specialty: "Enfermagem",
        doctor_id: enfMaria.id,
        description: "Troca de curativos.",
        hours: "Seg-Sex 07:00-11:00"
      },
      {
        unit_id: upaAlto.id,
        name: "Raio-X",
        specialty: "Radiologia",
        doctor_id: tecJoao.id,
        description: "Raio-X de emergência.",
        hours: "24h"
      },
      {
        unit_id: hospitalTarcisio.id,
        name: "Cirurgia Geral",
        specialty: "Cirurgia",
        doctor_id: drPedro.id,
        description: "Cirurgias de emergência.",
        hours: "24h"
      }
    ]
  });

  // 4. Criar Notícias (com prazo de expiração no futuro, ex: +7 dias)
  const futDate = new Date();
  futDate.setDate(futDate.getDate() + 7);

  await prisma.news.create({
    data: {
      unit_id: ubsCentro.id,
      title: "Campanha de Vacinação",
      date: "27/11/2025",
      content: "Início da campanha contra a gripe para idosos.",
      expires_at: futDate
    }
  });

  console.log('Serviços, médicos e notícias iniciais inseridos.');

  // 2. Criar Perfis (Usuários/Administradores)
  const userAdmin = await prisma.profiles.create({
    data: {
      id: 1n,
      email: "admin@admin.com",
      password: hashedPasswordAdmin,
      role: "system_admin",
      name: "Administrador Geral"
    }
  });

  const userMarcos = await prisma.profiles.create({
    data: {
      id: 2n,
      email: "MarcosNunes@gmail.com",
      password: hashedPasswordMarcos,
      role: "unit_admin",
      name: "Marcos Nunes",
      unit_id: ubsCentro.id
    }
  });

  console.log('Perfis de usuários criados.');

  // 3. Criar Histórico de Logs
  await prisma.history.createMany({
    data: [
      {
        user_id: userMarcos.id,
        action: "Editou horário da UBS Centro",
        table_name: "unidades",
        record_id: ubsCentro.id,
        unit_id: ubsCentro.id,
        timestamp: new Date("2025-11-20T10:00:00Z"),
        details: { field: "hours", newValue: "07:00 - 17:00" }
      },
      {
        user_id: userAdmin.id,
        action: "Cadastrou nova UPA",
        table_name: "unidades",
        record_id: upaAlto.id,
        unit_id: upaAlto.id,
        timestamp: new Date("2025-07-08T14:30:00Z"),
        details: { name: "UPA do Alto de São Manoel" }
      }
    ]
  });

  console.log('Histórico de auditoria semeado.');

  // Sincronizar as sequências do PostgreSQL para evitar conflito de IDs únicos (P2002) no autoincrement
  console.log('Sincronizando sequences do banco de dados...');
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('unidades', 'id'), coalesce(max(id), 1), true) FROM unidades;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('doctors', 'id'), coalesce(max(id), 1), true) FROM doctors;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('services', 'id'), coalesce(max(id), 1), true) FROM services;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('news', 'id'), coalesce(max(id), 1), true) FROM news;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('profiles', 'id'), coalesce(max(id), 1), true) FROM profiles;`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('history', 'id'), coalesce(max(id), 1), true) FROM history;`);
  console.log('Sequences sincronizadas com sucesso!');

  console.log('Processo de seeding finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao semear banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
