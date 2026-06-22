import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Lock } from 'lucide-react';
import { api } from './utils/api';

// Importação das Telas
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import DetailsScreen from './screens/DetailsScreen';
import AdvancedSearchScreen from './screens/AdvancedSearchScreen';
import AdminUnitScreen from './screens/Admin/AdminUnitScreen';
import AdminSystemScreen from './screens/Admin/AdminSystemScreen';
import TriageScreen from './screens/TriageScreen';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  // Estados de Navegação e Dados Globais
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);

  const refreshUnits = async () => {
    try {
      const data = await api.getUnits();
      setUnits(data);
    } catch (err) {
      console.error('Erro ao carregar unidades:', err);
    }
  };

  useEffect(() => {
    // Restaurar sessão do localStorage
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    // Carregar unidades iniciais
    refreshUnits();
  }, []);

  // Guarda de Rotas de Administração
  useEffect(() => {
    const securedViews = ['admin_unit', 'admin_system'];
    if (securedViews.includes(view) && !user) {
      setView('login');
    }
  }, [view, user]);

  // --- 🔄 OPERAÇÃO: READ (Buscar dados do Supabase) ---
  const fetchUnits = async () => {
    try {
      setLoading(true);
      
      // Busca todas as unidades e traz junto os serviços e notícias de cada uma (INNER JOIN automático)
      const { data, error } = await supabase
        .from('unidades')
        .select('*, services(*), news(*)');

      if (error) throw error;

      // Ajuste leve para manter compatibilidade com a tela de detalhes que espera uma lista de 'doctors'
      const formattedData = data.map(unit => ({
        ...unit,
        services: unit.services || [],
        news: unit.news || [],
        // Gera a equipe médica dinamicamente com base nos médicos cadastrados nos serviços
        doctors: unit.services 
          ? unit.services.map(s => ({ id: s.id, name: s.doctor, specialty: s.specialty, crm: "CRM-RN" })).filter(d => d.name)
          : []
      }));

      setUnits(formattedData);
    } catch (error) {
      console.error("Erro ao buscar dados do Supabase:", error.message);
      alert("Não foi possível carregar os dados da saúde. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setView('home');
  };

  const renderNavbar = () => (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-opacity-90">
      <div className="w-full px-6 md:px-10">
        <div className="flex justify-between items-center h-16">
          
          <div 
            className="flex items-center gap-3 cursor-pointer group transition-all" 
            onClick={() => navigateTo('home')}
          >
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform duration-300">
              <MapPin className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                GeoSaúde
              </h1>
              <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">Mossoró</span>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-700 leading-tight">{user.name}</span>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {user.role === 'system_admin' ? 'Gestor do Sistema' : 'Gestor de Unidade'}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-gray-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50 active:scale-95 flex items-center gap-2 group"
                title="Sair do Sistema"
              >
                <span className="text-sm font-medium group-hover:text-red-500 hidden md:block">Sair</span>
                <LogOut size={20} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigateTo('login')}
              className="text-sm font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
            >
              <Lock size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              <span>Área do Gestor</span>
            </button>
          )}
        </div>
        <h1 className="text-lg md:text-xl font-bold tracking-wide">Geosaúde Mossoró</h1>
      </div>

      {/* Lado Direito Dinâmico */}
      {user ? (
        // Se estiver LOGADO, mostra o nome e o botão de Sair
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm font-medium">{user.name}</span>
          <button onClick={handleLogout} className="bg-emerald-700 p-2 rounded hover:bg-emerald-800 transition" title="Sair do Painel">
            <LogOut size={18} />
          </button>
        </div>
      ) : (
        // Se NÃO estiver logado, mostra o botão de acesso administrativo no topo
        <button 
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-1.5 bg-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-emerald-800 transition shadow-sm border border-emerald-500/30"
        >
          <Lock size={12} />
          Área do Admin
        </button>
      )}
    </div>
  );

  // Tela de carregamento elegante enquanto o Supabase responde
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-emerald-600 animate-spin" size={48} />
        <p className="text-gray-600 font-medium animate-pulse">Conectando ao banco de dados do Geosaúde...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800">
      {view !== 'admin_unit' && view !== 'admin_system' && renderNavbar()}

      <div className="animate-fade-in">
        {view === 'home' && <HomeScreen setView={navigateTo} />}
        
        {view === 'map' && (
          <MapScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
          />
        )}
        
        {view === 'details' && (
          <DetailsScreen 
            selectedUnit={selectedUnit} 
            setView={navigateTo} 
            user={user} 
            previousView={previousView}
          />
        )}
        
        {view === 'advanced_search' && (
          <AdvancedSearchScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
          />
        )}

        {view === 'triage' && (
          <TriageScreen 
            setView={navigateTo} 
            setSelectedUnit={setSelectedUnit}
            units={units}
          />
        )}

        {view === 'login' && (
          <LoginScreen 
            setView={navigateTo}
            onLogin={async (email, password) => {
              const data = await api.login(email, password);
              setUser(data.user);
              await refreshUnits();
              if (data.user.role === 'system_admin') {
                navigateTo('admin_system');
              } else if (data.user.role === 'unit_admin') {
                navigateTo('admin_unit');
              }
            }}
          />
        )}

        {view === 'admin_unit' && (
          <AdminUnitScreen 
            user={user} 
            units={units} 
            handleLogout={handleLogout} 
            refreshUnits={refreshUnits}
          />
        )}
        
        {view === 'admin_system' && (
          <AdminSystemScreen 
            units={units} 
            setSelectedUnit={setSelectedUnit} 
            setView={navigateTo} 
            handleLogout={handleLogout} 
            refreshUnits={refreshUnits}
          />
        )}
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}