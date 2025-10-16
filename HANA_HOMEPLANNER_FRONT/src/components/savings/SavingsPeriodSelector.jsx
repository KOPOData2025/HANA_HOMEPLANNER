import React from 'react'
import { Calendar } from "lucide-react"

const SavingsPeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  periods 
}) => {
  return (
    <div>
      <label className="block text-lg font-semibold text-gray-800 mb-4">
        <Calendar className="w-5 h-5 inline mr-2" />
        저축 기간
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {periods.map((period) => (
          <label key={period} className="cursor-pointer">
            <input
              type="radio"
              name="period"
              value={period}
              checked={selectedPeriod === period}
              onChange={() => onPeriodChange(period)}
              className="sr-only"
            />
            <div className={`p-4 text-center border-2 rounded-xl transition-all ${
              selectedPeriod === period 
                ? 'border-teal-500 bg-teal-50 text-teal-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="font-semibold">{period}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default SavingsPeriodSelector
