import React from 'react';

/**
 * 빠른메뉴 버튼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {React.ReactNode} props.icon - 아이콘 요소
 * @param {string} props.label - 버튼 라벨
 * @param {string} props.className - 추가 CSS 클래스
 */
export const QuickMenuButton = ({ onClick, icon, label, className = "" }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 text-gray-700 hover:bg-gray-100 rounded-lg px-2 py-2 transition-all duration-200 text-xs font-medium ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
