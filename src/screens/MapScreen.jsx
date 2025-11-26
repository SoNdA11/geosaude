import React, { useState, useEffect } from 'react';
import { Search, List, Map as MapIcon, Activity, MapPin, Filter, X } from 'lucide-react';
import GoogleMap from '../components/Map/GoogleMap';
import Modal from '../components/Utils/Modal';

const MapScreen = ({ units, setSelectedUnit, setView }) => {
  const [mapViewMode, setMapViewMode] = useState('map'); 
  const [showMapFiltersMobile, setShowMapFiltersMobile] = useState(false);
  
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [mapFilters, setMapFilters] = useState({ types: [], urgency: false, open24h: false, searchTerm: '' });
  const [filteredResults, setFilteredResults] = useState(units);

  useEffect(() => {
    const delayInput = setTimeout(() => {
      setMapFilters(prev => ({ ...prev, searchTerm: localSearchTerm }));
    }, 500); 
    return () => clearTimeout(delayInput); 
  }, [localSearchTerm]);

  const toggleMapFilterType = (type) => {
    setMapFilters(prev => {
      const types = prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type];
      return { ...prev, types };
    });
  };

  const toggleUrgency = () => setMapFilters(prev => ({ ...prev, urgency: !prev.urgency }));
  const toggleOpen24h = () => setMapFilters(prev => ({ ...prev, open24h: !prev.open24h }));

  useEffect(() => {
    const results = units.filter(u => {
      const matchesType = mapFilters.types.length === 0 || mapFilters.types.includes(u.type);
      const matchesUrgency = !mapFilters.urgency || u.urgency;
      const matches24h = !mapFilters.open24h || u.open24h;
      
      const searchLower = mapFilters.searchTerm.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const bairro = (u.bairro || '').toLowerCase();
      const matchesSearch = name.includes(searchLower) || bairro.includes(searchLower);
      
      return matchesType && matchesUrgency && matches24h && matchesSearch;
    });
    
    setFilteredResults(results);
  }, [mapFilters, units]);

  const filterJsx = (
    <div className="space-y-6">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="Buscar nome ou bairro..." 
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
          value={localSearchTerm} 
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          autoFocus 
        />
        <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
        {localSearchTerm !== mapFilters.searchTerm && (
           <div className="absolute right-4 top-4">
             <span className="flex h-2.5 w-2.5 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
             </span>
           </div>
        )}
      </div>

      <div>
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 block ml-1">Filtrar por Tipo</label>
        <div className="flex flex-wrap gap-2">
          {['UBS', 'Hospital', 'UPA'].map(type => {
            const isSelected = mapFilters.types.includes(type);
            return (
              <button 
                key={type}
                onClick={() => toggleMapFilterType(type)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border select-none ${
                  isSelected 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-dashed border-gray-200">
        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${mapFilters.urgency ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${mapFilters.urgency ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
             <span className={`text-sm font-medium ${mapFilters.urgency ? 'text-red-800' : 'text-gray-600'}`}>Urgência</span>
          </div>
          <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${mapFilters.urgency ? 'bg-red-500' : 'bg-gray-200'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${mapFilters.urgency ? 'translate-x-5' : ''}`}></div>
          </div>
          <input type="checkbox" checked={mapFilters.urgency} onChange={toggleUrgency} className="hidden" />
        </label>

        <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${mapFilters.open24h ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${mapFilters.open24h ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
             <span className={`text-sm font-medium ${mapFilters.open24h ? 'text-blue-800' : 'text-gray-600'}`}>Aberto 24h</span>
          </div>
          <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${mapFilters.open24h ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${mapFilters.open24h ? 'translate-x-5' : ''}`}></div>
          </div>
          <input type="checkbox" checked={mapFilters.open24h} onChange={toggleOpen24h} className="hidden" />
        </label>
      </div>

      <button 
        onClick={() => setMapViewMode(mapViewMode === 'map' ? 'list' : 'map')}
        className="w-full mt-4 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all font-bold md:hidden shadow-sm"
      >
        {mapViewMode === 'map' ? <List size={18}/> : <MapIcon size={18}/>}
        {mapViewMode === 'map' ? 'Ver Lista' : 'Ver Mapa'}
      </button>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
      <div className="hidden md:flex flex-col w-96 bg-white border-r border-gray-200 shadow-xl z-20 relative">
        <div className="p-6 border-b border-gray-100 bg-white z-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Filter size={20} />
            </div>
            <h2 className="font-bold text-xl text-gray-800">Filtros do Mapa</h2>
          </div>
          {filterJsx}
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 custom-scrollbar">
          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Resultados ({filteredResults.length})</p>
              </div>
              {filteredResults.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => { setSelectedUnit(u); setView('details'); }} 
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 cursor-pointer transition-all group"
                >
                  <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors text-sm mb-1">{u.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {/* CORREÇÃO DA COR DA TAG AQUI */}
                    <span className={`px-1.5 py-0.5 rounded font-medium ${u.type === 'Hospital' ? 'bg-purple-100 text-purple-700' : u.type === 'UPA' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.type}
                    </span>
                    <span className="truncate">• {u.bairro}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
              <Search size={40} className="mb-3 text-gray-300"/>
              <p className="text-sm font-medium text-gray-500">Nenhum local encontrado</p>
              <p className="text-xs text-gray-400 mt-1">Tente ajustar os filtros acima</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-gray-100">
        {mapViewMode === 'map' ? (
          <GoogleMap 
            units={filteredResults} 
            filters={mapFilters}
            onMarkerClick={(u) => { setSelectedUnit(u); setView('details'); }}
          />
        ) : (
          <div className="p-4 overflow-y-auto h-full bg-gray-50 md:hidden pb-20">
             <div className="space-y-3">
              {filteredResults.map(u => (
                <div key={u.id} onClick={() => { setSelectedUnit(u); setView('details'); }} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">{u.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    {/* CORREÇÃO DA COR DA TAG MOBILE AQUI */}
                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wide ${u.type === 'Hospital' ? 'bg-purple-50 text-purple-700' : u.type === 'UPA' ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {u.type}
                    </span>
                    <span className="text-sm text-gray-500">{u.bairro}</span>
                  </div>
                </div>
              ))}
             </div>
          </div>
        )}

        <div className="md:hidden absolute top-4 right-4 z-20">
          <button onClick={() => setShowMapFiltersMobile(true)} className="bg-white p-3.5 rounded-full shadow-lg shadow-emerald-900/10 text-emerald-700 border border-gray-100 active:scale-90 transition-transform">
            <Search size={24} strokeWidth={2.5} />
          </button>
        </div>

        <Modal isOpen={showMapFiltersMobile} onClose={() => setShowMapFiltersMobile(false)} title="Filtrar Mapa">
          {filterJsx}
        </Modal>
      </div>
    </div>
  );
};

export default MapScreen;