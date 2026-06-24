import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Clock, Users, FileText, Map as MapIcon, ArrowLeft, Star, Activity, Calendar, ChevronRight } from 'lucide-react';
import Modal from '../components/Utils/Modal';
import { toast } from '../utils/toast';

const DetailsScreen = ({ selectedUnit, setView, user, previousView }) => {
  const [activeNews, setActiveNews] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  const loggedUnitId = useRef(null);

  useEffect(() => {
    if (selectedUnit && selectedUnit.id && loggedUnitId.current !== selectedUnit.id) {
      loggedUnitId.current = selectedUnit.id;
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/units/${selectedUnit.id}/access`, {
        method: 'POST'
      }).catch(err => console.error('Erro ao registrar acesso:', err));
    }
  }, [selectedUnit]);

  if (!selectedUnit) return null;

  const copyLocation = () => {
    const text = `${selectedUnit.name} - ${selectedUnit.rua} - ${selectedUnit.bairro}, ${selectedUnit.cep}`;
    try {
      navigator.clipboard.writeText(text);
      console.log("Endereço copiado!");
    } catch (err) {
      console.error('Erro ao copiar: ', err);
    }
  };

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-fade-in font-sans">
      
      <div className="bg-white border-b border-gray-200 sticky top-[64px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => setView(previousView)}
              className="text-gray-500 hover:text-emerald-600 flex items-center gap-2 text-sm font-medium transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Voltar para busca
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedUnit.type === 'Hospital' ? 'bg-purple-50 text-purple-700 border-purple-100' : selectedUnit.type === 'UPA' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                    {selectedUnit.type}
                  </span>
                  {selectedUnit.federativeEntity && <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">{selectedUnit.federativeEntity}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{selectedUnit.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                  <MapPin size={16} />
                  <span>{selectedUnit.bairro}</span>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setView('map')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  <MapIcon size={18} /> Ver no Mapa
                </button>
                <button 
                  onClick={copyLocation}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  <FileText size={18} /> Copiar
                </button>
              </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informações Básicas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="flex items-start gap-3">
               <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Clock size={20}/></div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Horário de Atendimento</p>
                 <p className="font-medium text-gray-800">{selectedUnit.hours}</p>
               </div>
             </div>
             <div className="flex items-start gap-3">
               <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Phone size={20}/></div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Telefone</p>
                 <p className="font-medium text-gray-800">{selectedUnit.phone}</p>
               </div>
             </div>
             <div className="col-span-1 sm:col-span-2 flex items-start gap-3 pt-4 border-t border-gray-50">
               <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><MapPin size={20}/></div>
               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">Endereço Completo</p>
                 <p className="font-medium text-gray-800">{selectedUnit.rua}, {selectedUnit.bairro} - CEP: {selectedUnit.cep}</p>
               </div>
             </div>
          </div>

          {/* Grid de Serviços e Equipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <InfoCard title="Serviços Disponíveis" icon={Activity}>
              {selectedUnit.services.length === 0 && <p className="text-gray-400 italic text-sm">Informação não disponível.</p>}
              {selectedUnit.services.map(svc => (
                <div 
                  key={svc.id} 
                  onClick={() => setActiveService(svc)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                >
                  <div>
                    <p className="font-bold text-gray-700 text-sm group-hover:text-emerald-700">{svc.name}</p>
                    <p className="text-xs text-gray-400">{svc.specialty}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500" />
                </div>
              ))}
            </InfoCard>

            <InfoCard title="Especialidades" icon={Star}>
               <div className="flex flex-wrap gap-2">
                {selectedUnit.services.length === 0 && <p className="text-gray-400 italic text-sm">Nenhuma listada.</p>}
                {Array.from(new Set(selectedUnit.services.map(s => s.specialty))).map(spec => (
                  <span 
                    key={spec}
                    onClick={() => { setSelectedSpecialty(spec); setSpecialtyModalOpen(true); }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg cursor-pointer hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  >
                    {spec}
                  </span>
                ))}
               </div>
            </InfoCard>

            <div className="md:col-span-2">
              <InfoCard title="Corpo Clínico" icon={Users}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUnit.doctors.length === 0 && <p className="text-gray-400 italic text-sm">Equipe não cadastrada.</p>}
                  {selectedUnit.doctors.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                        DR
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialty} • CRM: {doc.crm}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>

          </div>
        </div>

        {/* Sidebar Lateral (Notícias) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
               <Calendar size={18} /> Mural de Avisos
             </h3>
             <div className="space-y-4">
               {selectedUnit.news.length === 0 && <p className="text-blue-400 text-sm italic">Sem avisos recentes.</p>}
               {selectedUnit.news.map(n => (
                 <div 
                   key={n.id} 
                   onClick={() => setActiveNews(n)}
                   className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all border border-blue-100/50"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">NOTÍCIA</span>
                     <span className="text-[10px] text-gray-400">{n.date}</span>
                   </div>
                   <h4 className="font-bold text-gray-800 text-sm leading-snug mb-1">{n.title}</h4>
                   <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      <Modal isOpen={!!activeNews} onClose={() => setActiveNews(null)} title="Aviso da Unidade">
         <div className="mt-2">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{activeNews?.title}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mb-4 inline-block">{activeNews?.date}</span>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{activeNews?.content}</p>
         </div>
      </Modal>

      <Modal isOpen={!!activeService} onClose={() => setActiveService(null)} title="Detalhes do Serviço">
         <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
               <div>
                  <h3 className="font-bold text-lg text-gray-800">{activeService?.name}</h3>
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">{activeService?.specialty}</span>
               </div>
            </div>
            <div className="space-y-2 text-sm">
               <p><strong className="text-gray-900">Médico Responsável:</strong> <span className="text-gray-600">{activeService?.doctor}</span></p>
               <p><strong className="text-gray-900">Horários:</strong> <span className="text-gray-600">{activeService?.hours}</span></p>
               <div className="bg-gray-50 p-3 rounded-lg mt-2">
                  <p className="text-gray-500 italic">"{activeService?.description}"</p>
               </div>
            </div>
            <button onClick={() => setEvalModalOpen(true)} className="w-full bg-gray-900 text-white py-3 rounded-xl mt-4 hover:bg-black transition-colors text-sm font-medium">
               Avaliar este Serviço
            </button>
         </div>
      </Modal>

      <Modal isOpen={specialtyModalOpen} onClose={() => setSpecialtyModalOpen(false)} title={`Especialidade: ${selectedSpecialty}`}>
         <div className="space-y-2 pt-2">
           {selectedUnit.services.filter(s => s.specialty === selectedSpecialty).map(s => (
             <div key={s.id} onClick={() => { setSpecialtyModalOpen(false); setActiveService(s); }} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors">
               <div>
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Dr. {s.doctor}</p>
               </div>
               <ChevronRight size={16} className="text-gray-300"/>
             </div>
           ))}
         </div>
      </Modal>

      {evalModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[60]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 animate-fade-in scale-100 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Avaliar Serviço</h3>
              <p className="text-xs text-gray-400 mt-1">
                Deixe seu feedback sobre: <span className="font-semibold text-gray-700">{activeService?.name}</span>
              </p>
            </div>

            {/* Seleção de Estrelas (0 a 5) */}
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNota(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={32}
                    className={`transition-colors duration-200 ${
                      star <= nota ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Comentário (Opcional)</label>
              <textarea
                rows={3}
                placeholder="Conte-nos como foi seu atendimento (elogios, observações ou reclamações)..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={submittingEval}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-300 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEvalModalOpen(false);
                  setNota(0);
                  setComentario('');
                }}
                disabled={submittingEval}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (nota < 1 || nota > 5) {
                    toast.warning('Por favor, selecione uma nota de 1 a 5 estrelas.');
                    return;
                  }
                  try {
                    setSubmittingEval(true);
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const response = await fetch(`${baseUrl}/reviews`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        nota,
                        comentario: comentario.trim(),
                        service_id: activeService.id,
                        unit_id: selectedUnit.id
                      })
                    });

                    if (response.ok) {
                      toast.success('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
                      setEvalModalOpen(false);
                      setActiveService(null);
                      setNota(0);
                      setComentario('');
                    } else {
                      const data = await response.json().catch(() => ({}));
                      throw new Error(data.error || 'Erro ao registrar avaliação.');
                    }
                  } catch (err) {
                    toast.error(err.message || 'Erro ao enviar avaliação.');
                  } finally {
                    setSubmittingEval(false);
                  }
                }}
                disabled={submittingEval}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {submittingEval ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsScreen;