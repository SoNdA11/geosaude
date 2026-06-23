import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Lock, LayoutDashboard } from 'lucide-react';
import { api } from './utils/api';
import { setToastCallback } from './utils/toast';
import ToastContainer from './components/ToastContainer';

// Importação das Telas
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import DetailsScreen from './screens/DetailsScreen';
import AdvancedSearchScreen from './screens/AdvancedSearchScreen';
import AdminUnitScreen from './screens/Admin/AdminUnitScreen';
import AdminSystemScreen from './screens/Admin/AdminSystemScreen';
import TriageScreen from './screens/TriageScreen';
import LoginScreen from './screens/LoginScreen';
import DocumentsPortalScreen from './screens/DocumentsPortalScreen';
import AboutScreen from './screens/AboutScreen';

export default function App() {
  const [view, setView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState(null);

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

  useEffect(() => {
    setToastCallback((newToast) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...newToast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration || 3000);
    });
    return () => setToastCallback(null);
  }, []);

  // Guarda de Rotas de Administração
  useEffect(() => {
    const securedViews = ['admin_unit', 'admin_system'];
    if (securedViews.includes(view) && !user) {
      setView('login');
    }
  }, [view, user]);

  const navigateTo = (newView) => {
    setPreviousView(view);
    setView(newView);
    if (newView !== 'map' && newView !== 'details') {
      setFilteredUnits(null);
    }
  };

  const handleSearchUbs = async (query) => {
    if (!query || !query.trim()) return { success: false };

    const normalizeText = (text) => {
      if (!text) return '';
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    };

    const normQuery = normalizeText(query);

    // Procurar localmente por unidades que tenham o bairro, CEP ou nome batendo com o digitado
    const matches = units.filter(unit => {
      const matchBairro = unit.bairro && normalizeText(unit.bairro).includes(normQuery);
      const matchCep = unit.cep && unit.cep.replace(/\D/g, '').includes(normQuery.replace(/\D/g, ''));
      const matchName = unit.name && normalizeText(unit.name).includes(normQuery);
      return matchBairro || matchCep || matchName;
    });

    if (matches.length > 0) {
      setFilteredUnits(matches);
      navigateTo('map');
      return { success: true };
    }

    try {
      const res = await api.getClosestUbs(query);
      return {
        success: false,
        closest: res.ubs,
        distanceKm: res.distanceKm
      };
    } catch (err) {
      console.error('Erro ao buscar UBS mais próxima:', err);
      return { success: false };
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    navigateTo('home');
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
              <button
                onClick={() => navigateTo(user.role === 'system_admin' ? 'admin_system' : 'admin_unit')}
                className="text-sm font-semibold text-gray-600 hover:text-emerald-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-50/50 transition-all active:scale-95 group"
                title="Acessar Painel de Controle"
              >
                <LayoutDashboard size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                <span className="hidden sm:inline">Painel</span>
              </button>
              <div 
                className="hidden md:flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigateTo(user.role === 'system_admin' ? 'admin_system' : 'admin_unit')}
                title="Acessar Painel"
              >
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
      </div>
    </div>
  );

  return (
    <div className="font-sans text-gray-600 bg-gray-50/50 min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
      {view !== 'admin_unit' && view !== 'admin_system' && renderNavbar()}

      <div className="animate-fade-in">
        {view === 'home' && <HomeScreen setView={navigateTo} onSearchUbs={handleSearchUbs} />}
        
        {view === 'map' && (
          <MapScreen 
            units={filteredUnits || units} 
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

        {view === 'documents_portal' && (
          <DocumentsPortalScreen 
            setView={navigateTo} 
          />
        )}

        {view === 'about_project' && (
          <AboutScreen 
            setView={navigateTo} 
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
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(15px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
      `}</style>
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}