import React, { useState, useEffect } from 'react';
import { LogOut, MapPin, Lock, Loader2 } from 'lucide-react';

// Importação da conexão com o banco
import { supabase } from './data/supabaseClient';
import { MOCK_USERS } from './data/mockData';

// Importação dos utilitários
import Modal from './components/Utils/Modal';

// Importação das Telas
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import DetailsScreen from './screens/DetailsScreen';
import AdvancedSearchScreen from './screens/AdvancedSearchScreen';
import AdminUnitScreen from './screens/Admin/AdminUnitScreen';
import AdminSystemScreen from './screens/Admin/AdminSystemScreen';
import TriageScreen from './screens/TriageScreen';

export default function App() {
  // Estados de Navegação e Dados Globais
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  // O estado 'units' agora começa vazio e o 'loading' controla o carregamento
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  // Dispara a busca assim que o site abre
  useEffect(() => {
    fetchUnits();
  }, []);


  // --- 🔄 OPERAÇÕES DO CRUD ---

  // Função para Atualizar Informações da Unidade (UPDATE)
  const handleUpdateUnit = async (unitId, updatedFields) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('unidades')
        .update(updatedFields)
        .eq('id', unitId); // "Altere APENAS a unidade que tiver esse ID"

      if (error) throw error;
      
      alert("Unidade atualizada com sucesso no banco de dados!");
      await fetchUnits(); // Recarrega os dados fresquinhos do banco
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error.message);
      alert("Falha ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  // Função para Adicionar Serviço ou Notícia (CREATE)
  const handleAddItem = async (table, itemData) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from(table) // table será 'services' ou 'news'
        .insert([itemData]);

      if (error) throw error;
      
      alert("Item adicionado com sucesso!");
      await fetchUnits(); // Recarrega os dados fresquinhos
    } catch (error) {
      console.error(`Erro ao adicionar item na tabela ${table}:`, error.message);
      alert("Falha ao adicionar o item.");
    } finally {
      setLoading(false);
    }
  };

  // Função para Deletar Serviço ou Notícia (DELETE)
  const handleDeleteItem = async (table, itemId) => {
    // Pedir confirmação antes de deletar do banco
    if (!window.confirm("Tem certeza que deseja deletar permanentemente este item?")) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      alert("Item deletado permanentemente!");
      await fetchUnits(); // Atualiza a tela
    } catch (error) {
      console.error(`Erro ao deletar item ID ${itemId} da tabela ${table}:`, error.message);
      alert("Falha ao deletar o item.");
    } finally {
      setLoading(false);
    }
  };


  // --- SISTEMA DE AUTENTICAÇÃO MOCKADO (Mantido simples para o PI II) ---
  const handleLogin = () => {
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail && u.password === loginPass);
    if (foundUser) {
      setUser(foundUser);
      setShowLoginModal(false);
      setLoginError('');
      if (foundUser.role === 'system_admin') {
        setView('admin_system');
      } else if (foundUser.role === 'unit_admin') {
        setView('admin_unit');
      }
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

const renderNavbar = () => (
    <div className="bg-emerald-600 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-40">
      {/* Lado Esquerdo: Logo e Título */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-white p-1 rounded-full">
          <MapPin className="text-emerald-600" size={20} />
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

      {view === 'home' && <HomeScreen setView={setView} setShowLoginModal={setShowLoginModal} />}
      
      {view === 'map' && (
        <MapScreen 
          units={units} 
          setSelectedUnit={setSelectedUnit} 
          setView={setView} 
        />
      )}
      
      {view === 'details' && (
        <DetailsScreen 
          selectedUnit={selectedUnit} 
          setView={setView} 
          user={user} 
        />
      )}

      {/* 🩺 ROTA DA SUA TRIAGEM REAL RECONECTADA NO SISTEMA */}
      {view === 'triage' && (
        <TriageScreen 
          setView={setView} 
          setSelectedUnit={setSelectedUnit}
        />
      )}
      
      {view === 'advanced_search' && (
        <AdvancedSearchScreen 
          units={units} 
          setSelectedUnit={setSelectedUnit} 
          setView={setView} 
        />
      )}
      
      {view === 'admin_unit' && (
        <AdminUnitScreen 
          user={user} 
          units={units} 
          handleLogout={handleLogout}
          onUpdateUnit={handleUpdateUnit}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
      
      {view === 'admin_system' && (
        <AdminSystemScreen 
          units={units} 
          setSelectedUnit={setSelectedUnit} 
          setView={setView} 
          handleLogout={handleLogout} 
        />
      )}

      {/* Modal Login Global */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Acesso Restrito">
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-start gap-2">
            <Lock className="text-red-500 shrink-0 mt-1" size={16} />
            <p className="text-xs text-red-700">Esta área é protegida. Certifique-se de que possui autorização antes de acessar.</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
            />
          </div>

          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}

          <button 
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 font-medium"
          >
            Entrar
          </button>
        </div>
      </Modal>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}