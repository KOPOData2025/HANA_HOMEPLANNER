import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, TrendingUp } from 'lucide-react';

export const FinancialComparisonSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-2 sm:py-4 lg:py-6 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-teal-200 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-blue-200 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-purple-200 rounded-full"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-green-200 rounded-full"></div>
      </div>
      <div className="w-full px-8 lg:px-16">
        {/* 빠른메뉴 섹션 */}
        <div className="py-2 sm:py-4 lg:py-6">
          {/* 빠른메뉴 섹션 - 오른쪽 정렬 */}
          <div className="flex justify-center">
            {/* 빠른메뉴 그리드 - 중앙 정렬 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center justify-center">
              {/* 그리드 장식 요소 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-30"></div>
              <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-25"></div>

              {/* 서비스 안내 문구 - 청약 지도 바로 옆 */}
              <div className="flex flex-col items-start justify-center h-full text-left p-4 bg-white rounded-lg ">
                <div className="relative">
                  {/* 장식적 배경 요소 */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full opacity-30"></div>
                  <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20"></div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 relative z-10">
                    청약부터 대출까지,
                    <br />
                    필요한 기능을 한눈에
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 relative z-10">
                    클릭하여 다양한 서비스를
                    <br />
                    바로 이용해보세요
                  </p>

                  {/* CTA 버튼 */}
                  <button
                    onClick={() => navigate("/market-analysis")}
                    className="group bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-full font-semibold text-xs hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative z-10"
                  >
                    서비스 둘러보기
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>

              {/* 청약 지도 보기 */}
              <div className="flex flex-col items-center">
                <div
                  className="relative shadow-md hover:shadow-xl transition-all duration-500 ease-out cursor-pointer group hover:z-10"
                  style={{
                    width: "180px",
                    height: "175px",
                    backgroundImage: "url(/quickmenu/home.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transform: "rotate(-2deg) translateY(-8px)",
                    marginLeft: "8px",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-2deg) translateY(-8px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-2deg) translateY(-8px) scale(1)";
                  }}
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-gray-800/80 rounded-xl transition-all duration-500 ease-out"></div>

                  {/* 호버 상태 - 상세 정보 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-4">
                        청약 지도 보기
                      </h4>
                      <button
                        className="text-white text-sm font-medium hover:text-gray-200 transition-colors duration-300 ease-out"
                        onClick={() => navigate("/market-analysis")}
                      >
                        서비스 바로가기 →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 카드 하단 서비스명 */}
                <div
                  className="mt-3 text-center"
                  style={{ transform: "rotate(-2deg)" }}
                >
                  <span className="text-gray-700 text-sm font-bold">
                    청약 지도
                  </span>
                </div>
              </div>
              
              {/* 대출 시뮬레이션 */}
              <div className="flex flex-col items-center">
                <div
                  className="relative shadow-md hover:shadow-xl transition-all duration-500 ease-out cursor-pointer group hover:z-10"
                  style={{
                    width: "180px",
                    height: "175px",
                    backgroundImage: "url(/quickmenu/loan.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transform: "rotate(1deg) translateY(4px)",
                    marginLeft: "-4px",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(1deg) translateY(4px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(1deg) translateY(4px) scale(1)";
                  }}
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-gray-800/80 rounded-xl transition-all duration-500 ease-out"></div>

                  {/* 호버 상태 - 상세 정보 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-4">
                        대출 시뮬레이션
                      </h4>
                      <button
                        className="text-white text-sm font-medium hover:text-gray-200 transition-colors duration-300 ease-out"
                        onClick={() => navigate("/loan-inquiry")}
                      >
                        서비스 바로가기 →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 카드 하단 서비스명 */}
                <div
                  className="mt-3 text-center"
                  style={{ transform: "rotate(1deg)" }}
                >
                  <span className="text-gray-700 text-sm font-bold">
                    대출 시뮬레이션
                  </span>
                </div>
              </div>

              {/* 내 집 마련 */}
              <div className="flex flex-col items-center">
                <div
                  className="relative shadow-md hover:shadow-xl transition-all duration-500 ease-out cursor-pointer group hover:z-10"
                  style={{
                    width: "180px",
                    height: "175px",
                    backgroundImage: "url(/quickmenu/plan.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transform: "rotate(-1deg) translateY(-4px)",
                    marginLeft: "6px",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-1deg) translateY(-4px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-1deg) translateY(-4px) scale(1)";
                  }}
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-gray-800/80 rounded-xl transition-all duration-500 ease-out"></div>

                  {/* 호버 상태 - 상세 정보 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-4">
                        내 집 마련
                      </h4>
                      <button
                        className="text-white text-sm font-medium hover:text-gray-200 transition-colors duration-300 ease-out"
                        onClick={() => navigate("/portfolio-recommendation")}
                      >
                        서비스 바로가기 →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 카드 하단 서비스명 */}
                <div
                  className="mt-3 text-center"
                  style={{ transform: "rotate(-1deg)" }}
                >
                  <span className="text-gray-700 text-sm font-bold">
                    내 집 마련
                  </span>
                </div>
              </div>

              {/* 마이캘린더 */}
              <div className="flex flex-col items-center">
                <div
                  className="relative shadow-md hover:shadow-xl transition-all duration-500 ease-out cursor-pointer group hover:z-10"
                  style={{
                    width: "180px",
                    height: "175px",
                    backgroundImage: "url(/quickmenu/saving.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transform: "rotate(2deg) translateY(8px)",
                    marginLeft: "-8px",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(2deg) translateY(8px) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(2deg) translateY(8px) scale(1)";
                  }}
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-gray-800/80 rounded-xl transition-all duration-500 ease-out"></div>

                  {/* 호버 상태 - 상세 정보 */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-white mb-4">
                        마이캘린더
                      </h4>
                      <button
                        className="text-white text-sm font-medium hover:text-gray-200 transition-colors duration-300 ease-out"
                        onClick={() => navigate("/my-calendar")}
                      >
                        서비스 바로가기 →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 카드 하단 서비스명 */}
                <div
                  className="mt-3 text-center"
                  style={{ transform: "rotate(2deg)" }}
                >
                  <span className="text-gray-700 text-sm font-bold">
                    마이캘린더
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
