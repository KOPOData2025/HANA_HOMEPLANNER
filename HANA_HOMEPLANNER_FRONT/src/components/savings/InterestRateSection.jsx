import React from 'react'
import { maxInterestRateInfo } from '@/data/savingsProducts'

const InterestRateSection = () => {
  return (
    <section className="py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
        {/* 최대 금리 표시 */}
        <div className="text-center mb-8">
          <div className="text-red-500 text-lg font-medium mb-2">{maxInterestRateInfo.maxRateLabel}</div>
          <div className="w-16 h-1 bg-red-500 mx-auto"></div>
        </div>

        {/* 금리 구성 요소들 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          {maxInterestRateInfo.components.map((component, index) => (
            <React.Fragment key={component.type}>
              {/* 금리 구성 요소 */}
              <div className="text-center">
                <div className={`w-20 h-20 ${component.color} rounded-full flex items-center justify-center mb-3 mx-auto`}>
                  <div className="text-2xl">{component.icon}</div>
                </div>
                <div className="text-sm text-gray-600 mb-1">{component.description}</div>
                <div className="text-xl font-bold text-gray-800">{component.rate}</div>
              </div>

              {/* 플러스 아이콘 (마지막 요소가 아닌 경우에만) */}
              {index < maxInterestRateInfo.components.length - 1 && (
                <div className="text-2xl font-bold text-gray-400">+</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 최종 계산 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400 mb-2">+</div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <div className="text-sm text-green-700 mb-1">{maxInterestRateInfo.additionalInfo.label}</div>
            <div className="text-lg font-bold text-green-800">
              {maxInterestRateInfo.additionalInfo.description}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InterestRateSection
