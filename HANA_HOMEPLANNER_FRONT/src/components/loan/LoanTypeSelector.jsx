import React from 'react';
import { Home, CreditCard, Building } from 'lucide-react';

const iconMap = {
  Home,
  CreditCard,
  Building
};

const LoanTypeSelector = ({ loanType, setLoanType, loanTypes }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        대출 종류
      </label>
      <div className="grid grid-cols-1 gap-3">
        {loanTypes.map((type) => {
          const IconComponent = iconMap[type.icon];
          return (
            <button
              key={type.id}
              onClick={() => setLoanType(type.id)}
              className={`p-4 border-2 rounded-lg transition-all flex items-center justify-between ${
                loanType === type.id
                  ? `${type.activeColor}`
                  : `${type.color} hover:bg-opacity-80`
              }`}
            >
              <div className="flex items-center">
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="font-medium">{type.name}</span>
              </div>
              <span className="text-sm opacity-75">{type.rate}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LoanTypeSelector;
