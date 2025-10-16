import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSlider } from '@/hooks/useHeroSlider';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FinancialComparisonSection } from './FinancialComparisonSection';
import { LoginSection } from './LoginSection';
import { authService } from '@/services/authService';
import { setAuthTokens } from '@/lib/auth';
import toast from 'react-hot-toast';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 기본 불렛 스타일
const customStyles = `
  .swiper-pagination-bullet {
    background-color: #ffffff;
    opacity: 0.5;
    transition: all 0.3s ease;
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }
  .swiper-pagination-bullet-active {
    background-color: #ffffff;
    opacity: 1;
    width: 24px;
    height: 8px;
    border-radius: 4px;
  }
`;

export const HeroSlider = () => {
  const { slides } = useHeroSlider();
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      // Swiper 인스턴스가 준비되면 autoplay 시작
      swiperRef.current.swiper.autoplay.start();
    }
  }, []);

  // 슬라이드 변경 시 불렛 색상 변경
  const handleSlideChange = useCallback((swiper) => {
    // requestAnimationFrame을 사용하여 성능 최적화
    requestAnimationFrame(() => {
      const bullets = document.querySelectorAll('.swiper-pagination-bullet');
      const isThirdSlide = swiper.realIndex === 2; // 3번째 슬라이드 (0-based index)
      
      bullets.forEach((bullet, index) => {
        const isActive = bullet.classList.contains('swiper-pagination-bullet-active');
        
        if (isThirdSlide) {
          bullet.style.setProperty("background-color", "#525252", 'important');
          bullet.style.setProperty('opacity', '1', 'important');
        } else {
          bullet.style.setProperty('background-color', '#ffffff', 'important');
          bullet.style.setProperty('opacity', '0.5', 'important');
        }
        
        // 활성 불렛은 타원 형태로
        if (isActive) {
          bullet.style.setProperty('width', '24px', 'important');
          bullet.style.setProperty('height', '8px', 'important');
          bullet.style.setProperty('border-radius', '4px', 'important');
        } else {
          bullet.style.setProperty('width', '8px', 'important');
          bullet.style.setProperty('height', '8px', 'important');
          bullet.style.setProperty('border-radius', '4px', 'important');
        }
      });
    });
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', loginData);
    
    try {
      // 실제 API 호출
      const responseData = await authService.login(loginData.username, loginData.password);
      
      if (responseData.success) {
        // JWT 토큰과 사용자 정보를 저장
        setAuthTokens(responseData.data);
        
        // 로그인 성공 메시지
        toast.success(`${responseData.data.user.userNm}님, 환영합니다! 🎉`, {
          duration: 3000,
        });
        
        // 폼 초기화 및 닫기
        setShowLoginForm(false);
        setLoginData({ username: '', password: '' });
        
        // 상태 업데이트를 위한 이벤트 트리거 (이미 setAuthTokens에서 처리됨)
      } else {
        throw new Error(responseData.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      toast.error(error.message || "로그인에 실패했습니다.");
    }
  };

  const handleInputChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <style>{customStyles}</style>
      <section className="bg-gray-50 pb-4 sm:pb-6 lg:pb-8">
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-0">
          {/* Hero Slider - Full Width with Fixed Height */}
          <div className="w-full bg-white shadow-lg overflow-hidden relative">
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false
              }}
              speed={800}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              className="h-full"
              onSwiper={(swiper) => {
                // Swiper 인스턴스가 준비되면 autoplay 시작
                swiper.autoplay.start();
                // 초기 불렛 색상 설정
                handleSlideChange(swiper);
              }}
              onSlideChange={handleSlideChange}
            >
              {slides.map((slide) => (
                <SwiperSlide key={slide.id} className="h-full">
                  <div
                    className={`h-full flex items-center justify-center h-[500px] ${
                      slide.id === 1 ? 'text-white' : 
                      slide.id === 2 ? 'text-white' : 
                      slide.id === 3 ? 'text-gray-800' : 
                      'bg-gradient-to-r ' + slide.gradient + ' text-white'
                    }`}
                    style={
                      slide.id === 1 ? { 
                        backgroundImage: `url(/slide/h-main-b.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      } : 
                      slide.id === 2 ? { backgroundColor: '#5959F7' } : 
                      slide.id === 3 ? { backgroundColor: '#FFFDF7' } : {}
                    }
                  >
                    {/* 이미지와 텍스트 레이아웃 */}
                    <div className="w-full h-full flex items-center p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto">
                      {slide.imagePosition === "left" ? (
                        // 이미지 좌측, 텍스트 우측
                        <>
                          <div className="flex-1 flex items-center justify-center">
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className={`${slide.id === 1 || slide.id === 2 || slide.id === 3 || slide.id === 4 ? 'w-full h-auto max-w-none max-h-full' : 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64'} object-contain`}
                            />
                          </div>
                          <div className="flex-1 text-left pl-4 sm:pl-6 lg:pl-8 xl:pl-12">
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">
                              {slide.title}
                            </h2>
                            
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-3 sm:mb-4 md:mb-6 font-semibold">
                              {slide.subtitle}
                            </p>
                            
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed whitespace-pre-line opacity-90">
                              {slide.description}
                            </p>
                          </div>
                        </>
                      ) : (
                        // 텍스트 좌측, 이미지 우측
                        <>
                          <div className={`flex-1 text-left pr-4 sm:pr-6 lg:pr-8 xl:pr-12 ${
                            slide.id === 1 ? 'bg-black/40 p-4 sm:p-6 rounded-lg' : ''
                          }`}>
                            <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 ${
                              slide.id === 1 ? 'drop-shadow-lg' : ''
                            }`}>
                              {slide.title}
                            </h2>
                            
                            <p className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-3 sm:mb-4 md:mb-6 font-semibold ${
                              slide.id === 1 ? 'drop-shadow-md' : ''
                            }`}>
                              {slide.subtitle}
                            </p>
                            
                            <p className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed whitespace-pre-line opacity-90 ${
                              slide.id === 1 ? 'drop-shadow-md' : ''
                            }`}>
                              {slide.description}
                            </p>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <img 
                              src={slide.image} 
                              alt={slide.title}
                              className={`${slide.id === 1 || slide.id === 2 || slide.id === 3 || slide.id === 4 ? 'w-full h-auto max-w-none max-h-full' : 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64'} object-contain`}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              {/* Custom Pagination */}
              <div className="swiper-pagination !bottom-4"></div>
            </Swiper>

          </div>

          {/* Financial Comparison Section with Integrated Quick Menu */}
          <FinancialComparisonSection />
        </div>
      </div>
    </section>
    </>
  );
};

