import React from 'react';
import { DollarSign } from 'lucide-react';

const LoanCapacityButton = ({ onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center"
      >
        <DollarSign className="w-5 h-5 mr-2" />
        내 소득기반으로 대출 가능 금액 평가하기
      </button>
    </div>
  );
};

export default LoanCapacityButton;
