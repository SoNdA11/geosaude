import React, { useState } from 'react';
import { MapPin, Search, Activity, ChevronRight, Info, FileText, Newspaper, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from '../utils/toast';

const HomeScreen = ({ setView, onSearchUbs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [closestUbs, setClosestUbs] = useState(null);
  const [distance, setDistance] = useState(0);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Digite um Bairro ou CEP para pesquisar.');
      return;
    }
    try {
      setSearching(true);
      const res = await onSearchUbs(searchQuery);
      if (res && !res.success) {
        if (res.closest) {
          setClosestUbs(res.closest);
          setDistance(res.distanceKm);
          setModalOpen(true);
        } else {
          toast.error('Nenhuma UBS encontrada para a localidade informada.');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao buscar unidade.');
    } finally {
      setSearching(false);
    }
  };

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
            <p className="text-emerald-100/80 text-lg md:text-xl mb-6 font-light leading-relaxed max-w-2xl">
              Encontre rapidamente Unidades Básicas de Saúde, UPAs e Hospitais em Mossoró. 
              Informações confiáveis para cuidar de quem você ama.
            </p>

            {/* Campo de Busca de UBS por Bairro/CEP */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-xl mb-10 shadow-lg mx-auto md:mx-0">
              <input
                type="text"
                placeholder="Digite seu Bairro ou CEP para achar sua UBS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={searching}
                className="flex-1 bg-transparent text-white placeholder:text-emerald-200/60 outline-none px-4 py-3 text-sm focus:ring-0 border-0"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
              >
                <Search size={16} /> 
                {searching ? 'Buscando...' : 'Descobrir UBS'}
              </button>
            </div>
            
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            
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

            <div 
              onClick={() => setView('documents_portal')} 
              className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-purple-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                  Documentos Oficiais
                  <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Acesse campanhas de vacinação, guias do cidadão, decretos oficiais, listas de medicamentos e boletins de saúde.
                </p>
              </div>
            </div>

            <a 
              href="https://prefeiturademossoro.com.br/categoria/saude"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-teal-100 transition-all duration-300 cursor-pointer relative overflow-hidden block"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Newspaper size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                  Notícias da Saúde
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Confira as últimas notícias, informativos e comunicados de saúde pública direto do portal da Prefeitura de Mossoró.
                </p>
              </div>
            </a>

          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
          <p>© 2025 Prefeitura Municipal de Mossoró</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Termos de Uso</span>
            <span className="hover:text-emerald-600 cursor-pointer transition-colors">Privacidade</span>
            <span 
              onClick={() => setView('about_project')}
              className="hover:text-emerald-600 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Info size={12} /> Sobre o Projeto
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Contingência */}
      {modalOpen && closestUbs && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-6 animate-fade-in space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg text-gray-800">UBS Não Encontrada</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Não encontramos nenhuma UBS cadastrada no Bairro/CEP <strong>"{searchQuery}"</strong>. Deseja visualizar a unidade mais próxima?
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase">UBS Mais Próxima</span>
              <span className="text-sm font-bold text-gray-800">{closestUbs.name}</span>
              <span className="text-xs text-gray-500">{closestUbs.bairro} • a {distance} km</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  onSearchUbs(closestUbs.name); 
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-150 transition-all active:scale-95"
              >
                Ver no Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;