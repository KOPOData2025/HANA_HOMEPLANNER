import { useRef, useEffect, useState, useCallback } from 'react';

export const useVideoScroll = (sectionsCount) => {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 현재 섹션의 스크롤 진행률 (0~1)
  const [sectionProgress, setSectionProgress] = useState(Array(sectionsCount).fill(0)); // 각 섹션별 진행률
  const videoRefs = useRef([]);
  const sectionRefs = useRef([]);
  const scrollTimeout = useRef(null);

  // 스크롤 진행률 계산 함수
  const calculateScrollProgress = useCallback(() => {
    const currentScrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // 현재 섹션 인덱스 계산
    const currentSectionIndex = Math.floor(currentScrollY / windowHeight);
    const clampedSectionIndex = Math.max(0, Math.min(currentSectionIndex, sectionsCount - 1));
    
    // 현재 섹션 내에서의 스크롤 진행률 (0~1)
    const sectionStartY = clampedSectionIndex * windowHeight;
    const sectionScrollY = currentScrollY - sectionStartY;
    const currentProgress = Math.max(0, Math.min(1, sectionScrollY / windowHeight));
    
    // 각 섹션별 진행률 계산
    const newSectionProgress = Array(sectionsCount).fill(0);
    for (let i = 0; i < sectionsCount; i++) {
      const sectionStart = i * windowHeight;
      const sectionEnd = (i + 1) * windowHeight;
      
      if (currentScrollY >= sectionEnd) {
        // 완전히 지나간 섹션
        newSectionProgress[i] = 1;
      } else if (currentScrollY >= sectionStart) {
        // 현재 진행 중인 섹션
        newSectionProgress[i] = (currentScrollY - sectionStart) / windowHeight;
      } else {
        // 아직 도달하지 않은 섹션
        newSectionProgress[i] = 0;
      }
    }
    
    // 현재 진행률을 섹션별 진행률과 동일한 비율로 조정 (55%에서 100%가 되도록)
    const adjustedCurrentProgress = Math.min(1, currentProgress / 0.55);
    
    setScrollProgress(adjustedCurrentProgress);
    setSectionProgress(newSectionProgress);
    
    return { currentProgress: adjustedCurrentProgress, sectionProgress: newSectionProgress, currentSectionIndex: clampedSectionIndex };
  }, [sectionsCount]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    // 스크롤 진행률 계산
    const { currentSectionIndex } = calculateScrollProgress();
    
    // 활성 섹션 업데이트
    if (currentSectionIndex !== activeSection) {
      setActiveSection(currentSectionIndex);
    }
    
    if (!isScrolling) {
      setIsScrolling(true);
    }

    // 스크롤이 멈춘 후 150ms 뒤에 상태 업데이트
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isScrolling, calculateScrollProgress, activeSection]);

  // Intersection Observer 설정
  useEffect(() => {
    const observerOptions = {
      threshold: 0.6,
      rootMargin: '0px 0px -15% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionIndex = parseInt(entry.target.dataset.index);
          setActiveSection(sectionIndex);
          
          // 동영상 재생/일시정지 제어
          if (videoRefs.current[sectionIndex]) {
            const video = videoRefs.current[sectionIndex];
            try {
              if (entry.isIntersecting) {
                // video.play().catch(e => console.log('Video play failed:', e));
              } else {
                // video.pause();
              }
            } catch (error) {
              console.log('Video control error:', error);
            }
          }
        }
      });
    }, observerOptions);

    // 각 섹션 관찰 시작
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [handleScroll]);

  return {
    activeSection,
    isScrolling,
    scrollProgress,
    sectionProgress,
    videoRefs,
    sectionRefs
  };
};
