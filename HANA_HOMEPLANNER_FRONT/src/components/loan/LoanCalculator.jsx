import React from 'react';
import { TrendingUp } from 'lucide-react';
import LoanTypeSelector from './LoanTypeSelector';

const LoanCalculator = ({
  loanType,
  setLoanType,
  loanAmount,
  loanPeriod,
  setLoanPeriod,
  interestRate,
  setInterestRate,
  repaymentType,
  setRepaymentType,
  loanTypes,
  handleAmountChange,
  calculateLoan
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        대출 조건 입력
      </h2>

      {/* Loan Type Selection */}
      <LoanTypeSelector 
        loanType={loanType} 
        setLoanType={setLoanType} 
        loanTypes={loanTypes} 
      />

      {/* Loan Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대출 금액 (만원)
        </label>
        <input
          type="text"
          value={loanAmount}
          onChange={handleAmountChange}
          placeholder="예: 30,000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-sans"
        />
      </div>

      {/* Loan Period */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대출 기간 (년)
        </label>
        <select
          value={loanPeriod}
          onChange={(e) => setLoanPeriod(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-sans"
        >
          <option value="10">10년</option>
          <option value="15">15년</option>
          <option value="20">20년</option>
          <option value="25">25년</option>
          <option value="30">30년</option>
        </select>
      </div>

      {/* Interest Rate */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          연이자율 (%)
        </label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          placeholder="예: 3.5"
          step="0.1"
          min="0"
          max="20"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-sans"
        />
      </div>

      {/* Repayment Type */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          상환 방식
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setRepaymentType("equal")}
            className={`p-3 border-2 rounded-lg transition-all ${
              repaymentType === "equal"
                ? "bg-teal-50 border-teal-400 text-teal-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="text-center">
              <div className="font-medium">원리금균등</div>
              <div className="text-xs mt-1 opacity-75">
                매월 동일 금액
              </div>
            </div>
          </button>
          <button
            onClick={() => setRepaymentType("principal")}
            className={`p-3 border-2 rounded-lg transition-all ${
              repaymentType === "principal"
                ? "bg-teal-50 border-teal-400 text-teal-700"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="text-center">
              <div className="font-medium">원금균등</div>
              <div className="text-xs mt-1 opacity-75">
                원금 동일 상환
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateLoan}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        <TrendingUp className="w-5 h-5 mr-2" />
        시뮬레이션 계산하기
      </button>
    </div>
  );
};

export default LoanCalculator;
