import { useState } from "react";
import { Calendar, DollarSign, CreditCard, Home, Info } from "lucide-react";
import {
  calculateContractMoney,
  calculateInterimPayment,
  calculateBalancePayment,
} from "@/utils/paymentUtils";

export const PaymentInfoPanel = ({ selectedProperty, isVisible, onClose }) => {
  if (!isVisible || !selectedProperty) return null;

  /**
   * 안전한 원 단위 가격 파서
   * - "3억 5천", "3억", "5천", "3억5천만원", "490,000,000원", "490000000" 등 대부분 처리
   * - 반환값: number(원)
   */
  const parsePriceToWon = (input) => {
    if (!input) return 0;
    const s = String(input);

    // 억/천 패턴 우선 처리
    const billionMatch = s.match(/(\d+(?:\.\d+)?)\s*억/); // e.g., "3억", "3.5억"
    const thousandMatch = s.match(/(\d+(?:\.\d+)?)\s*천/); // e.g., "5천"

    const billion = billionMatch ? parseFloat(billionMatch[1]) : 0;
    const thousand = thousandMatch ? parseFloat(thousandMatch[1]) : 0;

    let wonFromKorean = 0;
    if (billion > 0 || thousand > 0) {
      // 1억 = 100,000,000원, 1천 = 10,000,000원
      wonFromKorean = Math.round(billion * 100_000_000 + thousand * 10_000_000);
    }

    // 숫자만 있는 경우(콤마/원/만원 등 제거)
    const digits = s.replace(/[^\d]/g, "");
    const wonFromDigits = digits ? parseInt(digits, 10) : 0;

    // 두 방식 중 더 그럴싸한 값을 채택 (문자열에 억/천이 있으면 wonFromKorean 우선)
    if (billion > 0 || thousand > 0) return wonFromKorean;
    return wonFromDigits;
  };

  // 원 단위를 억원 단위로 변환하는 함수
  const wonToBillion = (won) => won / 100_000_000;
  
  // 원 단위를 콤마가 포함된 원 단위로 포맷팅하는 함수
  const formatWonWithComma = (won) => won.toLocaleString('ko-KR') + '원';

  const priceWon = parsePriceToWon(selectedProperty.price);

  // 실제 데이터가 있으면 사용하고, 없으면 계산된 값 사용
  const actualSalePrice = selectedProperty.salePrice ? Number(selectedProperty.salePrice.replace(/,/g, '')) : priceWon;
  const actualContractMoney = selectedProperty.contractMoney ? Number(selectedProperty.contractMoney.replace(/,/g, '')) : calculateContractMoney(priceWon);
  const actualInterimPayment = selectedProperty.interimPayments && selectedProperty.interimPayments.length > 0 ? 
    selectedProperty.interimPayments.reduce((sum, payment) => sum + Number(payment.amount.replace(/,/g, '')), 0) : 
    calculateInterimPayment(priceWon);
  const actualBalancePayment = selectedProperty.balancePayment ? Number(selectedProperty.balancePayment.replace(/,/g, '')) : calculateBalancePayment(priceWon);

  // 기존 변수명 유지하되 실제 데이터 사용
  const contractMoney = actualContractMoney;
  const interimPayment = actualInterimPayment;
  const balancePayment = actualBalancePayment;

  // 인덱스 의존을 제거: 컴포넌트에서 스케줄을 직접 구성(유틸 결과와 1:1 매핑)
  const schedule = [
    {
      id: "contract",
      type: "계약금",
      description: "계약 체결 시 지급",
      percentage: "10%",
      amount: formatWonWithComma(contractMoney),
      icon: DollarSign,
      badgeClass: "bg-green-100",
      iconClass: "text-green-600",
      valueWon: contractMoney,
    },
    {
      id: "interim",
      type: "중도금",
      description: "계약 후 일정에 따른 분할 지급",
      percentage: "20%",
      amount: formatWonWithComma(interimPayment),
      icon: CreditCard,
      badgeClass: "bg-orange-100",
      iconClass: "text-orange-600",
      valueWon: interimPayment,
    },
    {
      id: "balance",
      type: "잔금",
      description: "입주 시 최종 지급",
      percentage: "70%",
      amount: formatWonWithComma(balancePayment),
      icon: Home,
      badgeClass: "bg-purple-100",
      iconClass: "text-purple-600",
      valueWon: balancePayment,
    },
  ];

  return (
    <div className={`fixed w-[500px] bg-white shadow-2xl border border-gray-200 rounded-lg z-50 transform transition-all duration-300 ease-in-out flex flex-col ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ 
      top: '220px',
      right: '70px',
      height: 'calc(100vh - 240px)'
    }}>
      <div className="bg-white flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-bold">지급 계획</h3>
                <p className="text-teal-100 text-sm">
                  {selectedProperty.complex} - {selectedProperty.price}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              aria-label="패널 닫기"
              title="패널 닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 통합 내용 */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 총 매매가 */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
            <h4 className="text-sm text-gray-600 mb-2">총 매매가</h4>
            <p className="text-3xl font-bold text-blue-600">
              {wonToBillion(priceWon).toFixed(1)}억원
            </p>
            <p className="text-sm text-gray-500 mt-1">
              해당 매물의 총 거래 금액
            </p>
          </div>

          {/* 지급 내역 요약 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h5 className="font-semibold text-green-800 mb-1">계약금</h5>
              <p className="text-lg font-bold text-green-600">
                {formatWonWithComma(contractMoney)}
              </p>
              <p className="text-xs text-green-600 mt-1">10%</p>
            </div>

            <div className="text-center bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h5 className="font-semibold text-orange-800 mb-1">중도금</h5>
              <p className="text-lg font-bold text-orange-600">
                {formatWonWithComma(interimPayment)}
              </p>
              <p className="text-xs text-orange-600 mt-1">20%</p>
            </div>

            <div className="text-center bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h5 className="font-semibold text-purple-800 mb-1">잔금</h5>
              <p className="text-lg font-bold text-purple-600">
                {formatWonWithComma(balancePayment)}
              </p>
              <p className="text-xs text-purple-600 mt-1">70%</p>
            </div>
          </div>

          {/* 지급 일정 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              지급 일정
            </h4>

            {schedule.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${p.badgeClass}`}
                      >
                        <Icon className={`w-5 h-5 ${p.iconClass}`} />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">
                          {p.type}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {p.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-teal-600">
                        {p.percentage}
                      </p>
                      <p className="text-sm text-gray-500">{p.amount}</p>
                    </div>
                  </div>

                  {/* 금액 정보 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        지급 금액:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatWonWithComma(p.valueWon)}
                      </span>
                    </div>
                  </div>

                  {/* 실제 지급 일정 정보 (중도금의 경우) */}
                  {p.id === "interim" && selectedProperty.interimPayments && selectedProperty.interimPayments.length > 0 && (
                    <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <h6 className="font-semibold text-orange-800 mb-2 text-sm">실제 중도금 지급 일정</h6>
                      <div className="space-y-2">
                        {selectedProperty.interimPayments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-orange-700">
                              {index + 1}차 ({payment.date})
                            </span>
                            <span className="font-semibold text-orange-800">
                              {Number(payment.amount.replace(/,/g, '')).toLocaleString('ko-KR')}원
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 실제 잔금 지급일 정보 */}
                  {p.id === "balance" && selectedProperty.balanceDate && (
                    <div className="mt-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-700">지급 예정일:</span>
                        <span className="font-semibold text-purple-800">
                          {selectedProperty.balanceDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 매물 상세 정보 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              매물 정보
            </h4>

            {/* 매물 기본 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">단지명:</span>
                  <p className="font-medium text-gray-800">
                    {selectedProperty.complex}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">매매가:</span>
                  <p className="font-medium text-gray-800">
                    {selectedProperty.price}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">유형:</span>
                  <p className="font-medium text-gray-800">
                    {selectedProperty.type}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">면적:</span>
                  <p className="font-medium text-gray-800">
                    {selectedProperty.size}
                  </p>
                </div>
              </div>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                주의사항
              </h5>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
                <li>계약금은 계약 체결 시 즉시 지급합니다.</li>
                <li>중도금은 계약 후 일정에 따라 분할 지급합니다.</li>
                <li>잔금은 입주 시 최종 지급합니다.</li>
                <li>각 단계별 지급 시한을 준수해야 합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
