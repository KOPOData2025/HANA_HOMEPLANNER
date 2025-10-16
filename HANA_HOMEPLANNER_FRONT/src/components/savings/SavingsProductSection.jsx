import React from 'react'
import SavingsProductCard from './SavingsProductCard'
import { savingsProducts } from '@/data/savingsProducts'

const SavingsProductSection = ({ 
  selectedSavingsType, 
  onSavingsSelect 
}) => {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">적금 상품 선택</h2>
        <p className="text-lg text-gray-600">목적에 맞는 적금 상품을 선택해보세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {savingsProducts.map((product) => (
          <SavingsProductCard
            key={product.id}
            product={product}
            isSelected={selectedSavingsType === product.id}
            onSelect={onSavingsSelect}
          />
        ))}
      </div>
    </section>
  )
}

export default SavingsProductSection
