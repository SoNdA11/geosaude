import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const AdvancedSearchScreen = ({ units = [], setSelectedUnit, setView }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [advFilters, setAdvFilters] = useState({ 
    name: '', 
    type: '', 
    bairro: '',
    cep: '',          
    specialty: '',
    federativeEntity: '',
    serviceName: '',
    urgency: false,   
    open24h: false    
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
             hasSpecialty &&
             hasService;
  });

  const paginated = filtered.slice((page-1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Filtros */}
      <div className="w-full md:w-80 bg-white p-6 border-r h-full md:min-h-[calc(100vh-64px)] overflow-y-auto">
         <h2 className="font-bold text-xl mb-6 flex items-center gap-2"><Filter size={20}/> Filtros</h2>
         
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">Nome da Unidade</label>
             <input value={advFilters.name} onChange={e => setAdvFilters({...advFilters, name: e.target.value})} className="w-full border rounded p-2" placeholder="Ex: UBS Centro"/>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <div>
               <label className="block text-sm font-medium text-gray-700">Tipo</label>
               <select value={advFilters.type} onChange={e => setAdvFilters({...advFilters, type: e.target.value})} className="w-full border rounded p-2">
                 <option value="">Todos</option>
                 <option value="UBS">UBS</option>
                 <option value="UPA">UPA</option>
                 <option value="Hospital">Hospital</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Ente Federativo</label>
               <select value={advFilters.federativeEntity} onChange={e => setAdvFilters({...advFilters, federativeEntity: e.target.value})} className="w-full border rounded p-2">
                 <option value="">Todos</option>
                 <option value="Municipal">Municipal</option>
                 <option value="Estadual">Estadual</option>
                 <option value="Federal">Federal</option>
               </select>
             </div>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">Serviço (Nome)</label>
             <input value={advFilters.serviceName} onChange={e => setAdvFilters({...advFilters, serviceName: e.target.value})} className="w-full border rounded p-2" placeholder="Ex: Vacinação, Curativo"/>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">Especialidade</label>
             <input value={advFilters.specialty} onChange={e => setAdvFilters({...advFilters, specialty: e.target.value})} className="w-full border rounded p-2" placeholder="Ex: Pediatria"/>
           </div>

           <div className="grid grid-cols-2 gap-2">
             <div>
                <label className="block text-sm font-medium text-gray-700">Bairro</label>
                <input value={advFilters.bairro} onChange={e => setAdvFilters({...advFilters, bairro: e.target.value})} className="w-full border rounded p-2" placeholder="Ex: Centro"/>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input value={advFilters.cep} onChange={e => setAdvFilters({...advFilters, cep: e.target.value})} className="w-full border rounded p-2" placeholder="00000-000"/>
             </div>
           </div>

           <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={advFilters.urgency} 
                  onChange={() => setAdvFilters({...advFilters, urgency: !advFilters.urgency})}
                  className="rounded text-emerald-600 mr-2"
                />
                Urgência e Emergência
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={advFilters.open24h} 
                  onChange={() => setAdvFilters({...advFilters, open24h: !advFilters.open24h})}
                  className="rounded text-emerald-600 mr-2"
                />
                Aberto 24 Horas
              </label>
           </div>
         </div>
         <button 
            onClick={() => setAdvFilters({ name: '', type: '', specialty: '', bairro: '', cep: '', federativeEntity: '', serviceName: '', urgency: false, open24h: false })} 
            className="mt-6 text-sm text-red-500 underline w-full text-center hover:text-red-700"
         >
            Limpar Todos os Filtros
         </button>
      </div>

      {/* Lista */}
      <div className="flex-1 p-6 overflow-y-auto">
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">{filtered.length} Unidades encontradas</h3>
         </div>

         <div className="grid grid-cols-1 gap-4">
           {paginated.map(u => {
             if (!u) return null;
             
             return (
               <div key={u.id || Math.random()} className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md transition-shadow">
                 <div>
                   <h3 className="font-bold text-emerald-800">{u.name || 'Sem nome'}</h3>
                   <p className="text-sm text-gray-600">
                     {u.type || 'Tipo n/a'} • {u.bairro || 'Bairro n/a'} 
                     {u.federativeEntity && <span className="text-gray-400 text-xs ml-1">({u.federativeEntity})</span>}
                   </p>
                   <div className="flex gap-2 mt-1">
                      {u.urgency && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Urgência</span>}
                      {u.open24h && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">24h</span>}
                   </div>
                 </div>
                 <button onClick={() => { setSelectedUnit(u); setView('details'); }} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-sm font-medium">
                    Detalhes
                 </button>
               </div>
             );
           })}
           {paginated.length === 0 && (
             <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <Filter size={48} className="text-gray-300 mb-2" />
                <p>Nenhuma unidade corresponde aos filtros selecionados.</p>
                <button onClick={() => setAdvFilters({ name: '', type: '', specialty: '', bairro: '', cep: '', federativeEntity: '', serviceName: '', urgency: false, open24h: false })} className="text-emerald-600 text-sm mt-2 hover:underline">
                  Limpar filtros
                </button>
             </div>
           )}
         </div>
         
         {filtered.length > itemsPerPage && (
           <div className="flex justify-center gap-2 mt-6">
             <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">Anterior</button>
             <span className="px-3 py-1 text-gray-600">Página {page}</span>
             <button disabled={page * itemsPerPage >= filtered.length} onClick={() => setPage(page+1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">Próxima</button>
           </div>
         )}
      </div>
    </div>
  );
};

export default AdvancedSearchScreen;