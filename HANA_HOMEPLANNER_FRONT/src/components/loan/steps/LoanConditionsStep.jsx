/**
 * 2단계: 대출 조건 설정 컴포넌트
 */

import React from 'react';
import { 
  DollarSign, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';

const LoanConditionsStep = ({ 
  formData, 
  handleInputChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="p-8 max-w-none w-full h-[600px]">
      {/* 절반으로 나눈 레이아웃 */}
      <div className="flex items-center gap-12 h-full">
        {/* 좌측 절반 - 아이콘 영역 */}
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-full h-full max-w-lg max-h-lg bg-white rounded-xl flex items-center justify-center p-8">
            <img
              src="/icon/home-ic.png"
              alt="대출 조건 아이콘"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 우측 절반 - 모든 내용 */}
        <div className="w-1/2 flex flex-col">
          {/* 토스뱅크 스타일 헤더 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              대출 조건 설정
            </h2>
            <p className="text-sm text-gray-600">
              대출 금액과 기간을 설정해주세요
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* 희망 대출금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                희망 대출금액
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={
                    formData.desiredLoanAmount
                      ? formData.desiredLoanAmount.toLocaleString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleInputChange(
                      "desiredLoanAmount",
                      parseInt(value) || 0
                    );
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg text-center"
                  placeholder="500,000,000"
                />
                <span className="ml-2 text-sm text-gray-500">원</span>
              </div>

              {/* 빠른 선택 버튼들 */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { amount: 100000000, label: "1억원" },
                  { amount: 200000000, label: "2억원" },
                  { amount: 300000000, label: "3억원" },
                  { amount: 400000000, label: "4억원" },
                  { amount: 500000000, label: "5억원" },
                ].map(({ amount, label }) => (
                  <button
                    key={amount}
                    onClick={() =>
                      handleInputChange("desiredLoanAmount", amount)
                    }
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.desiredLoanAmount === amount
                        ? "bg-[#2b9d5c] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 대출 기간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출 기간
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { years: 10, label: "10년" },
                  { years: 15, label: "15년" },
                  { years: 20, label: "20년" },
                  { years: 30, label: "30년" },
                  { years: 40, label: "40년" },
                ].map(({ years, label }) => (
                  <button
                    key={years}
                    onClick={() => {
                      handleInputChange("desiredLoanPeriod", years);
                      handleInputChange("loanPeriod", years);
                    }}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      formData.desiredLoanPeriod === years
                        ? "bg-[#2b9d5c] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 상납 방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상납 방식
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { method: "원리금균등", label: "원리금균등" },
                  { method: "원금균등", label: "원금균등" },
                  { method: "만기일시", label: "만기일시" },
                ].map(({ method, label }) => (
                  <button
                    key={method}
                    onClick={() => handleInputChange("repayMethod", method)}
                    className={`py-3 rounded-xl font-medium transition-all text-sm ${
                      formData.repayMethod === method
                        ? "bg-[#2b9d5c] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="mt-auto pt-6">
            <div className="flex gap-3">
              <button
                onClick={onPrevious}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전
              </button>
              <button
                onClick={onNext}
                className="flex-1 bg-[#009071] hover:bg-[#007a5e] text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanConditionsStep;
