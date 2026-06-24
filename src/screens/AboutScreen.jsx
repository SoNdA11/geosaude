import React from 'react';
import { ArrowLeft, Mail, Instagram, BookOpen, Users, GraduationCap } from 'lucide-react';

const AboutScreen = ({ setView }) => {
  const developers = [
    {
      name: 'Eduardo Marinho',
      initials: 'EM',
      role: 'Desenvolvedor FullStack',
      description: 'Aluno da UERN',
      email: 'eduardo.marinho@uern.br',
      instagram: '@eduardomarinho',
      gradient: 'from-emerald-500 to-teal-400',
      image: '/midia_about_project/eduardo_marinho.jpg'
    },
    {
      name: 'Vinicius Eduardo',
      initials: 'VE',
      role: 'Desenvolvedor FullStack',
      description: 'Aluno da UERN',
      email: 'vinicius.eduardo@uern.br',
      instagram: '@viniciuseduardo',
      gradient: 'from-teal-500 to-emerald-400',
      image: '/midia_about_project/vinicius_eduardo.jpg'
    },
    {
      name: 'Paulo Sérgio',
      initials: 'PS',
      role: 'Desenvolvedor Backend',
      description: 'Aluno da UERN',
      email: 'paulo.sergio@uern.br',
      instagram: '@paulosergio',
      gradient: 'from-cyan-500 to-blue-400',
      image: '/midia_about_project/paulo_sergio.jpg'
    },
    {
      name: 'Luiz Henrique',
      initials: 'LH',
      role: 'Desenvolvedor Frontend',
      description: 'Aluno da UERN',
      email: 'luiz.henrique@uern.br',
      instagram: '@luizhenrique',
      gradient: 'from-emerald-600 to-green-400',
      image: '/midia_about_project/luiz_henrique.jpg'
    },
    {
      name: 'João Victor Amaral',
      initials: 'JV',
      role: 'Desenvolvedor Frontend',
      description: 'Aluno da UERN',
      email: 'joao.victor@uern.br',
      instagram: '@joaovictor',
      gradient: 'from-teal-600 to-cyan-400',
      image: '/midia_about_project/joao_victor_amaral.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header */}
      <div className="bg-emerald-900 text-white relative overflow-hidden py-16 px-6">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-emerald-800/30 -skew-x-12 transform translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <button
            onClick={() => setView('home')}
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white transition-colors mb-6 text-sm font-semibold bg-emerald-800/40 hover:bg-emerald-800/60 px-4 py-2 rounded-xl backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            Voltar para o Início
          </button>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Sobre o Projeto</h1>
          <p className="text-emerald-100/85 mt-2 text-base md:text-lg max-w-2xl font-light">
            Conheça o propósito do GeoSaúde Mossoró, os estudantes responsáveis pelo desenvolvimento e o corpo orientador acadêmico.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-16">
        
        {/* SEÇÃO 1: SOBRE O PROJETO */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-150 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Sobre o Projeto</h2>
          </div>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-5 text-gray-600 text-sm md:text-base leading-relaxed">
            <p>
              O GeoSaúde Mossoró é uma plataforma digital desenvolvida com o propósito de descentralizar e facilitar o acesso da população aos serviços públicos de saúde do município de Mossoró/RN. Por meio de um mapa interativo e busca inteligente, a plataforma consolida informações sobre Unidades Básicas de Saúde (UBSs), UPAs e hospitais, disponibilizando dados atualizados sobre corpo clínico, especialidades, horários de atendimento e documentos oficiais. O benefício entregue é a otimização da busca por atendimento médico, permitindo que os cidadãos identifiquem com rapidez a unidade mais próxima e adequada às suas necessidades, enquanto os gestores ganham um painel robusto para monitorar e atualizar os serviços públicos em tempo real.
            </p>
            <p>
              Esta iniciativa foi idealizada e desenvolvida originalmente no âmbito das disciplinas de Projeto Integrador I e II do curso de Ciência da Computação da Universidade do Estado do Rio Grande do Norte (UERN). Alinhado ao pilar de extensão universitária, o projeto visa conectar o conhecimento acadêmico às demandas da sociedade, transformando teorias da computação em uma aplicação prática de impacto real.
            </p>
            <p>
              O desenvolvimento é conduzido por estudantes do 7º período, sob a orientação do corpo docente das disciplinas e com o suporte técnico de um professor orientador da instituição.
            </p>
          </div>
        </section>

        {/* SEÇÃO 2: DESENVOLVEDORES */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-150 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Desenvolvedores</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((dev, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  {/* Imagem / Avatar */}
                  <div className="w-16 h-16 rounded-2xl shadow-md shadow-emerald-100/50 mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 bg-gray-100">
                    {/* Fallback container */}
                    <div className={`absolute inset-0 w-full h-full bg-gradient-to-tr ${dev.gradient} text-white flex items-center justify-center font-bold text-xl`}>
                      {dev.initials}
                    </div>
                    {/* Imagem principal */}
                    <img 
                      src={dev.image} 
                      alt={dev.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Nome e Cargo */}
                  <h3 className="font-bold text-gray-800 text-base">{dev.name}</h3>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">{dev.role}</span>
                  
                  {/* Descrição */}
                  <p className="text-gray-500 text-xs mt-3 leading-relaxed">{dev.description}</p>
                </div>

                {/* Contatos */}
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail size={14} className="text-gray-300" />
                    <span className="truncate hover:text-gray-600 cursor-pointer">{dev.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Instagram size={14} className="text-gray-300" />
                    <span className="hover:text-gray-600 cursor-pointer">{dev.instagram}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO 3: ORIENTADOR */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-150 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Orientador</h2>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 max-w-2xl mx-auto hover:shadow-md transition-shadow group">
            {/* Imagem / Avatar Orientador */}
            <div className="w-20 h-20 rounded-3xl shadow-lg shadow-indigo-100/50 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 bg-gray-100">
              {/* Fallback container */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-indigo-500 to-blue-400 text-white flex items-center justify-center font-bold text-2xl">
                FD
              </div>
              {/* Imagem principal */}
              <img 
                src="/midia_about_project/francisco_dantas.jpg" 
                alt="Francisco Dantas" 
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Francisco Dantas</h3>
                <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Orientador</span>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed">
                Atual co-reitor Universidade do Estado do Rio Grande do Norte. Participante do Núcleo de Engenharia de Software da UERN.
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Mail size={14} className="text-gray-300" />
                  <span className="hover:text-gray-600 cursor-pointer">franciscodantas@uern.br</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Instagram size={14} className="text-gray-300" />
                  <span className="hover:text-gray-600 cursor-pointer">@franciscodantas.uern</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutScreen;
