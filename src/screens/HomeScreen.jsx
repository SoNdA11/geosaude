import React from 'react';
import { MapPin, Search, Activity, ChevronRight, Info } from 'lucide-react';

const HomeScreen = ({ setView }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-white">
      
      <div className="bg-emerald-900 relative overflow-hidden text-white py-20 lg:py-28 px-6">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-emerald-800/30 -skew-x-12 transform translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full filter blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-700/50 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-100 text-xs font-medium tracking-wide">SERVIÇO PÚBLICO DE SAÚDE</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Saúde mais <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">próxima</span> de você.
            </h1>
            <p className="text-emerald-100/80 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-2xl">
              Encontre rapidamente Unidades Básicas de Saúde, UPAs e Hospitais em Mossoró. 
              Informações confiáveis para cuidar de quem você ama.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setView('map')}
                className="bg-white text-emerald-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <MapPin size={20} className="group-hover:text-emerald-600 transition-colors" />
                Explorar no Mapa
              </button>
              <button 
                onClick={() => setView('triage')} 
                className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-full font-medium text-lg hover:bg-emerald-800/60 transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2"
              >
                <Activity size={20} />
                Triagem Online
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center relative">
             <div className="w-80 h-80 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2.5rem] rotate-6 shadow-2xl shadow-emerald-900/50 flex items-center justify-center transform hover:rotate-3 transition-all duration-700 border-4 border-white/10">
                <MapPin className="text-white w-32 h-32 drop-shadow-lg" strokeWidth={1.5} />
             </div>
             <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce-slow">
                <Activity className="text-emerald-600 w-10 h-10" />
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">O que você precisa hoje?</h2>
            <p className="text-gray-500">Selecione uma das opções para começar seu atendimento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div 
              onClick={() => setView('map')}
              className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                  Mapa Interativo
                  <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Visualize a localização exata de todas as unidades. Use sua localização para encontrar o posto mais perto.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setView('advanced_search')}
              className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                  Busca Especializada
                  <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Filtre por especialidade (ex: Pediatria), tipo de serviço (ex: Vacinação) ou bairro específico.
                </p>
              </div>
            </div>

            <div 
              onClick={() => setView('triage')} 
              className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-700 transition-colors flex items-center gap-2">
                  Triagem Online
                  <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Avaliação inicial baseada no Protocolo de Manchester. Informe seus sintomas e veja o nível de prioridade do seu atendimento.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
          <p>© 2025 Prefeitura Municipal de Mossoró</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Termos de Uso</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors flex items-center gap-1">
              <Info size={12} /> Sobre o Projeto
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;