import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickMenuButton } from './QuickMenuButton';
import { quickMenuData } from '@/data/quickMenuData.jsx';

/**
 * 고정된 빠른메뉴 컴포넌트
 */
export const FixedQuickMenu = () => {
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3">
      {/* 구분선 */}
      <div className="border-t border-gray-400 mb-3 -mt-3"></div>
      
      {/* 빠른메뉴 버튼들 */}
      <div className="grid grid-cols-4 gap-2">
        {quickMenuData.map((menu) => (
          <QuickMenuButton
            key={menu.id}
            onClick={() => handleMenuClick(menu.path)}
            icon={menu.icon}
            label={menu.label}
          />
        ))}
      </div>
    </div>
  );
};
