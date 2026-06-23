export const getActionTag = (action) => {
  if (!action) {
    return {
      label: 'Criação',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };
  }

  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('removeu') || lowerAction.includes('excluiu') || lowerAction.includes('deletou')) {
    return {
      label: 'Exclusão',
      style: 'bg-red-50 text-red-700 border-red-100'
    };
  }
  if (lowerAction.includes('atualizou') || lowerAction.includes('editou') || lowerAction.includes('redefiniu') || lowerAction.includes('alterou')) {
    return {
      label: 'Edição',
      style: 'bg-amber-50 text-amber-700 border-amber-100'
    };
  }
  if (lowerAction.includes('login') || lowerAction.includes('acesso')) {
    return {
      label: 'Login',
      style: 'bg-blue-50 text-blue-700 border-blue-100'
    };
  }
  if (lowerAction.includes('criou') || lowerAction.includes('cadastrou') || lowerAction.includes('adicionou') || lowerAction.includes('triagem')) {
    return {
      label: 'Criação',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };
  }

  // Fallback padrão
  return {
    label: 'Criação',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };
};
