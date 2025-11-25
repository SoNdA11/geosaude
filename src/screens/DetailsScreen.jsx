import React, { useState } from 'react';
import { MapPin, Phone, Clock, Users, FileText, Map as MapIcon, ArrowLeft, Star, Activity } from 'lucide-react';
import Modal from '../components/Utils/Modal';
import DropdownSection from '../components/Utils/DropdownSection';

// Adicionando 'previousView' como uma prop
const DetailsScreen = ({ selectedUnit, setView, user, previousView }) => {
  const [activeNews, setActiveNews] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [specialtyModalOpen, setSpecialtyModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  if (!selectedUnit) return null;

  const copyLocation = () => {
    const text = `${selectedUnit.name} - ${selectedUnit.rua} - ${selectedUnit.bairro}, ${selectedUnit.cep}`;

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure it's not visible but part of DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        // NOTE: Substituído alert() por console.log, conforme as regras de UX
        console.log("Endereço copiado!");
      } else {
        throw new Error("Falha ao copiar");
      }
    } catch (err) {
      console.error('Erro ao copiar: ', err);
      // NOTE: Substituído alert() por console.log, conforme as regras de UX
      console.log("Não foi possível copiar o endereço automaticamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 mb-2">
          {/* CÓDIGO CORRIGIDO: Usa previousView em vez de 'home' */}
          <button
            onClick={() => setView(user && user.role === 'system_admin' ? 'admin_system' : previousView)}
            className="text-emerald-600 flex items-center gap-1 hover:underline"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedUnit.name}</h1>
            <div className="space-y-2 text-gray-600 mb-6">
              <p className="flex items-center gap-2"><MapPin size={18} className="text-emerald-500" /> {selectedUnit.rua}, {selectedUnit.bairro}</p>
              <p className="flex items-center gap-2"><Phone size={18} className="text-emerald-500" /> {selectedUnit.phone}</p>
              <p className="flex items-center gap-2"><Clock size={18} className="text-emerald-500" /> {selectedUnit.hours}</p>
              <p className="flex items-center gap-2"><Users size={18} className="text-emerald-500" /> {selectedUnit.target}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('map')} className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 flex items-center justify-center gap-2">
                <MapIcon size={18} /> Ver no Mapa
              </button>
              <button onClick={copyLocation} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-2">
                <FileText size={18} /> Copiar Local
              </button>
            </div>
          </div>

          <DropdownSection title="Serviços" defaultOpen={false}>
            {selectedUnit.services.length === 0 && <p className="text-gray-500 italic">Nenhum serviço listado.</p>}
            <div className="space-y-2">
              {selectedUnit.services.map(svc => (
                <div key={svc.id} onClick={() => setActiveService(svc)} className="p-3 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{svc.name}</p>
                    <p className="text-xs text-gray-500">{svc.specialty}</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{svc.doctor}</span>
                </div>
              ))}
            </div>
          </DropdownSection>

          <DropdownSection title="Especialidades">
            {Array.from(new Set(selectedUnit.services.map(s => s.specialty))).map(spec => (
              <div key={spec} onClick={() => { setSelectedSpecialty(spec); setSpecialtyModalOpen(true); }} className="p-3 border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                {spec}
              </div>
            ))}
            {selectedUnit.services.length === 0 && <p className="text-gray-500">Nenhuma especialidade.</p>}
          </DropdownSection>

          <DropdownSection title="Equipe Médica">
            {selectedUnit.doctors.map(doc => (
              <div key={doc.id} className="p-3 border-b last:border-0">
                <p className="font-bold">{doc.name}</p>
                <p className="text-sm text-gray-600">{doc.specialty} - CRM: {doc.crm}</p>
              </div>
            ))}
            {selectedUnit.doctors.length === 0 && <p className="text-gray-500">Equipe não cadastrada.</p>}
          </DropdownSection>
        </div>

        <div className="lg:col-span-1">
          <DropdownSection title="Notícias Recentes" defaultOpen={true}>
            <div className="space-y-3">
              {selectedUnit.news.length === 0 && <p className="text-gray-500 text-sm">Sem notícias recentes.</p>}
              {selectedUnit.news.map(n => (
                <div key={n.id} onClick={() => setActiveNews(n)} className="p-3 bg-yellow-50 border border-yellow-100 rounded cursor-pointer hover:bg-yellow-100 transition">
                  <h4 className="font-bold text-gray-800 text-sm">{n.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                </div>
              ))}
            </div>
          </DropdownSection>
        </div>
      </div>

      <Modal isOpen={!!activeNews} onClose={() => setActiveNews(null)} title={activeNews?.title}>
        <p className="text-sm text-gray-500 mb-4">{activeNews?.date}</p>
        <p className="text-gray-800 whitespace-pre-wrap">{activeNews?.content}</p>
      </Modal>

      <Modal isOpen={!!activeService} onClose={() => setActiveService(null)} title="Detalhes do Serviço">
        <div className="space-y-3">
          <p><strong>Serviço:</strong> {activeService?.name}</p>
          <p><strong>Especialidade:</strong> {activeService?.specialty}</p>
          <p><strong>Médico:</strong> {activeService?.doctor}</p>
          <p><strong>Descrição:</strong> {activeService?.description}</p>
          <p><strong>Horários:</strong> {activeService?.hours}</p>
          <p className="text-sm text-gray-500 mt-4">Necessário encaminhamento prévio da UBS.</p>
          <button onClick={() => setEvalModalOpen(true)} className="w-full bg-emerald-600 text-white py-2 rounded mt-4">Avaliar Serviço</button>
        </div>
      </Modal>

      <Modal isOpen={specialtyModalOpen} onClose={() => setSpecialtyModalOpen(false)} title={`Especialidade: ${selectedSpecialty}`}>
        <div className="space-y-2">
          {selectedUnit.services.filter(s => s.specialty === selectedSpecialty).map(s => (
            <div key={s.id} onClick={() => { setSpecialtyModalOpen(false); setActiveService(s); }} className="p-3 border rounded hover:bg-gray-100 cursor-pointer">
              <p className="font-bold">{s.name}</p>
              <p className="text-xs text-gray-500">Dr. {s.doctor}</p>
            </div>
          ))}
        </div>
      </Modal>

      {evalModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Avaliar Serviço</h3>
            <input className="w-full border p-2 rounded mb-2" placeholder="Título da avaliação" />
            <textarea className="w-full border p-2 rounded mb-4 h-24" placeholder="Descreva sua experiência..." />
            <div className="flex gap-2">
              <button onClick={() => setEvalModalOpen(false)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded">Cancelar</button>
              <button onClick={() => { setEvalModalOpen(false); console.log("Avaliação enviada!"); }} className="flex-1 bg-emerald-600 text-white py-2 rounded">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsScreen;