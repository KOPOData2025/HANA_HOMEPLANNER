/**
 * 마커 스타일별 CSS 및 HTML 생성 유틸리티
 */

/**
 * 마커 스타일별 CSS 생성
 */
export const getMarkerCSS = (styleId, size = 40) => {
  const styles = {
    classic: `
      .custom-marker-${styleId} {
        position: relative;
        width: ${size * 1.2}px;
        height: ${size * 0.8}px;
        background: #009071;
        margin: ${size * 0.5}px auto 0px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .custom-marker-${styleId}:hover {
        transform: scale(1.1);
      }
      
      .custom-marker-container-${styleId}:hover::after {
        transform: scale(1.5);
      }
      
       /* 호버 툴팁 스타일 */
       .custom-marker-container-${styleId}:hover .marker-tooltip {
         opacity: 1;
         visibility: visible;
         transform: translateX(-50%) translateY(calc(-50% + 15px));
       }
      
       .marker-tooltip {
         position: absolute;
         bottom: 100%;
         left: 50%;
         transform: translateX(-50%) translateY(calc(-50% + 15px));
         background: rgba(0, 0, 0, 0.9);
         color: white;
         padding: 8px 12px;
         border-radius: 8px;
         font-size: 12px;
         font-weight: 500;
         white-space: nowrap;
         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
         opacity: 0;
         visibility: hidden;
         transition: all 0.3s ease;
         z-index: 999999;
         pointer-events: none;
         min-width: 120px;
         text-align: left;
       }
      
      .marker-tooltip-title {
        font-weight: 700;
        font-size: 13px;
        margin-bottom: 2px;
        color: #ffffff;
      }
      
      .marker-tooltip-subtitle {
        font-weight: 400;
        font-size: 11px;
        color: #e5e7eb;
        opacity: 0.9;
      }
      
      .marker-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid rgba(0, 0, 0, 0.9);
      }
      
      .custom-marker-${styleId}:before {
        content: '';
        position: absolute;
        top: ${-size * 0.38}px;
        left: ${-size * 0.11}px;
        width: 0;
        height: 0;
        border-left: ${size * 0.72}px solid transparent;
        border-right: ${size * 0.72}px solid transparent;
        border-bottom: ${size * 0.42}px solid #009071;
      }
      
      
       /* 좌표 포인터용 컨테이너 */
       .custom-marker-container-${styleId} {
         position: relative;
         display: inline-block;
         z-index: 10000;
       }
       
       .custom-marker-container-${styleId}:hover {
         z-index: 99999;
       }
      
      /* 좌표 포인터 (좌측 하단 90도 직각삼각형) */
      .custom-marker-container-${styleId}::after {
        content: '';
        position: absolute;
        bottom: ${size * -0.16}px;
        left: ${size * 0}px;
        width: 0;
        height: 0;
        border-left: ${size * 0.18}px solid #009071;
        border-bottom: ${size * 0.18}px solid transparent;
        z-index: 2;
      }
      
      .marker-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: ${size * 0.18}px;
        font-weight: 700;
        text-align: center;
        white-space: pre-line;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: ${size * 1.0}px;
        max-height: ${size * 0.7}px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        z-index: 2;
        line-height: 1.2;
      }
      
      .marker-area-text {
        color:rgb(235, 238, 243);
        font-size: ${size * 0.18}px;
        font-weight: 500;
        line-height: 1;
        margin-bottom: 1px;
        text-align: center;
        display: block;
      }
      
      .marker-price-text {
        color: white;
        font-size: ${size * 0.2}px;
        font-weight: 700;
        line-height: 1;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        text-align: center;
        display: block;
      }
    `,
  };

  return styles[styleId] || styles.classic;
};

/**
 * 마커 HTML 생성
 */
export const createMarkerHTML = (styleId, size = 40, additionalClasses = '', text = '') => {
  return `
    <div class="custom-marker-container-${styleId}">
      <div class="custom-marker-${styleId} ${additionalClasses}">
        ${text ? `<div class="marker-text">${text}</div>` : ''}
      </div>
    </div>
  `;
};

/**
 * 평수와 금액을 분리하여 마커 HTML 생성 (툴팁 포함)
 */
