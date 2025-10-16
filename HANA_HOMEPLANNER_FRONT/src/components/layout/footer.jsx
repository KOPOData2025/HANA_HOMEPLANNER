export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12 mt-8 sm:mt-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* 로고 및 회사 정보 */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <img
                src="/logo/hana-logo.png"
                alt="하나은행 로고"
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain filter brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-white leading-tight">
                  하나 홈 플래너
                </span>
                <span className="text-xs font-light text-gray-400 leading-tight">
                  HANA Home Planner
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Smart Financial Solutions for Your Future
            </p>
          </div>

          {/* 고객센터 */}
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
              고객센터
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div>전화: 1599-1111</div>
              <div>평일: 09:00 ~ 18:00</div>
              <div>토요일: 09:00 ~ 13:00</div>
              <div className="text-xs text-gray-500 mt-2">
                일요일 및 공휴일 휴무
              </div>
            </div>
          </div>

          {/* 바로가기 */}
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
              바로가기
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div className="hover:text-white cursor-pointer transition-colors">
                인터넷뱅킹
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                모바일뱅킹
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                영업점 찾기
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                금리 안내
              </div>
            </div>
          </div>

          {/* 법적 고지 */}
          <div>
            <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
              법적 고지
            </h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <div className="hover:text-white cursor-pointer transition-colors">
                개인정보처리방침
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                이용약관
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                보안센터
              </div>
              <div className="hover:text-white cursor-pointer transition-colors">
                사이버신고센터
              </div>
            </div>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            COPYRIGHT(C) 2024 HANABANK. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
            <span>서울특별시 중구 을지로 35</span>
            <span className="hidden sm:block">|</span>
            <span>사업자등록번호: 202-81-17945</span>
          </div>
        </div>
      </div>
    </footer>
  );
} 