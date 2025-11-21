import React from 'react';
import { MapPin, Search, Activity, Lock } from 'lucide-react';
import Card from '../components/Utils/Card';

const HomeScreen = ({ setView, setShowLoginModal }) => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
      <Card 
        icon={MapPin} 
        title="Mapa da Saúde" 
        description="Encontre a unidade de saúde mais próxima e visualize no mapa interativo."
        onClick={() => setView('map')}
      />
      <Card 
        icon={Search} 
        title="Pesquisa Avançada" 
        description="Filtre por especialidades, serviços e bairros específicos."
        onClick={() => setView('advanced_search')}
      />
      <Card 
        icon={Activity} 
        title="Triagem Online" 
        description="Em Breve" 
        disabled={true}
      />
    </div>
    
    <button 
      onClick={() => setShowLoginModal(true)}
      className="mt-12 flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-900 transition-colors shadow-md"
    >
      <Lock size={14} />
      Área do Administrador
    </button>
  </div>
);

export default HomeScreen;