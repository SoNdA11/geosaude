import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from '../utils/toast';

const CATEGORIES = [
  'Campanhas e Vacinação',
  'Guias e Serviços ao Cidadão',
  'Lista de Medicamentos',
  'Boletins e Relatórios de Saúde',
  'Legislação e Decretos'
];

export default function ModalDocumentEdit({ isOpen, onClose, docData, onSave }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orgaoEmissor, setOrgaoEmissor] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (docData) {
        setTitulo(docData.titulo || '');
        setDescricao(docData.descricao || '');
        setCategoria(docData.categoria || '');
        setOrgaoEmissor(docData.orgao_emissor || '');
      } else {
        setTitulo('');
        setDescricao('');
        setCategoria('');
        setOrgaoEmissor('Secretaria de Saúde');
      }
      setFile(null);
    }
  }, [isOpen, docData]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitAction = async (targetStatus) => {
    // Validações estritas
    if (!titulo.trim()) {
      toast.warning('O título é obrigatório.');
      return;
    }
    if (!descricao.trim()) {
      toast.warning('A descrição é obrigatória.');
      return;
    }
    if (!categoria) {
      toast.warning('Selecione uma categoria.');
      return;
    }
    if (!orgaoEmissor.trim()) {
      toast.warning('O órgão emissor é obrigatório.');
      return;
    }
    if (!docData && !file) {
      toast.warning('O arquivo do documento é obrigatório para cadastro.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descricao', descricao.trim());
      formData.append('categoria', categoria);
      formData.append('orgao_emissor', orgaoEmissor.trim());
      formData.append('status', targetStatus);
      if (file) {
        formData.append('arquivo', file);
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar documento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {docData ? 'Editar Documento' : 'Novo Documento Informativo'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Preencha os metadados do documento oficial.</p>
          </div>
          <button 
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Título do Documento</label>
            <input
              type="text"
              required
              placeholder="Ex: Tabela de Medicamentos Disponíveis - UPA"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white rounded-xl p-3 text-sm outline-none transition-all"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Descrição/Detalhes</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva resumidamente o teor deste documento informativo..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white rounded-xl p-3 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Categoria & Órgão Emissor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
              <select
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white rounded-xl p-3 text-sm outline-none transition-all"
              >
                <option value="" disabled>Selecione...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Órgão Emissor</label>
              <input
                type="text"
                required
                placeholder="Ex: Secretaria de Saúde"
                value={orgaoEmissor}
                onChange={(e) => setOrgaoEmissor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-indigo-300 focus:bg-white rounded-xl p-3 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* File Upload Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Arquivo do Documento</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer hover:bg-indigo-50/10 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg"
              />
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <Upload size={20} />
              </div>
              <p className="text-xs font-bold text-gray-700">
                {file ? file.name : 'Selecionar arquivo ou soltar aqui'}
              </p>
              <p className="text-[10px] text-gray-400">
                Suporta PDF, Word, Excel, Imagens de até 15MB
              </p>
            </div>
            {docData && !file && (
              <p className="text-[10px] text-gray-400 italic">
                * Deixe em branco se quiser manter o arquivo existente ({docData.formato_extensao?.toUpperCase()}).
              </p>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition-all"
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            {submitting ? (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm">
                <Loader2 size={16} className="animate-spin" /> Salvando...
              </div>
            ) : docData ? (
              // Edição de Documento Existente
              docData.status === 'Publicado' ? (
                <>
                  <button
                    onClick={() => handleSubmitAction('Rascunho')}
                    className="px-4 py-2.5 rounded-xl border border-amber-200 hover:bg-amber-50 text-amber-700 font-semibold text-sm transition-all"
                  >
                    Mudar para Rascunho
                  </button>
                  <button
                    onClick={() => handleSubmitAction('Publicado')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-150 transition-all"
                  >
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleSubmitAction('Rascunho')}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm transition-all"
                  >
                    Salvar como Rascunho
                  </button>
                  <button
                    onClick={() => handleSubmitAction('Publicado')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-150 transition-all"
                  >
                    Publicar Agora
                  </button>
                </>
              )
            ) : (
              // Cadastro de Novo Documento
              <>
                <button
                  onClick={() => handleSubmitAction('Rascunho')}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm transition-all"
                >
                  Salvar como Rascunho
                </button>
                <button
                  onClick={() => handleSubmitAction('Publicado')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-150 transition-all"
                >
                  Publicar
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
