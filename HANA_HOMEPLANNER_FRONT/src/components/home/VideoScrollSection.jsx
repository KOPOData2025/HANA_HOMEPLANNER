import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoScroll } from '@/hooks/useVideoScroll';
import { CreditCard, PiggyBank, TrendingUp, Shield, Building2 } from 'lucide-react';

export const VideoScrollSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const sections = [
    {
             id: 0,
       title: "청약 전략 & 지역 추천",
       subtitle: "청약 가점 기반 맞춤형 추천",
       description: "청약 가점 기반으로 서울·경기·인천 유망 지역과 분양단지를 추천해드립니다. 지역별 청약 경쟁률과 당첨 확률을 분석하여 최적의 청약 전략을 제시합니다.",
       features: [
         "청약 가점 기반 지역 추천",
         "분양단지 상세 정보 제공",
         "청약 경쟁률 및 당첨 확률 분석",
         "맞춤형 청약 전략 수립"
       ],
       icon: Building2,
       iconBg: "bg-blue-100",
       gradient: "from-blue-500 to-blue-600",
       buttonText: "청약 전략 보기",
       route: "/savings-address",
       videoSrc: "/videos/hana_typing.mp4",
       imageSrc: "/slide/h-building.png"
    },
    {
      id: 1,
      title: "대출 한도 및 상환 진단",
      subtitle: "실시간 대출 한도 계산",
      description: "최대 6억 원 규제에 맞춰 신용과 소득으로 실시간 대출 가능 금액을 계산해드립니다. 월 상환 가능 금액과 대출 한도를 정확히 파악하여 안전한 대출 계획을 세울 수 있습니다.",
      features: [
        "실시간 대출 한도 계산",
        "월 상환금 시뮬레이션",
        "신용 점수별 금리 비교",
        "대출 상환 계획 수립"
      ],
      icon: CreditCard,
      iconBg: "bg-green-100",
      gradient: "from-green-500 to-green-600",
      buttonText: "대출 시뮬레이션",
      route: "/loan-simulation",
      videoSrc: "/videos/hana_typing.mp4",
      imageSrc: "/slide/h-loan-2.png"
    },
    {
      id: 2,
      title: "맞춤 적금 플래너",
      subtitle: "목표 달성을 위한 맞춤 전략",
      description: "소비 패턴 분석으로 불필요한 지출을 줄이고 주택 자금을 만들 수 있는 맞춤 적금 플랜을 제안합니다. 목표 금액 달성을 위한 체계적인 저축 전략을 제공합니다.",
      features: [
        "소비 패턴 분석",
        "맞춤형 적금 상품 추천",
        "목표 금액 달성 계획",
        "저축 진행률 추적"
      ],
      icon: PiggyBank,
      iconBg: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
      buttonText: "적금 플래너",
      route: "/savings-recommendation",
      videoSrc: "/slide/h-plan-2.png",
      imageSrc: "/slide/h-plan-2.png"
    },
    {
      id: 3,
      title: "시세 분석 & 투자 전략",
      subtitle: "실시간 시세 데이터 기반 분석",
      description: "실시간 부동산 시세 데이터를 기반으로 지역별 가격 동향과 투자 전략을 분석해드립니다. 매수/매도 타이밍과 지역별 투자 가치를 평가합니다.",
      features: [
        "실시간 시세 데이터 제공",
        "지역별 가격 동향 분석",
        "투자 가치 평가",
        "매수/매도 타이밍 제안"
      ],
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      gradient: "from-orange-500 to-orange-600",
      buttonText: "시세 분석 보기",
      route: "/market-analysis",
      videoSrc: "/slide/h-home-2.png",
      imageSrc: "/slide/h-home-2.png"
    }
  ];

  const {
    activeSection,
    isScrolling,
    scrollProgress,
    sectionProgress,
    videoRefs,
    sectionRefs
  } = useVideoScroll(sections.length);

  // 진행률 기반 애니메이션 계산 함수들
  const getProgressBasedOpacity = (sectionIndex, elementDelay = 0) => {
    const progress = sectionProgress[sectionIndex] || 0;
    // 55% 진행 시 모든 요소가 완전히 보이도록 조정
    const adjustedProgress = Math.max(0, progress - elementDelay);
    const opacity = Math.min(1, adjustedProgress / 0.55);
    // 55% 이상 진행되면 완전히 보이도록
    return progress >= 0.55 ? 1 : opacity;
  };

  const getProgressBasedTransform = (sectionIndex, elementDelay = 0) => {
    const progress = sectionProgress[sectionIndex] || 0;
    // 55% 진행 시 모든 요소가 원래 위치로 이동
    const adjustedProgress = Math.max(0, progress - elementDelay);
    const translateY = Math.max(0, (1 - adjustedProgress / 0.55) * 32);
    // 55% 이상 진행되면 원래 위치로
    return progress >= 0.55 ? 'translateY(0px)' : `translateY(${translateY}px)`;
  };

  const getProgressBasedScale = (sectionIndex, elementDelay = 0) => {
    const progress = sectionProgress[sectionIndex] || 0;
    // 55% 진행 시 모든 요소가 원래 크기로
    const adjustedProgress = Math.max(0, progress - elementDelay);
    const scale = 0.95 + (adjustedProgress / 0.55 * 0.05);
    // 55% 이상 진행되면 원래 크기로
    return progress >= 0.55 ? 1 : Math.min(1, scale);
  };

  // return (
  //   <section className="bg-white overflow-hidden relative">
  //            {/* 스크롤 진행률 표시 (디버깅용) - 나중에 필요할 수 있으므로 주석 처리 */}
  //      {/* <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
  //        <div>활성 섹션: {activeSection}</div>
  //        <div>현재 진행률: {(scrollProgress * 100).toFixed(1)}%</div>
  //        <div>섹션별 진행률:</div>
  //        {sectionProgress.map((progress, index) => (
  //          <div key={index} className="text-xs">
  //            섹션 {index}: {(progress * 100).toFixed(1)}%
  //          </div>
  //        ))}
  //        <div className="mt-2 pt-2 border-t border-gray-600">
  //          <div className="text-xs">동영상 정보:</div>
  //          {sections.map((section, idx) => (
  //            <div key={idx} className="text-xs">
  //              섹션 {idx}: {section.videoSrc}
  //            </div>
  //          ))}
  //        </div>
  //      </div> */}

  //     {/* 네비게이션 버튼 제거 - 사용자의 자연스러운 스크롤 허용 */}

  //     {/* 섹션 인디케이터 제거 - 사용자의 자연스러운 스크롤 허용 */}

  //     {sections.map((section, index) => (
  //       <div
  //         key={section.id}
  //         ref={el => sectionRefs.current[index] = el}
  //         data-index={index}
  //         className="min-h-[80vh] flex items-center justify-center relative"
  //         style={{
  //           opacity: Math.max(0.3, getProgressBasedOpacity(index, 0))
  //         }}
  //       >
  //         {/* 배경 그라데이션 */}
  //         <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-5`}></div>
          
  //         <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
  //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              
  //             {/* 텍스트 영역 */}
  //             <div className={`space-y-6 lg:space-y-8 ${
  //               index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
  //             }`}>
  //               <div 
  //                 className="transition-all duration-300 ease-out"
  //                 style={{
  //                   opacity: getProgressBasedOpacity(index, 0.1),
  //                   transform: getProgressBasedTransform(index, 0.1)
  //                 }}
  //               >
  //                 <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-800 leading-tight">
  //                   {section.title}
  //                 </h2>
  //               </div>
                
  //               <div 
  //                 className="transition-all duration-300 ease-out"
  //                 style={{
  //                   opacity: getProgressBasedOpacity(index, 0.2),
  //                   transform: getProgressBasedTransform(index, 0.2)
  //                 }}
  //               >
  //                 <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-600 mb-4">
  //                   {section.subtitle}
  //                 </h3>
  //                 <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
  //                   {section.description}
  //                 </p>
  //               </div>
                
  //               {/* 특징 목록 */}
  //               <div 
  //                 className="transition-all duration-300 ease-out"
  //                 style={{
  //                   opacity: getProgressBasedOpacity(index, 0.3),
  //                   transform: getProgressBasedTransform(index, 0.3)
  //                 }}
  //               >
  //                 <div className="space-y-3">
  //                   {section.features.map((feature, featureIndex) => (
  //                     <div 
  //                       key={featureIndex} 
  //                       className="flex items-center gap-3 transition-all duration-300 ease-out"
  //                       style={{
  //                         opacity: getProgressBasedOpacity(index, 0.3 + featureIndex * 0.05),
  //                         transform: getProgressBasedTransform(index, 0.3 + featureIndex * 0.05)
  //                       }}
  //                     >
  //                       <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.gradient}`}></div>
  //                       <span className="text-sm sm:text-base text-gray-700 font-medium">{feature}</span>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>
                
  //               <div 
  //                 className="transition-all duration-300 ease-out"
  //                 style={{
  //                   opacity: getProgressBasedOpacity(index, 0.5),
  //                   transform: getProgressBasedTransform(index, 0.5)
  //                 }}
  //               >
  //                 <button
  //                   onClick={() => navigate(section.route)}
  //                   className={`bg-gradient-to-r ${section.gradient} text-white px-8 py-4 lg:px-10 lg:py-5 rounded-full font-semibold text-lg lg:text-xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2`}
  //                 >
  //                   {section.buttonText}
  //                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  //                   </svg>
  //                 </button>
  //               </div>
  //             </div>
              
  //                            {/* 동영상/아이콘 영역 */}
  //              <div className={`relative ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
  //                <div 
  //                  className="transition-all duration-300 ease-out"
  //                  style={{
  //                    opacity: getProgressBasedOpacity(index, 0.1),
  //                    transform: `scale(${getProgressBasedScale(index, 0.1)})`
  //                  }}
  //                >
  //                                                                              {/* 첫 번째 섹션: 기존 동영상 표시 */}
  //                    {index === 0 && section.videoSrc && section.videoSrc.includes('.mp4') ? (
  //                     <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
  //                       {/* 동영상 배경 */}
  //                       <video
  //                         ref={el => videoRefs.current[index] = el}
  //                         className="w-full h-64 lg:h-80 xl:h-96 object-cover"
  //                         autoPlay
  //                         muted
  //                         loop
  //                         playsInline
  //                         poster={section.imageSrc}
  //                       >
  //                         <source src={section.videoSrc} type="video/mp4" />
  //                         {/* 동영상을 지원하지 않는 브라우저를 위한 폴백 */}
  //                         <img src={section.imageSrc} alt={section.title} className="w-full h-full object-cover" />
  //                       </video>
                        
  //                       {/* 동영상 오버레이 - 그라데이션만 (아이콘 제거) */}
  //                       <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-20`}></div>
  //                     </div>
  //                    ) : index === 1 && section.videoSrc && section.videoSrc.includes('.mp4') ? (
  //                     /* 두 번째 섹션: 동영상을 배경으로 재생 */
  //                     <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl h-64 lg:h-80 xl:h-96">
  //                       {/* 동영상을 배경으로 설정 */}
  //                       <video
  //                         ref={el => videoRefs.current[index] = el}
  //                         className="absolute inset-0 w-full h-full object-cover"
  //                         autoPlay
  //                         muted
  //                         loop
  //                         playsInline
  //                         poster={section.imageSrc}
  //                       >
  //                         <source src={section.videoSrc} type="video/mp4" />
  //                         {/* 동영상을 지원하지 않는 브라우저를 위한 폴백 */}
  //                         <img src={section.imageSrc} alt={section.title} className="absolute inset-0 w-full h-full object-cover" />
  //                       </video>
                        
  //                       {/* 동영상 오버레이 - 그라데이션만 */}
  //                       <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-5`}></div>
  //                     </div>
  //                  ) : (
  //                    /* 나머지 섹션들 - 아이콘 제거하고 배경만 */
  //                    <div className={`${section.iconBg} rounded-2xl lg:rounded-3xl p-8 lg:p-12 xl:p-16 relative overflow-hidden`}>
  //                      <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-20`}></div>
  //                      {/* 아이콘 제거 - 깔끔한 배경만 유지 */}
  //                    </div>
  //                  )}
  //                </div>
  //              </div>
  //           </div>
  //         </div>
          

  //       </div>
  //     ))}
  //   </section>
  // );
};
