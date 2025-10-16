import React, { useState } from 'react';
import { Heart, MapPin, Calendar, Building, Star } from 'lucide-react';

export const SubscriptionDataPanel = () => {
  const [favorites, setFavorites] = useState(new Set());

  // 좋아요 토글
  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // 모의 청약 데이터
  const subscriptionData = [
    {
      id: 1,
      type: '매매',
      price: '9000',
      deposit: '',
      monthly: '',
      roomType: '투룸',
      floor: '1층',
      area: '47m²',
      managementFee: '없음',
      description: '초역세권 거주중.귀한 1층',
      badges: ['플러스', '집주인 인증'],
      image: '/slide/h-building.png',
      location: '강남구 역삼동',
      availableDate: '즉시입주'
    },
    {
      id: 2,
      type: '월세',
      price: '',
      deposit: '7900',
      monthly: '45',
      roomType: '투룸',
      floor: '반지층',
      area: '57.04m²',
      managementFee: '1만',
      description: '가성비좋은방',
      badges: ['플러스', '집주인 인증'],
      image: '/slide/h-loan-2.png',
      location: '강남구 역삼동',
      availableDate: '즉시입주'
    },
    {
      id: 3,
      type: '월세',
      price: '',
      deposit: '300',
      monthly: '40',
      roomType: '원룸 단기',
      floor: '3층',
      area: '23.14m²',
      managementFee: '7만',
      description: 'The수원 -와..건조기까지 있다Vv',
      badges: ['풀옵션', '집주인 인증'],
      image: '/slide/h-plan-2.png',
      location: '강남구 역삼동',
      availableDate: '즉시입주'
    },
    {
      id: 4,
      type: '월세',
      price: '',
      deposit: '500',
      monthly: '40',
      roomType: '원룸',
      floor: '3층',
      area: '26.44m²',
      managementFee: '5만',
      description: '공실 신축건물 엘리베이터 주방분리...',
      badges: ['플러스', '집주인 인증'],
      image: '/slide/h-home-2.png',
      location: '강남구 역삼동',
      availableDate: '즉시입주'
    }
  ];

  // 가격 표시 포맷팅
  const formatPrice = (item) => {
    if (item.type === '매매') {
      return `${item.type} ${item.price}만원`;
    } else if (item.type === '월세') {
      return `${item.type} ${item.deposit}/${item.monthly}`;
    }
    return item.type;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">청약 매물</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="w-4 h-4" />
          <span>총 {subscriptionData.length}개</span>
        </div>
      </div>

      {/* 매물 목록 */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {subscriptionData.slice(0, 6).map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
            <div className="flex gap-2">
              {/* 이미지 영역 */}
              <div className="relative flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.roomType}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                {/* 좋아요 버튼 */}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-3 h-3 ${
                      favorites.has(item.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                {/* 특별 배지 */}
                {item.badges.includes('풀옵션') && (
                  <div className="absolute bottom-1 left-1">
                    <span className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded-full font-medium">
                      풀옵션
                    </span>
                  </div>
                )}
              </div>

              {/* 정보 영역 */}
              <div className="flex-1 min-w-0">
                {/* 가격 및 유형 */}
                <div className="mb-1">
                  <span className="text-sm font-bold text-gray-800">
                    {formatPrice(item)}
                  </span>
                </div>

                {/* 방 유형 */}
                <div className="mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {item.roomType}
                  </span>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-0.5 text-xs text-gray-600 mb-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.floor}, {item.area}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.availableDate}</span>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-xs text-gray-700 mb-1 line-clamp-1">
                  {item.description}
                </p>

                {/* 배지들 */}
                <div className="flex flex-wrap gap-1">
                  {item.badges.filter(badge => badge !== '풀옵션').map((badge, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded-full font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};
