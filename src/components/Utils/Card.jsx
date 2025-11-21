import React from 'react';

const Card = ({ icon: Icon, title, description, onClick, disabled }) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}`}
  >
    <div className={`p-3 rounded-full mb-4 ${disabled ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
      <Icon size={32} />
    </div>
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default Card;