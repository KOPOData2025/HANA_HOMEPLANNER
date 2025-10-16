import React from 'react'
import { CheckCircle } from "lucide-react"

const SavingsProductInfo = ({ product }) => {
  if (!product) return null

  const IconComponent = product.icon

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <div className={`bg-gradient-to-br ${product.color} text-white rounded-xl p-6 mb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{product.title}</h2>
            <p className="text-sm opacity-90">{product.description}</p>
          </div>
        </div>
        <div className="text-center py-3 bg-white/10 rounded-lg">
          <div className="text-2xl font-bold">{product.interestRate}</div>
          <div className="text-xs opacity-80">최대 우대금리</div>
        </div>
      </div>

      {/* 상품 특징 */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-3">상품 특징</h3>
        <div className="space-y-2">
          {product.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 가입 조건 */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3">가입 조건</h3>
        <div className="space-y-2">
          {product.conditions.map((condition, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-600">{condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SavingsProductInfo
