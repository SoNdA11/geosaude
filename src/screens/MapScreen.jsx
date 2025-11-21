import React, { useState } from 'react';
import { Search, List, Map as MapIcon, Filter, Activity, MapPin } from 'lucide-react';
import GoogleMap from '../components/Map/GoogleMap';
import Modal from '../components/Utils/Modal';

const MapScreen = ({ units, setSelectedUnit, setView }) => {
  const [mapViewMode, setMapViewMode] = useState('map'); // map, list
  const [showMapFiltersMobile, setShowMapFiltersMobile] = useState(false);
  const [mapFilters, setMapFilters] = useState({ types: [], urgency: false, open24h: false, searchTerm: '' });

  const toggleMapFilterType = (type) => {
    setMapFilters(prev => {
      const types = prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  };

  const filteredUnitsList = units.filter(u => {
    const matchesType = mapFilters.types.length === 0 || mapFilters.types.includes(u.type);
    const matchesUrgency = !mapFilters.urgency || u.urgency;
    const matches24h = !mapFilters.open24h || u.open24h;
    const matchesSearch = u.name.toLowerCase().includes(mapFilters.searchTerm.toLowerCase()) || u.bairro.toLowerCase().includes(mapFilters.searchTerm.toLowerCase());
    return matchesType && matchesUrgency && matches24h && matchesSearch;
  });

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1 block">Pesquisar</label>
        <input 
          type="text" 
          placeholder="Nome ou Bairro..." 
          className="w-full border rounded p-2 text-sm"
          value={mapFilters.searchTerm}
          onChange={(e) => setMapFilters({...mapFilters, searchTerm: e.target.value})}
        />
      </div>
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1 block">Tipo de Unidade</label>
        <div className="flex flex-wrap gap-2">
          {['UBS', 'Hospital', 'UPA'].map(type => (
            <label key={type} className="flex items-center gap-1 text-sm cursor-pointer bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">
              <input 
                type="checkbox" 
                checked={mapFilters.types.includes(type)}
                onChange={() => toggleMapFilterType(type)}
                className="rounded text-emerald-600"
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={mapFilters.urgency} 
            onChange={() => setMapFilters({...mapFilters, urgency: !mapFilters.urgency})}
          /> Urgência/Emergência
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={mapFilters.open24h} 
            onChange={() => setMapFilters({...mapFilters, open24h: !mapFilters.open24h})}
          /> Aberto 24h
        </label>
      </div>
      <button 
        onClick={() => setMapViewMode(mapViewMode === 'map' ? 'list' : 'map')}
        className="w-full mt-4 bg-emerald-600 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-emerald-700"
      >
        {mapViewMode === 'map' ? <List size={16}/> : <MapIcon size={16}/>}
        {mapViewMode === 'map' ? 'Exibição em Lista' : 'Exibição no Mapa'}
      </button>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 shadow-md z-10">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800 mb-2">Filtros Rápidos</h2>
          <FilterContent />
        </div>
        {mapViewMode === 'list' && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredUnitsList.map(u => (
              <div key={u.id} onClick={() => { setSelectedUnit(u); setView('details'); }} className="p-3 border rounded hover:bg-emerald-50 cursor-pointer transition-colors">
                <h4 className="font-bold text-emerald-700">{u.name}</h4>
                <p className="text-xs text-gray-600">{u.bairro} • {u.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Área Principal (Mapa ou Lista Mobile) */}
      <div className="flex-1 relative">
        {mapViewMode === 'map' ? (
          <GoogleMap 
            units={units} 
            filters={mapFilters}
            onMarkerClick={(u) => { setSelectedUnit(u); setView('details'); }}
          />
        ) : (
          <div className="p-4 overflow-y-auto h-full bg-gray-100">
            <h2 className="text-lg font-bold mb-4 md:hidden">Lista de Unidades</h2>
            <div className="grid gap-4 md:hidden">
              {filteredUnitsList.map(u => (
                <div key={u.id} onClick={() => { setSelectedUnit(u); setView('details'); }} className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
                  <h4 className="font-bold text-emerald-700">{u.name}</h4>
                  <span className="inline-block bg-gray-200 rounded px-2 py-0.5 text-xs mt-1">{u.type}</span>
                  <p className="text-sm text-gray-600 mt-1">{u.bairro}</p>
                </div>
              ))}
            </div>
            <div className="hidden md:flex h-full items-center justify-center text-gray-400">
                Selecione uma unidade na lista lateral.
            </div>
          </div>
        )}

        {/* Mobile UI Overlays */}
        <div className="md:hidden absolute top-4 right-4 z-20">
          <button onClick={() => setShowMapFiltersMobile(true)} className="bg-white p-3 rounded-full shadow-lg text-gray-700">
            <Search size={24} />
          </button>
        </div>
        
        <div className="md:hidden absolute top-4 left-4 z-20">
           <button 
            onClick={() => setMapViewMode(mapViewMode === 'map' ? 'list' : 'map')}
            className="bg-white p-3 rounded-full shadow-lg text-gray-700"
          >
            {mapViewMode === 'map' ? <List size={24}/> : <MapIcon size={24}/>}
          </button>
        </div>

        {/* Modal Filtros Mobile */}
        <Modal isOpen={showMapFiltersMobile} onClose={() => setShowMapFiltersMobile(false)} title="Filtros">
          <FilterContent />
        </Modal>

        {/* Bottom Nav Mobile */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-30">
          <button className="flex flex-col items-center text-gray-400 opacity-50">
            <Activity size={20} />
            <span className="text-xs">Triagem</span>
          </button>
          <button onClick={() => setView('map')} className="flex flex-col items-center text-emerald-600">
            <MapPin size={20} />
            <span className="text-xs">Mapa</span>
          </button>
          <button onClick={() => setView('advanced_search')} className="flex flex-col items-center text-gray-600">
            <Search size={20} />
            <span className="text-xs">Pesquisa</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;