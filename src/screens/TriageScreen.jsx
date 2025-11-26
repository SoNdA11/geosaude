import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, AlertTriangle, CheckCircle, MapPin, Phone, RotateCcw, FileText, Thermometer, Clock, User, ChevronLeft } from 'lucide-react';

const TriageScreen = ({ setView, setSelectedUnit }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    emergency_symptoms: [],
    main_symptoms: [],
    pain_level: 0,
    duration: '',
    age_group: ''
  });
  const [result, setResult] = useState(null);

  const processTriage = (currentAnswers) => {
    const { emergency_symptoms, main_symptoms, pain_level, duration, age_group } = currentAnswers;
    
    if (emergency_symptoms && emergency_symptoms.length > 0) {
      return {
        color: 'red',
        title: 'EMERGÊNCIA MÉDICA',
        subtitle: 'Risco de vida iminente',
        action: 'Ligue 192 (SAMU) imediatamente.',
        description: 'Seus sintomas indicam uma condição grave que requer transporte especializado. Não vá por meios próprios se estiver instável.',
        unitType: 'Hospital',
        details: 'Sintomas críticos detectados.'
      };
    }

    const isHighPain = pain_level >= 8;
    const hasRespiratoryIssues = main_symptoms?.includes('falta_ar');
    const hasTrauma = main_symptoms?.includes('fratura') || main_symptoms?.includes('corte_profundo');
    const isBabyWithFever = age_group === 'bebe' && main_symptoms?.includes('febre');

    if (isHighPain || hasRespiratoryIssues || hasTrauma || isBabyWithFever) {
      return {
        color: 'orange',
        title: 'ATENDIMENTO URGENTE',
        subtitle: 'Necessita de atenção rápida',
        action: 'Vá para uma UPA (Unidade de Pronto Atendimento).',
        description: 'Seu caso requer exames (Raio-X, Eletro) ou medicação venosa que não estão disponíveis na UBS, mas não requer internação imediata em Hospital.',
        unitType: 'UPA',
        details: hasRespiratoryIssues ? 'Dificuldade respiratória requer oxigênio/inalação.' : 'Nível de dor ou trauma requer intervenção rápida.'
      };
    }

    if (duration === 'semana_mais' && pain_level <= 5) {
      return {
        color: 'emerald',
        title: 'ATENDIMENTO BÁSICO',
        subtitle: 'Caso ambulatorial',
        action: 'Agende na UBS do seu bairro.',
        description: 'Seu caso parece ser crônico ou de baixa complexidade. A UBS é o local ideal para acompanhamento, exames de rotina e vacinação.',
        unitType: 'UBS',
        details: 'Sintomas persistentes devem ser investigados pelo médico da família.'
      };
    }

    return {
      color: 'blue',
      title: 'ATENDIMENTO CLÍNICO',
      subtitle: 'Consulta médica necessária',
      action: 'Procure sua UBS de referência.',
      description: 'Para sintomas leves como gripe, dor de garganta ou mal-estar geral, a Unidade Básica de Saúde oferece o melhor acolhimento.',
      unitType: 'UBS',
      details: 'Atendimento primário resolutivo.'
    };
  };

  const handleNext = (newData) => {
    const updatedAnswers = { ...answers, ...newData };
    setAnswers(updatedAnswers);

    if (step === 1 && newData.emergency_symptoms && newData.emergency_symptoms.length > 0) {
      const emergencyResult = processTriage(updatedAnswers);
      setResult(emergencyResult);
      setStep(5); 
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      const finalResult = processTriage(updatedAnswers);
      setResult(finalResult);
      setStep(5);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else setView('home');
  };

  const restart = () => {
    setAnswers({
      emergency_symptoms: [],
      main_symptoms: [],
      pain_level: 0,
      duration: '',
      age_group: ''
    });
    setResult(null);
    setStep(0);
  };

  const ProgressBar = () => (
    <div className="w-full bg-gray-100 h-2 mb-6">
      <div 
        className="bg-emerald-500 h-2 transition-all duration-500 ease-out" 
        style={{ width: `${(step / 5) * 100}%` }}
      ></div>
    </div>
  );

  const StepWelcome = () => (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
        <Activity size={40} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Triagem Inteligente</h2>
        <p className="text-gray-500 mt-2">Responda 4 perguntas rápidas e saiba exatamente onde ir.</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm text-left border border-blue-100">
        ℹ️ <strong>Importante:</strong> Esta ferramenta é apenas orientativa. Em caso de dúvida ou piora rápida, procure ajuda imediatamente.
      </div>
      <button onClick={() => setStep(1)} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
        Começar Triagem
      </button>
    </div>
  );

  const StepEmergency = () => {
    const [selected, setSelected] = useState([]);
    
    const toggle = (val) => {
      if (selected.includes(val)) setSelected(selected.filter(i => i !== val));
      else setSelected([...selected, val]);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Sente algo grave agora?
        </h2>
        <p className="text-gray-500 text-sm">Selecione se você ou o paciente apresenta algum destes sinais:</p>
        
        <div className="space-y-3">
          {[
            'Desmaio ou perda de consciência', 
            'Dor forte no peito (aperto)', 
            'Dificuldade grave para respirar', 
            'Sangramento intenso que não para',
            'Convulsão ativa'
          ].map((item) => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                selected.includes(item) 
                  ? 'bg-red-50 border-red-500 text-red-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-200'
              }`}
            >
              {item}
              {selected.includes(item) && <CheckCircle size={20} />}
            </button>
          ))}
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            onClick={() => handleNext({ emergency_symptoms: [] })} 
            className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            NÃO sinto nada disso
          </button>
          <button 
            onClick={() => handleNext({ emergency_symptoms: selected })}
            disabled={selected.length === 0}
            className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
          >
            SIM, sinto isso
          </button>
        </div>
      </div>
    );
  };

  const StepSymptoms = () => {
    const [selected, setSelected] = useState(answers.main_symptoms || []);
    const options = [
      { id: 'febre', label: 'Febre', icon: '🤒' },
      { id: 'tosse', label: 'Tosse', icon: '😮‍💨' },
      { id: 'dor_garganta', label: 'Dor de Garganta', icon: '😫' },
      { id: 'falta_ar', label: 'Falta de Ar', icon: '🫁' },
      { id: 'vomito', label: 'Vômito/Diarreia', icon: '🤢' },
      { id: 'dor_corpo', label: 'Dor no Corpo', icon: '🤕' },
      { id: 'corte_profundo', label: 'Corte/Ferida', icon: '🩸' },
      { id: 'fratura', label: 'Suspeita Fratura', icon: '🦴' },
    ];

    const toggle = (id) => {
      if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
      else setSelected([...selected, id]);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800">O que você está sentindo?</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`p-4 rounded-xl border text-left font-medium transition-all flex flex-col gap-2 ${
                selected.includes(opt.id) 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-sm">{opt.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => handleNext({ main_symptoms: selected })}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all mt-4"
        >
          Continuar
        </button>
      </div>
    );
  };

  const StepDetails = () => {
    const [pain, setPain] = useState(answers.pain_level || 0);
    const [duration, setDuration] = useState(answers.duration || '');

    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Nível de Dor (0 a 10)</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400">SEM DOR</span>
            <span className="text-2xl font-bold text-emerald-600">{pain}</span>
            <span className="text-xs font-bold text-gray-400">INSUPORTÁVEL</span>
          </div>
          <input 
            type="range" min="0" max="10" value={pain} 
            onChange={(e) => setPain(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Há quanto tempo?</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { val: 'menos_24h', label: 'Começou hoje (Agudo)' },
              { val: 'alguns_dias', label: 'Há 2 ou 3 dias' },
              { val: 'semana_mais', label: 'Mais de uma semana (Crônico)' }
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setDuration(opt.val)}
                className={`p-3 rounded-xl border text-left font-medium transition-all ${
                  duration === opt.val ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => handleNext({ pain_level: pain, duration })}
          disabled={!duration}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    );
  };

  const StepProfile = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800">Quem é o paciente?</h2>
        <div className="space-y-3">
          {[
            { val: 'bebe', label: 'Bebê (0 a 2 anos)', icon: '👶' },
            { val: 'crianca', label: 'Criança', icon: 'boy' },
            { val: 'adulto', label: 'Adulto', icon: '👨' },
            { val: 'idoso', label: 'Idoso (60+)', icon: '👴' }
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => handleNext({ age_group: opt.val })}
              className="w-full p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 text-left group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon === 'boy' ? '👦' : opt.icon}</span>
              <span className="font-bold text-gray-700 group-hover:text-emerald-800">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const StepResult = () => {
    if (!result) {
      return (
        <div className="text-center py-10">
           <p className="text-gray-500 mb-4">Ocorreu um erro ao processar o resultado.</p>
           <button onClick={restart} className="bg-emerald-600 text-white px-6 py-2 rounded-lg">Tentar Novamente</button>
        </div>
      );
    }

    const theme = {
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'bg-red-100 text-red-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'bg-orange-100 text-orange-600' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'bg-emerald-100 text-emerald-600' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'bg-blue-100 text-blue-600' },
    }[result.color];

    return (
      <div className="animate-fade-in text-center h-full flex flex-col">
        <div className={`flex-1 p-6 rounded-3xl border-2 ${theme.border} ${theme.bg} mb-6 flex flex-col items-center justify-center`}>
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm ${theme.icon}`}>
             {result.color === 'red' ? <AlertTriangle size={40} /> : result.color === 'orange' ? <Activity size={40} /> : <CheckCircle size={40} />}
           </div>
           <h2 className={`text-2xl font-black uppercase tracking-tight mb-1 ${theme.text}`}>{result.title}</h2>
           <p className={`text-lg font-semibold opacity-80 mb-4 ${theme.text}`}>{result.subtitle}</p>
           
           <div className="bg-white/60 p-4 rounded-xl w-full text-left space-y-2 mb-4">
             <p className="text-sm text-gray-700"><strong>O que fazer:</strong> {result.action}</p>
             <p className="text-sm text-gray-600">{result.description}</p>
           </div>

           {result.details && (
             <span className="text-xs font-medium opacity-60 uppercase tracking-wide">Motivo: {result.details}</span>
           )}
        </div>

        <div className="space-y-3">
          {result.color === 'red' ? (
            <a href="tel:192" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Phone size={20} /> LIGAR 192 AGORA
            </a>
          ) : (
            <button 
              onClick={() => {
                setSelectedUnit(null);
                setView('map'); 
              }}
              className={`w-full text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${
                result.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 
                result.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' :
                'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              <MapPin size={20} /> Encontrar {result.unitType} Próxima
            </button>
          )}
          
          <button 
            onClick={restart}
            className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Refazer Teste
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="bg-white w-full max-w-md min-h-[600px] rounded-[2rem] shadow-2xl shadow-gray-200 border border-gray-100 relative flex flex-col">
        
        {/* Header Interno */}
        {step > 0 && step < 5 && (
          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Passo {step}/4</span>
            <div className="w-10"></div> 
          </div>
        )}

        {step > 0 && step < 5 && <ProgressBar />}

        <div className="flex-1 p-6 md:p-8 flex flex-col">
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepEmergency />}
          {step === 2 && <StepSymptoms />}
          {step === 3 && <StepDetails />}
          {step === 4 && <StepProfile />}
          {step === 5 && <StepResult />}
        </div>

      </div>
    </div>
  );
};

export default TriageScreen;