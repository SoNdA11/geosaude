// --- CONFIGURAÇÕES E CHAVES ---
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// --- MOCK DATA (Dados Simulados) ---
export const MOCK_UNITS = [
  {
    id: 1,
    name: "UBS Centro Clínico - Dr. José Leão",
    type: "UBS",
    federativeEntity: "Municipal", 
    bairro: "Centro",
    cep: "59600-000",
    rua: "Rua Dr. João Marcelino",
    lat: -5.1878,
    lng: -37.3442,
    phone: "(84) 3315-0000",
    hours: "07:00 - 17:00",
    target: "Moradores do Centro",
    urgency: false,
    open24h: false,
    adminId: 2,
    news: [
      { id: 1, title: "Campanha de Vacinação", date: "20/10/2023", content: "Início da campanha contra a gripe para idosos." }
    ],
    services: [
      { id: 1, name: "Consulta Geral", specialty: "Clínica Geral", doctor: "Dr. Silva", description: "Consulta de rotina.", hours: "Seg-Sex 08:00-12:00" },
      { id: 2, name: "Curativos", specialty: "Enfermagem", doctor: "Enf. Maria", description: "Troca de curativos.", hours: "Seg-Sex 07:00-11:00" }
    ],
    doctors: [
      { id: 1, name: "Dr. Silva", crm: "1234-RN", specialty: "Clínica Geral" }
    ],
    reviews: [
      { id: 1, title: "Ótimo atendimento", content: "Médicos atenciosos.", date: "15/10/2023" }
    ]
  },
  {
    id: 2,
    name: "UPA do Alto de São Manoel",
    type: "UPA",
    federativeEntity: "Municipal", 
    bairro: "Alto de São Manoel",
    cep: "59620-000",
    rua: "Av. Presidente Dutra",
    lat: -5.1950,
    lng: -37.3250,
    phone: "(84) 3316-9999",
    hours: "24 Horas",
    target: "Público Geral (Urgência)",
    urgency: true,
    open24h: true,
    adminId: 99,
    news: [],
    services: [
      { id: 1, name: "Raio-X", specialty: "Radiologia", doctor: "Téc. João", description: "Raio-X de emergência.", hours: "24h" }
    ],
    doctors: [],
    reviews: []
  },
  {
    id: 3,
    name: "Hospital Regional Tarcísio Maia",
    type: "Hospital",
    federativeEntity: "Estadual", 
    bairro: "Aeroporto",
    cep: "59607-000",
    rua: "Rua Projetada",
    lat: -5.1800,
    lng: -37.3600,
    phone: "(84) 3315-5555",
    hours: "24 Horas",
    target: "Alta Complexidade",
    urgency: true,
    open24h: true,
    adminId: 99,
    news: [],
    services: [
      { id: 1, name: "Cirurgia Geral", specialty: "Cirurgia", doctor: "Dr. Pedro", description: "Cirurgias de emergência.", hours: "24h" }
    ],
    doctors: [],
    reviews: []
  }
];

export const MOCK_USERS = [
  { id: 1, email: "admin@admin.com", password: "@admin@", role: "system_admin", name: "Administrador Geral" },
  { id: 2, email: "MarcosNunes@gmail.com", password: "@marcosnunes@", role: "unit_admin", name: "Marcos Nunes", unitId: 1 }
];

export const MOCK_HISTORY = [
  { id: 1, user: "Marcos Nunes", date: "20/11/2023 10:00", action: "Editou horário da UBS Centro", unit: "UBS Centro Clínico" },
  { id: 2, user: "Admin Geral", date: "19/11/2023 14:30", action: "Cadastrou nova UPA", unit: "UPA Belo Horizonte" }
];