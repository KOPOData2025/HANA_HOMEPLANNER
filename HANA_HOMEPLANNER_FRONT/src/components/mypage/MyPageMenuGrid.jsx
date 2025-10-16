import React from 'react';
import { 
  ArrowRight
} from 'lucide-react';

/**
 * 마이페이지 메뉴 그리드 컴포넌트
 * 주요 기능들에 대한 빠른 접근을 제공합니다.
 */
const MyPageMenuGrid = ({ 
  planSelectionsCount,
  houseLikesCount,
  accountsCount,
  onTogglePortfolio,
  onToggleHousing,
  onToggleAccounts,
  onToggleFinancial
}) => {
  const menuItems = [
    {
      id: 'portfolio',
      title: '포트폴리오',
      description: '저장된 포트폴리오 플랜',
      iconSrc: '/mypage/portfolio.png',
      count: planSelectionsCount,
      color: 'purple',
      onClick: onTogglePortfolio
    },
    {
      id: 'housing',
      title: '청약 관리',
      description: '관심 청약 현황',
      iconSrc: '/mypage/apply-home.png',
      count: houseLikesCount,
      color: 'blue',
      onClick: onToggleHousing
    },
    {
      id: 'accounts',
      title: '계좌 관리',
      description: '내 계좌 현황',
      iconSrc: '/mypage/bank-book.png',
      count: accountsCount,
      color: 'indigo',
      onClick: onToggleAccounts
    },
    {
      id: 'financial',
      title: '금융 상품',
      description: '적금 & 대출 현황',
      iconSrc: '/mypage/progress.png',
      count: 0, // 적금/대출 상품 수는 별도로 관리
      color: 'green',
      onClick: onToggleFinancial
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      purple: {
        bg: 'bg-purple-50',
        iconBg: 'bg-gradient-to-br from-purple-400 to-purple-500',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200'
      },
      blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200'
      },
      indigo: {
        bg: 'bg-indigo-50',
        iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
        text: 'text-indigo-600',
        hover: 'hover:bg-indigo-100',
        border: 'border-indigo-200'
      },
      green: {
        bg: 'bg-green-50',
        iconBg: 'bg-gradient-to-br from-green-400 to-green-500',
        text: 'text-green-600',
        hover: 'hover:bg-green-100',
        border: 'border-green-200'
      }
    };
    return colorMap[color] || colorMap.purple;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {menuItems.map((item) => {
        const colors = getColorClasses(item.color);
        
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`${colors.bg} ${colors.hover} ${colors.border} border rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-md group`}
          >
            {/* 아이콘, 텍스트, 화살표를 한 줄로 배치 */}
            <div className="flex items-center justify-between">
              {/* 아이콘 영역 - 좌측 */}
              <div className="flex-shrink-0">
                <img src={item.iconSrc} alt={item.title} className="w-16 h-16" />
              </div>
              
              {/* 텍스트 영역 - 중앙 */}
              <div className="text-right flex-1 mx-4">
                <h3 className={`text-lg font-bold ${colors.text} mb-1`}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
              
              {/* 화살표 영역 - 우측 */}
              <div className="flex items-center flex-shrink-0">
                <ArrowRight className={`w-4 h-4 ${colors.text} group-hover:translate-x-1 transition-transform`} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MyPageMenuGrid;
