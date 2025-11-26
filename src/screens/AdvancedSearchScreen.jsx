import React, { useState } from 'react';
import { Filter, MapPin, Clock, AlertCircle, Search, X, ChevronDown } from 'lucide-react';

const AdvancedSearchScreen = ({ units = [], setSelectedUnit, setView }) => {
  const [advFilters, setAdvFilters] = useState({ 
    name: '', type: '', bairro: '', cep: '', specialty: '', 
    federativeEntity: '', serviceName: '', urgency: false, open24h: false 
  });

  const safeUnits = Array.isArray(units) ? units : [];

  const filtered = safeUnits.filter(u => {
      if (!u) return false;
      const filterName = (advFilters.name || '').toLowerCase();
      const filterBairro = (advFilters.bairro || '').toLowerCase();
      const filterCep = (advFilters.cep || '').replace(/\D/g, ''); 
      const unitCep = (u.cep || '').replace(/\D/g, ''); 
      const filterSpecialty = (advFilters.specialty || '').toLowerCase();
      const filterService = (advFilters.serviceName || '').toLowerCase();

      const hasService = filterService === '' || (u.services && u.services.some(s => s.name && s.name.toLowerCase().includes(filterService)));
      const hasSpecialty = filterSpecialty === '' || (u.services && u.services.some(s => s.specialty && s.specialty.toLowerCase().includes(filterSpecialty)));

      const uName = (u.name || '').toLowerCase();
      const uType = u.type || '';
      const uBairro = (u.bairro || '').toLowerCase();
      const uFederative = u.federativeEntity || '';

      return uName.includes(filterName) &&
             (advFilters.type === '' || uType === advFilters.type) &&
             (advFilters.federativeEntity === '' || uFederative === advFilters.federativeEntity) &&
             uBairro.includes(filterBairro) &&
             unitCep.includes(filterCep) &&
             (!advFilters.urgency || u.urgency) && 
             (!advFilters.open24h || u.open24h) && 
             hasSpecialty && hasService;
  });

  const clearFilters = () => {
    setAdvFilters({ name: '', type: '', bairro: '', cep: '', specialty: '', federativeEntity: '', serviceName: '', urgency: false, open24h: false });
  };

  const activeFiltersCount = Object.values(advFilters).filter(v => v === true || (typeof v === 'string' && v !== '')).length;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50/50 font-sans">
      
      <div className="w-full md:w-80 bg-white border-r border-gray-200/60 flex flex-col h-auto md:h-[calc(100vh-64px)] sticky top-[64px] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Filter size={20} className="text-emerald-600 fill-emerald-100"/> Filtros
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Refine sua busca</p>
            </div>
            
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters} 
                className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <X size={12} /> Limpar ({activeFiltersCount})
              </button>
            )}
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
           <div className="space-y-3">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
               <Search size={12} /> Palavras-chave
             </label>
             <input 
               value={advFilters.name} 
               onChange={e => setAdvFilters({...advFilters, name: e.target.value})} 
               className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-400" 
               placeholder="Nome da unidade..."
             />
             <input 
                value={advFilters.specialty} 
                onChange={e => setAdvFilters({...advFilters, specialty: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-400" 
                placeholder="Especialidade (ex: Pediatria)"
             />
             <input 
                value={advFilters.serviceName} 
                onChange={e => setAdvFilters({...advFilters, serviceName: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all outline-none placeholder:text-gray-400" 
                placeholder="Serviço (ex: Vacina)"
             />
           </div>

           <div className="space-y-3">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tipo de Unidade</label>
             <div className="space-y-2.5">
                <div className="relative">
                  <select 
                    value={advFilters.type} 
                    onChange={e => setAdvFilters({...advFilters, type: e.target.value})} 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:border-emerald-300 transition-colors text-gray-600"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="UBS">UBS (Unidade Básica)</option>
                    <option value="UPA">UPA (Pronto Atendimento)</option>
                    <option value="Hospital">Hospital</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                  <select 
                    value={advFilters.federativeEntity} 
                    onChange={e => setAdvFilters({...advFilters, federativeEntity: e.target.value})} 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 outline-none appearance-none cursor-pointer hover:border-emerald-300 transition-colors text-gray-600"
                  >
                    <option value="">Todas as Esferas</option>
                    <option value="Municipal">Municipal</option>
                    <option value="Estadual">Estadual</option>
                    <option value="Federal">Federal</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={16} />
                </div>
             </div>
           </div>

           <div className="space-y-3">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
               <MapPin size={12} /> Localização
             </label>
             <div className="flex gap-2">
               <input 
                 value={advFilters.bairro} 
                 onChange={e => setAdvFilters({...advFilters, bairro: e.target.value})} 
                 className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400" 
                 placeholder="Bairro"
               />
               <input 
                 value={advFilters.cep} 
                 onChange={e => setAdvFilters({...advFilters, cep: e.target.value})} 
                 className="w-1/3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400" 
                 placeholder="CEP"
               />
             </div>
           </div>

           <div className="pt-4 border-t border-dashed border-gray-200 space-y-3">
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all group ${advFilters.urgency ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${advFilters.urgency ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    <AlertCircle size={16} />
                  </div>
                  <span className={`text-sm font-medium ${advFilters.urgency ? 'text-red-800' : 'text-gray-600'}`}>Urgência</span>
                </div>
                <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${advFilters.urgency ? 'bg-red-500' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${advFilters.urgency ? 'translate-x-5' : ''}`}></div>
                </div>
                <input type="checkbox" checked={advFilters.urgency} onChange={() => setAdvFilters({...advFilters, urgency: !advFilters.urgency})} className="hidden" />
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all group ${advFilters.open24h ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${advFilters.open24h ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    <Clock size={16} />
                  </div>
                  <span className={`text-sm font-medium ${advFilters.open24h ? 'text-blue-800' : 'text-gray-600'}`}>Aberto 24h</span>
                </div>
                <div className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${advFilters.open24h ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${advFilters.open24h ? 'translate-x-5' : ''}`}></div>
                </div>
                <input type="checkbox" checked={advFilters.open24h} onChange={() => setAdvFilters({...advFilters, open24h: !advFilters.open24h})} className="hidden" />
              </label>
           </div>
         </div>
      </div>

      <div className="flex-1 p-6 md:p-10 bg-gray-50/50 overflow-y-auto">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">Resultados da Busca</h3>
            <p className="text-sm text-gray-500 mt-1">Exibindo {filtered.length} unidades encontradas</p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 pb-10">
           {filtered.map(u => {
             if (!u) return null;
             return (
               <div 
                 key={u.id || Math.random()} 
                 className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 flex flex-col h-full group overflow-hidden"
               >
                 <div className="p-6 flex-1">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${u.type === 'Hospital' ? 'bg-purple-50 text-purple-700 border-purple-100' : u.type === 'UPA' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {u.type}
                      </span>
                      {u.federativeEntity && <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{u.federativeEntity}</span>}
                   </div>
                   
                   <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors">{u.name || 'Sem nome'}</h3>
                   
                   <div className="flex items-start gap-2 text-gray-500 text-sm mb-5">
                     <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                     <span className="line-clamp-2 leading-relaxed">{u.bairro || 'Bairro não informado'}</span>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      {u.urgency && <span className="text-xs flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full font-medium"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Urgência</span>}
                      {u.open24h && <span className="text-xs flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium"><Clock size={12}/> 24 Horas</span>}
                   </div>
                 </div>

                 <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                   <button 
                      onClick={() => { setSelectedUnit(u); setView('details'); }} 
                      className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-sm shadow-sm active:scale-[0.98]"
                   >
                      Ver Informações
                   </button>
                 </div>
               </div>
             );
           })}
         </div>
         
         {filtered.length === 0 && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
                <div className="bg-white p-6 rounded-full shadow-sm border border-gray-100 mb-6">
                  <Search size={48} className="text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma unidade encontrada</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed mb-8">
                  Não encontramos resultados com os filtros atuais. Tente buscar por termos mais genéricos.
                </p>
                <button 
                  onClick={clearFilters} 
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                  Limpar todos os filtros
                </button>
             </div>
         )}
      </div>
    </div>
  );
};

export default AdvancedSearchScreen;