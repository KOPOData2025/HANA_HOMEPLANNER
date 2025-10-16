import React from 'react';

const HouseTypePanel = ({ 
  isVisible, 
  onClose, 
  houseName, 
  htmlContent 
}) => {
  if (!isVisible || !htmlContent) return null;

  // HTML에서 주택형별 정보 파싱
  const parseHouseTypes = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const cards = doc.querySelectorAll('.payment-card');
      
      const houseTypes = [];
      cards.forEach(card => {
        const header = card.querySelector('.card-header');
        const items = card.querySelectorAll('.list-item');
        
        if (header && items.length > 0) {
          const typeText = header.textContent.trim();
          const priceText = items[0]?.textContent || '';
          const contractText = items[1]?.textContent || '';
          
          // 가격 추출 (₩1,154,700,000 형태)
          const priceMatch = priceText.match(/₩([\d,]+)/);
          const price = priceMatch ? priceMatch[1] : '';
          
          // 계약금 추출
          const contractMatch = contractText.match(/₩([\d,]+)/);
          const contract = contractMatch ? contractMatch[1] : '';
          
          houseTypes.push({
            type: typeText,
            price: price,
            contract: contract
          });
        }
      });
      
      return houseTypes;
    } catch (error) {
      console.error('HTML 파싱 오류:', error);
      return [];
    }
  };

  const houseTypes = parseHouseTypes();

  return (
    <div className={`fixed w-[500px] bg-white shadow-2xl border border-gray-200 rounded-lg z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ 
      top: '220px',
      right: '20px',
      height: 'calc(100vh - 240px)'
    }}>
      <div className="bg-white flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-[#009071] to-[#007a5e] text-white p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xl font-bold mb-3 flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-25 rounded-lg flex items-center justify-center mr-3">
                  🏠
                </div>
                {houseName || '주택 정보'}
              </div>
              <div className="text-sm opacity-95 font-medium">주택형별 상세 정보</div>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-25 hover:bg-opacity-35 text-white rounded-xl w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="패널 닫기"
              title="패널 닫기"
            >
              ×
            </button>
          </div>
        </div>

        {/* 주택형별 정보 */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          {houseTypes.length > 0 ? (
            <div className="space-y-6">
              {houseTypes.map((house, index) => {
                // 주택형 파싱 (예: "🏠 주택형 45 (2~3층, 5세대)")
                const typeMatch = house.type.match(/주택형\s*(\d+[A-Z]*)/);
                const floorMatch = house.type.match(/\(([^)]+)\)/);
                
                const houseType = typeMatch ? typeMatch[1] : '정보없음';
                const floorInfo = floorMatch ? floorMatch[1] : '정보없음';

                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* 주택형 헤더 */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#009071] to-[#007a5e] rounded-xl flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-lg">{houseType}</span>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-gray-800 mb-1">
                            {houseType}형
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {floorInfo}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#009071] mb-1">
                          ₩{house.price ? Number(house.price.replace(/,/g, '')).toLocaleString() : '정보없음'}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          분양가
                        </div>
                      </div>
                    </div>
                    
                    {/* 납부 정보 카드들 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">₩</span>
                          </div>
                          <div className="text-blue-700 font-semibold text-sm">계약금</div>
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          ₩{house.contract ? Number(house.contract.replace(/,/g, '')).toLocaleString() : '정보없음'}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">📅</span>
                          </div>
                          <div className="text-green-700 font-semibold text-sm">중도금</div>
                        </div>
                        <div className="text-lg font-bold text-green-800">
                          분할 납부
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#009071] to-[#007a5e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                주택형 정보를 불러오는 중...
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                잠시만 기다려주세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseTypePanel;
