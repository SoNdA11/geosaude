import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, ArrowLeft, Loader2, Calendar, FileDown, Shield } from 'lucide-react';
import { api } from '../utils/api';

const CATEGORIES = [
  'Campanhas e Vacinação',
  'Guias e Serviços ao Cidadão',
  'Lista de Medicamentos',
  'Boletins e Relatórios de Saúde',
  'Legislação e Decretos'
];

export default function DocumentsPortalScreen({ setView }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPublicDocuments = async () => {
    try {
      setLoading(true);
      // Fazer a busca de documentos publicados
      let endpoint = '/documents/public';
      const params = [];
      if (selectedCategory) {
        params.push(`categoria=${encodeURIComponent(selectedCategory)}`);
      }
      if (search.trim()) {
        params.push(`q=${encodeURIComponent(search.trim())}`);
      }
      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }

      // getHistory ou direct fetch. Vamos mapear o fetch no api.js mais tarde, mas podemos fazer fetch direto aqui
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDocuments();
  }, [selectedCategory, search]);

  const handleView = async (docId, fileUrl) => {
    try {
      // Incrementar visualização assincronamente via endpoint correspondente
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      window.open(`${baseUrl}/documents/${docId}/view`, '_blank');
      // Atualizar contador local de visualizações
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, contador_visualizacoes: d.contador_visualizacoes + 1 } : d));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (docId, docTitle, extension) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // Abrir download
      window.location.href = `${baseUrl}/documents/${docId}/download`;
      // Atualizar contador local de downloads
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, contador_downloads: d.contador_downloads + 1 } : d));
    } catch (e) {
      console.error(e);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (ext) => {
    const format = ext?.toLowerCase();
    if (format === 'pdf') return 'bg-red-50 text-red-600 border-red-100';
    if (format === 'docx' || format === 'doc') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (format === 'xlsx' || format === 'xls') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (format === 'png' || format === 'jpg' || format === 'jpeg') return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Campanhas e Vacinação':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Guias e Serviços ao Cidadão':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Lista de Medicamentos':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Boletins e Relatórios de Saúde':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Legislação e Decretos':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-tr from-emerald-900 to-teal-950 text-white py-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-800/10 -skew-x-12 transform translate-x-12"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6 text-sm font-semibold group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para a Página Inicial
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documentos e Transparência</h1>
              <p className="text-emerald-100/70 text-sm mt-2 max-w-2xl">
                Acesse e baixe documentos oficiais, guias do cidadão, decretos legislativos e listas atualizadas de medicamentos emitidos pelos órgãos de saúde de Mossoró.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-800/30 border border-emerald-700/30 rounded-2xl px-4 py-2 self-start md:self-auto backdrop-blur-md">
              <Shield size={18} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-100">Documentos Homologados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm/50 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 focus:border-emerald-300 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                !selectedCategory
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listagem de Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Buscando documentos homologados...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm/50">
            <div className="bg-gray-100 p-4 rounded-full text-gray-400 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Nenhum documento encontrado</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Nenhum documento oficial corresponde aos filtros ou busca selecionada no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div 
                key={doc.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Category and Date Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(doc.categoria)}`}>
                      {doc.categoria}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium shrink-0">
                      <Calendar size={12} />
                      {doc.data_publicacao ? new Date(doc.data_publicacao).toLocaleDateString('pt-BR') : 'Sem data'}
                    </div>
                  </div>

                  {/* Title and File Type Icon */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-3 rounded-xl border shrink-0 ${getFileIcon(doc.formato_extensao)}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 leading-tight text-base group-hover:text-emerald-700 transition-colors line-clamp-2" title={doc.titulo}>
                        {doc.titulo}
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Por: <span className="font-medium text-gray-600">{doc.orgao_emissor}</span></p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-xs leading-relaxed mb-6 line-clamp-3" title={doc.descricao}>
                    {doc.descricao}
                  </p>
                </div>

                {/* Footer details and Actions */}
                <div className="border-t border-gray-50 pt-4 mt-auto flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium" title="Visualizações">
                      <Eye size={12} />
                      {doc.contador_visualizacoes}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium" title="Downloads">
                      <Download size={12} />
                      {doc.contador_downloads}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 shrink-0">
                      {doc.formato_extensao?.toUpperCase()} • {formatBytes(doc.tamanho_bytes)}
                    </span>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doc.id, doc.caminho_arquivo)}
                      className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95 border border-gray-100 hover:border-emerald-100 transition-all"
                      title="Visualizar Documento"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc.id, doc.titulo, doc.formato_extensao)}
                      className="p-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 active:scale-95 transition-all"
                      title="Baixar Documento"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
