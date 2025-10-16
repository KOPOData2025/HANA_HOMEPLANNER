import { useState, useEffect } from 'react';

export const useHeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);

  const SLIDE_INTERVAL = 5000; // 자동 슬라이딩 간격 (밀리초) - 5초
  const SLIDE_DURATION = 800; // 슬라이드 전환 애니메이션 지속시간 (밀리초) - 0.8초

  // 슬라이드 데이터
  const slides = [
    {
      id: 1,
      title: "실시간 청약 정보 & 지도",
      subtitle: "청약홈 API로 모든 정보를 한눈에",
      description: "전국 신축아파트 청약 정보를 실시간으로 제공합니다.\n지도에서 마커를 클릭하면 상세 정보와 납부금 구조까지 확인 가능합니다.",
      gradient: "custom-background",
      image: "/slide/h-main-c.png",
      imagePosition: "right"
    },
    {
      id: 2,
      title: "마이데이터 기반 금융 플랜",
      subtitle: "내 자산으로 최적의 청약 전략 수립",
      description: "현금, 대출, 적금, 예금을 종합 분석하여\n보수적/균형형/공격적 시나리오별 맞춤 플랜을 제공합니다.",
      gradient: "custom-purple",
      image: "/slide/h-loan-back.png",
      imagePosition: "left"
    },
    {
      id: 3,
      title: "나만의 청약 캘린더",
      subtitle: "반납 일정부터 소비 플랜까지",
      description: "청약 반납 일정을 등록하고 가계부를 작성하세요.\n상납 일정 알림과 다음 청약 대비 플랜까지 자동으로 관리됩니다.",
      gradient: "custom-cream",
      image: "/slide/h-plan.png",
      imagePosition: "right"
    },
    {
      id: 4,
      title: "자산 현황 대시보드",
      subtitle: "내 집 마련 달성률 실시간 확인",
      description: "자산 구성, 적금 진행률, DSR 현황을 시각화합니다.\n목표 금액 대비 현재 준비율로 동기부여를 제공합니다.",
      gradient: "from-teal-500 to-teal-600",
      image: "/slide/h-bu.png",
      imagePosition: "left"
    }
  ];

  // 자동 슬라이딩 효과
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        setCurrentSlide((prev) => {
          const nextIndex = (prev + 1) % slides.length;
          // 4→1 전환 시 prev 방향으로 설정 (왼쪽에서 오른쪽)
          if (prev === slides.length - 1 && nextIndex === 0) {
            setSlideDirection('prev');
          } else {
            setSlideDirection('next');
          }
          return nextIndex;
        });
      }
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length, isAnimating]);

  const handleSlideClick = (index) => {
    if (isAnimating || index === currentSlide) return;
    
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  // 애니메이션 시작/종료 처리
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const goToPreviousSlide = () => {
    if (isAnimating) return;
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    if (isAnimating) return;
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return {
    currentSlide,
    slideDirection,
    isAnimating,
    slides,
    handleSlideClick,
    goToPreviousSlide,
    goToNextSlide
  };
};
