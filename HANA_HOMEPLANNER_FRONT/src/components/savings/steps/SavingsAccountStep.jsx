/**
 * 적금 가입 2단계: 초기입금액과 자동이체 계좌 설정 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, CreditCard, AlertCircle, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { accountService } from '@/services';

const SavingsAccountStep = ({ 
  productDetail, 
  signupData, 
  onNext, 
  onBack, 
  isSubmitting,
  isCompleted = false
}) => {
  const [formData, setFormData] = useState({
    initialDeposit: signupData.initialDeposit || '',
    autoDebitAccountId: signupData.autoDebitAccountId || '',
    paymentDay: signupData.paymentDay || ''
  });

  const [errors, setErrors] = useState({});
  const [userAccounts, setUserAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 계좌 목록 조회
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const result = await accountService.getMyAccounts();
        if (result.success) {
          // 입출금 계좌만 필터링 (DEMAND 타입)
          const demandAccounts = result.data.filter(account => 
            account.accountType === 'DEMAND' && account.balance > 0
          );
          setUserAccounts(demandAccounts);
        }
      } catch (error) {
        console.error('계좌 조회 오류:', error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // 사용 가능한 계좌 목록
  const availableAccounts = userAccounts;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.initialDeposit || formData.initialDeposit === '') {
      newErrors.initialDeposit = '초기입금액을 입력해주세요.';
    } else if (parseInt(formData.initialDeposit.replace(/,/g, '')) < 10000) {
      newErrors.initialDeposit = '초기입금액은 최소 1만원 이상이어야 합니다.';
    }

    if (!formData.autoDebitAccountId) {
      newErrors.autoDebitAccountId = '자동이체 계좌를 선택해주세요.';
    }

    if (!formData.paymentDay) {
      newErrors.paymentDay = '자동이체 희망일을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // 선택된 계좌의 계좌번호 찾기
      const selectedAccount = availableAccounts.find(acc => acc.accountId === formData.autoDebitAccountId);
      const accountNumber = selectedAccount ? selectedAccount.accountNum : null;
      
      // paymentDay를 preferredDay로 매핑하고 계좌번호도 함께 전달
      onNext({
        ...formData,
        preferredDay: formData.paymentDay,
        autoDebitAccountNumber: accountNumber
      });
    }
  };

  const formatCurrency = (amount) => {
    return parseInt(amount.toString().replace(/,/g, '')).toLocaleString();
  };

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">초기입금액: {formatCurrency(formData.initialDeposit)}원</p>
            <p className="text-sm text-gray-600">
              자동이체 계좌: {availableAccounts.find(acc => acc.accountId === formData.autoDebitAccountId)?.accountName || '선택된 계좌'}
            </p>
            <p className="text-sm text-gray-600">자동이체일: 매월 {formData.paymentDay}일</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            초기입금액 및 자동이체 설정
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 메인 질문 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            초기입금액을 설정해주세요
          </h2>
        </div>

        {/* 초기입금액 설정 */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#009071] underline underline-offset-2">
                {formData.initialDeposit || "10,000"}원
              </span>
            </div>
            {errors.initialDeposit && (
              <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.initialDeposit}
              </p>
            )}
          </div>

          {/* 금액 입력 */}
          <div className="mt-6">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                value={formData.initialDeposit}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  const formattedValue = value
                    ? parseInt(value).toLocaleString()
                    : "";
                  handleInputChange("initialDeposit", formattedValue);
                }}
                placeholder="예: 100,000"
                className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                  errors.initialDeposit ? "border-red-500" : "border-gray-300"
                }`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                원
              </span>
            </div>
          </div>

          {/* 빠른 금액 선택 */}
          <div className="mt-6">
            <div className="flex justify-center space-x-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() =>
                    handleInputChange("initialDeposit", amount.toLocaleString())
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    formData.initialDeposit === amount.toLocaleString()
                      ? "bg-[#009071] text-white border-[#009071]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#009071] hover:text-[#009071]"
                  }`}
                >
                  {amount >= 10000 ? `${amount / 10000}만원` : `${amount}원`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 자동이체 계좌 선택 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              자동이체 계좌를 선택해주세요
            </h3>
            <p className="text-sm text-gray-600">
              매월 적금액을 자동으로 이체할 계좌를 선택해주세요
            </p>
          </div>

          {isLoadingAccounts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009071] mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                계좌 정보를 불러오는 중...
              </p>
            </div>
          ) : availableAccounts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                사용 가능한 계좌가 없습니다
              </h4>
              <p className="text-gray-500 mb-4">
                자동이체를 위해 입출금 계좌가 필요합니다.
              </p>
              <button className="px-4 py-2 bg-[#009071] text-white rounded-lg hover:bg-[#007a5f] transition-colors text-sm font-medium">
                계좌 개설하기
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <select
                value={formData.autoDebitAccountId}
                onChange={(e) =>
                  handleInputChange("autoDebitAccountId", e.target.value)
                }
                className={`w-full px-4 py-3 text-center text-lg border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                  errors.autoDebitAccountId
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">계좌를 선택해주세요</option>
                {availableAccounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountTypeDescription} - {account.accountNum} (
                    {account.balance.toLocaleString()}원)
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.autoDebitAccountId && (
            <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.autoDebitAccountId}
            </p>
          )}
        </div>

        {/* 자동이체 희망일 선택 */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              자동이체 희망일을 선택해주세요
            </h3>
            <p className="text-sm text-gray-600">
              매월 자동이체를 받을 날짜를 선택해주세요
            </p>
          </div>

          <div className="text-center">
            <div className="inline-block">
              <span className="text-lg text-gray-700">매월 </span>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`text-lg font-semibold text-[#009071] underline underline-offset-2 hover:text-[#007a5f] transition-colors ${
                  errors.paymentDay ? "text-red-500" : ""
                }`}
              >
                {formData.paymentDay ? `${formData.paymentDay}일` : "날짜 선택"}
              </button>
              <span className="text-lg text-gray-700"> 에 자동이체</span>
            </div>
            {errors.paymentDay && (
              <p className="mt-2 text-sm text-red-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.paymentDay}
              </p>
            )}

            {/* 달력 패널 */}
            {showDatePicker && (
              <div className="mt-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md mx-auto">
                <div className="grid grid-cols-7 gap-2">
                  {/* 요일 헤더 */}
                  {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ))}

                  {/* 날짜 그리드 */}
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        handleInputChange("paymentDay", day.toString());
                        setShowDatePicker(false);
                      }}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        formData.paymentDay === day.toString()
                          ? "bg-[#009071] text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* 확인 버튼 */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 bg-[#009071] text-white rounded-lg hover:bg-[#007a5f] transition-colors text-sm"
                  >
                    확인
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 다음 단계 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-[#009071] text-white px-12 py-4 rounded-full hover:bg-[#007a5f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                처리 중...
              </>
            ) : (
              <>
                계속
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsAccountStep;
