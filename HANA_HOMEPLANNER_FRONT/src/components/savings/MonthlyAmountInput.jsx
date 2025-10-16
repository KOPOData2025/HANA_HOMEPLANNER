import React from 'react'
import { DollarSign } from "lucide-react"

const MonthlyAmountInput = ({ 
  monthlyAmount, 
  onAmountChange, 
  minAmount, 
  maxAmount 
}) => {
  const quickAmounts = ['10만원', '30만원', '50만원', '100만원']

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-800 mb-4">
        <DollarSign className="w-5 h-5 inline mr-2" />
        월 납입금액
      </label>
      <div className="relative">
        <input
          type="text"
          value={monthlyAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="납입할 금액을 입력하세요"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
        />
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">원</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        최소 {minAmount} ~ 최대 {maxAmount}
      </div>
      
      {/* 금액 버튼들 */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onAmountChange(amount.replace('원', ''))}
            className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {amount}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MonthlyAmountInput
