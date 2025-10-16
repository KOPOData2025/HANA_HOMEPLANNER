/**
 * 토스뱅크 스타일 애니메이션 래퍼 컴포넌트
 */

import React from 'react';

const AnimatedStep = ({ children, isActive, direction = 'right' }) => {
  return (
    <div className={`transition-all duration-300 ease-out ${
      isActive 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4'
    }`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {children}
      </div>
    </div>
  );
};

export default AnimatedStep;
