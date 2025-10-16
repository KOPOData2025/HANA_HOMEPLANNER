/**
 * 토스뱅크 스타일 단계별 진행 표시 컴포넌트
 */

import React from 'react';

const StepProgress = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="mb-8">
      {/* 토스뱅크 스타일 진행 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${(currentStep / totalSteps) * 100}%`
          }}
        ></div>
      </div>
      
      {/* 단계 표시 */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index + 1 <= currentStep 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1 < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-1 transition-colors duration-300 ${
              index + 1 <= currentStep ? 'text-blue-500 font-medium' : 'text-gray-400'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;
