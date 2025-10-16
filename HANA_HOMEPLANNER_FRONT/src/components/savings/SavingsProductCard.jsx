import React from 'react'
import { ArrowRight } from "lucide-react"

const SavingsProductCard = ({ 
  product, 
  isSelected, 
  onSelect 
}) => {
  const IconComponent = product.icon

  return (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
        isSelected ? 'ring-4 ring-teal-200' : ''
      }`}
      onClick={() => onSelect(product.id)}
    >
      <div className={`bg-gradient-to-br ${product.color} ${product.hoverColor} text-white rounded-2xl p-6 shadow-lg transition-all duration-300`}>
        <div className="text-center mb-4">
          <div className="p-3 bg-white/20 rounded-xl inline-block mb-3">
            <IconComponent className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">{product.title}</h3>
          <p className="opacity-90 text-sm">{product.description}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-center text-xs mb-2 opacity-80">금리</div>
            <div className="font-bold text-lg text-center">{product.interestRate}</div>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="opacity-80">목표 금액:</span>
              <span className="font-medium">{product.targetAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">저축 기간:</span>
              <span className="font-medium">{product.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">월 납입:</span>
              <span className="font-medium">{product.minAmount} ~ {product.maxAmount}</span>
            </div>
          </div>
        </div>

        <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-white/30 text-sm">
          <span>가입하기</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default SavingsProductCard