export const createMarkerHTMLWithSeparateText = (styleId, size = 40, additionalClasses = '', areaText = '', priceText = '', tooltipTitle = '', tooltipSubtitle = '') => {
  return `
    <div class="custom-marker-container-${styleId}">
      <div class="custom-marker-${styleId} ${additionalClasses}" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        ${areaText ? `<div class="marker-area-text">${areaText}</div>` : ''}
        ${priceText ? `<div class="marker-price-text">${priceText}</div>` : ''}
      </div>
      ${tooltipTitle ? `
        <div class="marker-tooltip">
          <div class="marker-tooltip-title">${tooltipTitle}</div>
          ${tooltipSubtitle ? `<div class="marker-tooltip-subtitle">${tooltipSubtitle}</div>` : ''}
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * JSON 데이터를 기반으로 마커 표시 텍스트 생성
 */
export const createMarkerTextFromJson = (jsonData) => {
  if (!jsonData) return '';
  
  try {
    console.log('🔍 createMarkerTextFromJson - 입력 데이터:', jsonData);
    
    // 새로운 API 구조인지 확인
    const isNewApiStructure = jsonData.houseType && jsonData.specialSupplyCount;
    
    if (isNewApiStructure) {
      console.log('🔍 새로운 API 구조 감지 - supplyPriceInfo 데이터 사용');
      
      // 새로운 API 구조에서 주택형과 가격 정보 추출
      const supplyPriceInfo = jsonData.supplyPriceInfo || {};
      const houseTypes = supplyPriceInfo.houseTypes || [];
      
      if (houseTypes.length === 0) {
        console.log('⚠️ 주택형 정보 없음');
        return { areaRange: '정보없음', priceRange: '정보없음' };
      }
      
      // 평수 및 가격 범위 계산
      let minArea = Infinity;
      let maxArea = 0;
      let minTotalPrice = Infinity;
      let maxTotalPrice = 0;
      
      houseTypes.forEach(houseType => {
        // 주택형에서 숫자 추출 (예: "84A" -> 84, "118" -> 118)
        const areaMatch = houseType.type?.match(/(\d+)/);
        if (areaMatch) {
          const area = parseInt(areaMatch[1]);
          minArea = Math.min(minArea, area);
          maxArea = Math.max(maxArea, area);
        }
        
        // 가격 계산 (계약금 + 중도금 + 잔금)
        const contractAmounts = houseType.contractAmounts || [];
        const intermediateAmounts = houseType.intermediateAmounts || [];
        const balanceAmounts = houseType.balanceAmounts || [];
        
        // 최대/최소 가격 계산 (올바른 계산 방식: 계약금 + (중도금 × 횟수) + 잔금)
        if (contractAmounts.length > 0 && intermediateAmounts.length > 0 && balanceAmounts.length > 0) {
          const minContract = Math.min(...contractAmounts);
          const maxContract = Math.max(...contractAmounts);
          const minIntermediate = Math.min(...intermediateAmounts);
          const maxIntermediate = Math.max(...intermediateAmounts);
          
          // 중도금 납부 횟수를 paymentDates에서 계산 (더 정확함)
          const paymentDates = jsonData.supplyPriceInfo?.paymentDates || [];
          const intermediatePaymentCount = paymentDates.filter(payment => 
            payment.type && payment.type.includes('중도금')
          ).length;
          
          // paymentDates가 없는 경우 폴백: intermediateAmounts 길이를 주택형 개수로 나누기
          const fallbackPaymentCount = intermediateAmounts.length > 4 ? 
            Math.ceil(intermediateAmounts.length / houseTypes.length) : intermediateAmounts.length;
          
          // 잔금은 문자열 범위로 되어 있음 (예: "139230000~167405000")
          let minBalance = 0, maxBalance = 0;
          if (balanceAmounts[0]) {
            const balanceValue = balanceAmounts[0];
            
            if (typeof balanceValue === 'string' && balanceValue.includes('~')) {
              const balanceRange = balanceValue.split('~');
              if (balanceRange.length === 2) {
                minBalance = parseInt(balanceRange[0]);
                maxBalance = parseInt(balanceRange[1]);
              } else {
                minBalance = maxBalance = parseInt(balanceRange[0]);
              }
            } else if (typeof balanceValue === 'string') {
              minBalance = maxBalance = parseInt(balanceValue);
            } else if (typeof balanceValue === 'number') {
              minBalance = maxBalance = balanceValue;
            } else {
              console.warn('⚠️ markerUtils - 잘못된 balanceAmounts 형식:', balanceValue, typeof balanceValue);
              minBalance = maxBalance = 0;
            }
          }
          
          // 실제 사용할 중도금 납부 횟수 결정
          const actualPaymentCount = intermediatePaymentCount > 0 ? intermediatePaymentCount : fallbackPaymentCount;
          
          // 올바른 총액 계산: 계약금 + (중도금 × 실제 납부 횟수) + 잔금
          const totalMinPrice = minContract + (minIntermediate * actualPaymentCount) + minBalance;
          const totalMaxPrice = maxContract + (maxIntermediate * actualPaymentCount) + maxBalance;
          
          minTotalPrice = Math.min(minTotalPrice, totalMinPrice);
          maxTotalPrice = Math.max(maxTotalPrice, totalMaxPrice);
        }
      });
      
      // 범위 문자열 생성
      const areaRange = minArea === maxArea ? `${minArea}m²` : `${minArea}~${maxArea}m²`;
      
      // 가격 범위 생성 (억 단위)
      let priceRange = '정보없음';
      if (minTotalPrice !== Infinity && maxTotalPrice !== 0) {
        const minPriceInEok = Math.floor(minTotalPrice / 100000000);
        const maxPriceInEok = Math.floor(maxTotalPrice / 100000000);
        priceRange = minPriceInEok === maxPriceInEok ? `${minPriceInEok}억` : `${minPriceInEok}억~${maxPriceInEok}억`;
      }
      
      console.log('✅ 새로운 API 구조 마커 텍스트 생성:', { areaRange, priceRange });
      
      return { areaRange, priceRange };
    } else {
      console.log('🔍 기존 API 구조 감지 - 공급 금액 및 납부일 데이터 사용');
      
      // 기존 구조 처리
      const housingTypes = jsonData['공급 금액 및 납부일']?.주택형 || [];
      
      if (!housingTypes || housingTypes.length === 0) {
        console.log('⚠️ 기존 구조에서 주택형 정보 없음');
        return { areaRange: '정보없음', priceRange: '정보없음' };
      }

      // 평수 범위 계산
      let minArea = Infinity;
      let maxArea = 0;
      let minTotalPrice = Infinity;
      let maxTotalPrice = 0;

      housingTypes.forEach(type => {
        // 평수 추출 (타입에서 숫자 부분)
        const typeMatch = type.타입?.match(/(\d+)/);
        if (typeMatch) {
          const area = parseInt(typeMatch[1]);
          minArea = Math.min(minArea, area);
          maxArea = Math.max(maxArea, area);
        }

        // 총 가격 계산
        const contractPrices = type.계약금 || [];
        const middlePrices = type.중도금 || [];
        const finalPrice = type.잔금 || 0;
        
        const totalPrice = contractPrices.reduce((sum, price) => sum + price, 0) +
                          middlePrices.reduce((sum, price) => sum + price, 0) +
                          finalPrice;

        minTotalPrice = Math.min(minTotalPrice, totalPrice);
        maxTotalPrice = Math.max(maxTotalPrice, totalPrice);
      });

      // 억 단위로 변환
      const minPriceInEok = Math.floor(minTotalPrice / 100000000);
      const maxPriceInEok = Math.floor(maxTotalPrice / 100000000);

      // 범위 문자열 생성 (평을 m²로 변경)
      const areaRange = minArea === maxArea ? `${minArea}m²` : `${minArea}~${maxArea}m²`;
      const priceRange = minPriceInEok === maxPriceInEok ? `${minPriceInEok}억` : `${minPriceInEok}억~${maxPriceInEok}억`;

      console.log('✅ 기존 API 구조 마커 텍스트 생성:', { areaRange, priceRange });
      
      return { areaRange, priceRange };
    }
  } catch (error) {
    console.error('마커 텍스트 생성 오류:', error);
    return { areaRange: '정보없음', priceRange: '정보없음' };
  }
};

/**
 * 마커 스타일을 DOM에 추가
 */
export const injectMarkerStyles = (styleId, size = 40) => {
  // 기존 스타일 제거
  const existingStyle = document.getElementById(`marker-style-${styleId}`);
  if (existingStyle) {
    existingStyle.remove();
  }

  // 새 스타일 추가
  const style = document.createElement('style');
  style.id = `marker-style-${styleId}`;
  style.textContent = getMarkerCSS(styleId, size);
  document.head.appendChild(style);
};

/**
 * 모든 마커 스타일 정리
 */
export const cleanupMarkerStyles = () => {
  const markerStyles = document.querySelectorAll('[id^="marker-style-"]');
  markerStyles.forEach(style => style.remove());
};

/**
 * 카카오맵 커스텀 오버레이용 마커 생성
 */
export const createKakaoMarkerOverlay = (kakao, map, position, styleId, size = 40, onClick = null) => {
  // 스타일 주입
  injectMarkerStyles(styleId, size);
  
  // 마커 HTML 생성
  const markerHTML = createMarkerHTML(styleId, size, 'kakao-custom-marker');
  
  // 커스텀 오버레이 생성
  const customOverlay = new kakao.maps.CustomOverlay({
    position: position,
    content: markerHTML,
    yAnchor: 1, // 마커의 하단이 좌표에 맞춰지도록
    clickable: true
  });
  
  // 클릭 이벤트 추가
  if (onClick) {
    const overlayElement = customOverlay.getContent();
    if (overlayElement) {
      overlayElement.addEventListener('click', onClick);
    }
  }
  
  return customOverlay;
};

/**
 * 마커 스타일 목록
 */
export const MARKER_STYLES = {
  classic: '클래식',
  modern: '모던',
  minimal: '미니멀',
  '3d': '3D',
  animated: '애니메이션',
  gradient: '그라디언트'
};
