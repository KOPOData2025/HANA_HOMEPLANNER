import React from 'react'

const TargetAmountInput = ({
  targetAmount,
  onTargetAmountChange,
  getFormattedTargetAmount
}) => {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-teal-800 mb-2">내 집 마련 목표금액</h3>
        <p className="text-sm text-teal-600">주택 분양가의 10%를 목표로 설정해보세요</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => onTargetAmountChange(e.target.value)}
            placeholder="목표금액을 입력하세요"
            className="w-full p-4 pr-20 text-lg font-semibold text-gray-800 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            만원
          </span>
        </div>
        
        {targetAmount && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-teal-200">
            <div className="text-center">
              <div className="text-sm text-teal-600 mb-1">설정된 목표금액</div>
              <div className="text-2xl font-bold text-teal-800">
                {getFormattedTargetAmount()}만원
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TargetAmountInput
