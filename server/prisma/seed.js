import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados (modo não destrutivo)...');

  // Criptografando senhas mockadas
  const hashedPasswordAdmin = await bcrypt.hash('@admin@', 10);
  const hashedPasswordMarcos = await bcrypt.hash('@marcosnunes@', 10);

  // 1. Criar Unidades de Saúde (se não existirem)
  const unitsToSeed = [
    {
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
      federativeEntity: "Municipal",
    },
    {
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
      federativeEntity: "Municipal",
    },
    {
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
      federativeEntity: "Estadual",
    }
  ];

  for (const unitData of unitsToSeed) {
    const existing = await prisma.unidades.findUnique({ where: { id: unitData.id } });
    if (!existing) {
      await prisma.unidades.create({ data: unitData });
      console.log(`Unidade '${unitData.name}' semeada.`);
    } else {
      await prisma.unidades.update({
        where: { id: unitData.id },
        data: { federativeEntity: unitData.federativeEntity }
      });
      console.log(`Unidade '${unitData.name}' atualizada com a esfera '${unitData.federativeEntity}'.`);
    }
  }

  // 2. Criar Médicos
  const doctorsToSeed = [
    {
      id: 1n,
      unit_id: 1n,
      name: "Dr. Silva",
      specialty: "Clínica Geral",
      crm: "CRM-RN 1234"
    },
    {
      id: 2n,
      unit_id: 1n,
      name: "Enf. Maria",
      specialty: "Enfermagem",
      crm: "COREN-RN 5678"
    },
    {
      id: 3n,
      unit_id: 2n,
      name: "Téc. João",
      specialty: "Radiologia",
      crm: "CRTR-RN 9012"
    },
    {
      id: 4n,
      unit_id: 3n,
      name: "Dr. Pedro",
      specialty: "Cirurgia",
      crm: "CRM-RN 3456"
    }
  ];

  for (const docData of doctorsToSeed) {
    const existing = await prisma.doctors.findUnique({ where: { id: docData.id } });
    if (!existing) {
      await prisma.doctors.create({ data: docData });
      console.log(`Médico '${docData.name}' semeado.`);
    }
  }

  // 3. Criar Serviços associados aos Médicos
  const servicesToSeed = [
    {
      unit_id: 1n,
      name: "Consulta Geral",
      specialty: "Clínica Geral",
      doctor_id: 1n,
      description: "Consulta de rotina.",
      hours: "Seg-Sex 08:00-12:00"
    },
    {
      unit_id: 1n,
      name: "Curativos",
      specialty: "Enfermagem",
      doctor_id: 2n,
      description: "Troca de curativos.",
      hours: "Seg-Sex 07:00-11:00"
    },
    {
      unit_id: 2n,
      name: "Raio-X",
      specialty: "Radiologia",
      doctor_id: 3n,
      description: "Raio-X de emergência.",
      hours: "24h"
    },
    {
      unit_id: 3n,
      name: "Cirurgia Geral",
      specialty: "Cirurgia",
      doctor_id: 4n,
      description: "Cirurgias de emergência.",
      hours: "24h"
    }
  ];

  for (const srvData of servicesToSeed) {
    const existing = await prisma.services.findFirst({
      where: { unit_id: srvData.unit_id, name: srvData.name }
    });
    if (!existing) {
      await prisma.services.create({ data: srvData });
      console.log(`Serviço '${srvData.name}' semeado.`);
    }
  }

  // 4. Criar Notícias (com prazo de expiração no futuro, ex: +7 dias)
  const futDate = new Date();
  futDate.setDate(futDate.getDate() + 7);

  const existingNews = await prisma.news.findFirst({
    where: { unit_id: 1n, title: "Campanha de Vacinação" }
  });
  if (!existingNews) {
    await prisma.news.create({
      data: {
        unit_id: 1n,
        title: "Campanha de Vacinação",
        date: "27/11/2025",
        content: "Início da campanha contra a gripe para idosos.",
        expires_at: futDate
      }
    });
    console.log("Notícia de vacinação semeada.");
  }

  // 5. Criar Perfis (Usuários/Administradores)
  const profilesToSeed = [
    {
      id: 1n,
      email: "admin@admin.com",
      password: hashedPasswordAdmin,
      role: "system_admin",
      name: "Administrador Geral"
    },
    {
      id: 2n,
      email: "MarcosNunes@gmail.com",
      password: hashedPasswordMarcos,
      role: "unit_admin",
      name: "Marcos Nunes",
      unit_id: 1n
    }
  ];

  for (const profData of profilesToSeed) {
    const existing = await prisma.profiles.findUnique({ where: { id: profData.id } });
    if (!existing) {
      await prisma.profiles.create({ data: profData });
      console.log(`Perfil '${profData.name}' semeado.`);
    }
  }

  // 6. Criar Histórico de Logs
  const historyToSeed = [
    {
      id: 1n,
      user_id: 2n,
      action: "Editou horário da UBS Centro",
      table_name: "unidades",
      record_id: 1n,
      unit_id: 1n,
      timestamp: new Date("2025-11-20T10:00:00Z"),
      details: { field: "hours", newValue: "07:00 - 17:00" }
    },
    {
      id: 2n,
      user_id: 1n,
      action: "Cadastrou nova UPA",
      table_name: "unidades",
      record_id: 2n,
      unit_id: 2n,
      timestamp: new Date("2025-07-08T14:30:00Z"),
      details: { name: "UPA do Alto de São Manoel" }
    }
  ];

  for (const histData of historyToSeed) {
    const existing = await prisma.history.findUnique({ where: { id: histData.id } });
    if (!existing) {
      await prisma.history.create({ data: histData });
      console.log(`Log ID ${histData.id} semeado.`);
    }
  }

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
