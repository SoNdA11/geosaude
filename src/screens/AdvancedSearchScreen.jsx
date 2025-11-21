import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const AdvancedSearchScreen = ({ units, setSelectedUnit, setView }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [advFilters, setAdvFilters] = useState({ name: '', type: '', specialty: '', bairro: '' });

  const filtered = units.filter(u => {
      return u.name.toLowerCase().includes(advFilters.name.toLowerCase()) &&
             (advFilters.type === '' || u.type === advFilters.type) &&
             u.bairro.toLowerCase().includes(advFilters.bairro.toLowerCase());
  });

  const paginated = filtered.slice((page-1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Filtros */}
      <div className="w-full md:w-80 bg-white p-6 border-r">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2"><Filter size={20}/> Filtros</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Unidade</label>
              <input value={advFilters.name} onChange={e => setAdvFilters({...advFilters, name: e.target.value})} className="w-full border rounded p-2" />
            </div>
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
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <input value={advFilters.bairro} onChange={e => setAdvFilters({...advFilters, bairro: e.target.value})} className="w-full border rounded p-2" />
            </div>
          </div>
          <button onClick={() => setAdvFilters({ name: '', type: '', specialty: '', bairro: '' })} className="mt-6 text-sm text-red-500 underline">Limpar Filtros</button>
      </div>

      {/* Lista */}
      <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {paginated.map(u => (
              <div key={u.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-emerald-800">{u.name}</h3>
                  <p className="text-sm text-gray-600">{u.type} • {u.bairro}</p>
                </div>
                <button onClick={() => { setSelectedUnit(u); setView('details'); }} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-sm font-medium">
                   Detalhes
                </button>
              </div>
            ))}
          </div>
          
          {filtered.length > itemsPerPage && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1">Página {page}</span>
              <button disabled={page * itemsPerPage >= filtered.length} onClick={() => setPage(page+1)} className="px-3 py-1 border rounded disabled:opacity-50">Próxima</button>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdvancedSearchScreen;