import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DropdownSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition">
        <h3 className="font-bold text-gray-700">{title}</h3>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
};

export default DropdownSection;