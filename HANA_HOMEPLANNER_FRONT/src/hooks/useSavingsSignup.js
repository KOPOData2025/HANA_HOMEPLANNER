import { useState, useCallback } from 'react';
import { createSavingsAccount, getAllUserAccounts, dateUtils } from '@/services/savingsAccountService';

/**
 * 적금 가입 관련 커스텀 훅
 * 관심사 분리: 데이터 로직과 UI 로직을 분리하여 재사용성과 테스트 용이성 향상
 */
export const useSavingsSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  /**
   * 입력 데이터 유효성 검사
   * @param {Object} data - 검사할 데이터
   * @returns {Object} 검사 결과
   */
  const validateSignupData = useCallback((data) => {
    const errors = {};

    console.log('🔍 validateSignupData 전체 데이터:', data);
    console.log('🔍 데이터 상세 분석:', {
      monthlyAmount: {
        value: data.monthlyAmount,
        type: typeof data.monthlyAmount,
        isString: typeof data.monthlyAmount === 'string',
        isNumber: typeof data.monthlyAmount === 'number'
      },
      termMonths: {
        value: data.termMonths,
        type: typeof data.termMonths,
        isString: typeof data.termMonths === 'string',
        isNumber: typeof data.termMonths === 'number'
      },
      preferredDay: {
        value: data.preferredDay,
        type: typeof data.preferredDay,
        isString: typeof data.preferredDay === 'string',
        isNumber: typeof data.preferredDay === 'number'
      },
      initialDeposit: {
        value: data.initialDeposit,
        type: typeof data.initialDeposit,
        isString: typeof data.initialDeposit === 'string',
        isNumber: typeof data.initialDeposit === 'number'
      }
    });

    // 데이터가 없거나 객체가 아닌 경우
    if (!data || typeof data !== 'object') {
      console.error('❌ validateSignupData: 잘못된 데이터 형식입니다:', data);
      return {
        isValid: false,
        errors: { general: '데이터 형식이 올바르지 않습니다.' }
      };
    }

    // 월 납입액 검증 (타입 안전하게 처리)
    if (!data.monthlyAmount || data.monthlyAmount === '') {
      errors.monthlyAmount = '월 납입액을 입력해주세요.';
    } else {
      console.log('🔍 월 납입액 처리:', {
        originalValue: data.monthlyAmount,
        originalType: typeof data.monthlyAmount
      });

      let monthlyAmountString = '';

      if (typeof data.monthlyAmount === 'string') {
        monthlyAmountString = data.monthlyAmount;
        console.log('✅ 문자열 형태로 처리');
      } else if (typeof data.monthlyAmount === 'number') {
        monthlyAmountString = data.monthlyAmount.toString();
        console.log('🔄 숫자를 문자열로 변환');
      } else {
        monthlyAmountString = String(data.monthlyAmount);
        console.log('⚠️ 기타 타입을 문자열로 변환');
      }

      // 문자열이 숫자로만 구성되어 있는지 확인
      const numericValue = monthlyAmountString.replace(/[^\d]/g, '');
      console.log('🔍 월 납입액 숫자 추출:', {
        originalString: monthlyAmountString,
        numericValue,
        hasDigits: !!numericValue
      });

      if (!numericValue) {
        errors.monthlyAmount = '올바른 월 납입액을 입력해주세요.';
      } else {
        const monthlyAmount = parseInt(numericValue);
        console.log('🔍 월 납입액 최종 검증:', {
          numericValue,
          monthlyAmount,
          isLessThanMinimum: monthlyAmount < 10000
        });

        if (monthlyAmount < 10000) {
          errors.monthlyAmount = '월 납입액은 최소 10,000원 이상이어야 합니다.';
        }
      }
    }

    // 가입 기간 검증 (타입 안전하게 처리)
    if (!data.termMonths || data.termMonths === '') {
      errors.termMonths = '가입 기간을 선택해주세요.';
    } else {
      console.log('🔍 가입 기간 처리:', {
        originalValue: data.termMonths,
        originalType: typeof data.termMonths
      });

      let termMonthsString = '';

      if (typeof data.termMonths === 'string') {
        termMonthsString = data.termMonths;
      } else if (typeof data.termMonths === 'number') {
        termMonthsString = data.termMonths.toString();
      } else {
        termMonthsString = String(data.termMonths);
      }

      const termMonths = parseInt(termMonthsString);
      console.log('🔍 가입 기간 최종 검증:', {
        termMonthsString,
        termMonths,
        isValidNumber: !isNaN(termMonths),
        isPositive: termMonths > 0
      });

      if (isNaN(termMonths) || termMonths <= 0) {
        errors.termMonths = '올바른 가입 기간을 선택해주세요.';
      }
    }

    // 자동이체 희망일 검증 (일자 1-31 검증)
    if (!data.preferredDay || data.preferredDay === '') {
      errors.preferredDay = '자동이체 희망일을 선택해주세요.';
    } else {
      console.log('🔍 자동이체 희망일 검증:', {
        preferredDay: data.preferredDay,
        preferredDayType: typeof data.preferredDay
      });

      const day = parseInt(data.preferredDay);
      
      if (isNaN(day) || day < 1 || day > 31) {
        console.log('❌ 자동이체 희망일 형식 오류:', { preferredDay: data.preferredDay, parsedDay: day });
        errors.preferredDay = '자동이체 희망일은 1일부터 31일까지 선택 가능합니다.';
      }
    }

    // 초기 입금액 검증 (선택사항이지만 입력된 경우)
    if (data.initialDeposit && data.initialDeposit !== '') {
      console.log('🔍 초기 입금액 처리:', {
        originalValue: data.initialDeposit,
        originalType: typeof data.initialDeposit
      });

      let initialDepositString = '';

      if (typeof data.initialDeposit === 'string') {
        initialDepositString = data.initialDeposit;
      } else if (typeof data.initialDeposit === 'number') {
        initialDepositString = data.initialDeposit.toString();
      } else {
        initialDepositString = String(data.initialDeposit);
      }

      const numericValue = initialDepositString.replace(/[^\d]/g, '');
      console.log('🔍 초기 입금액 숫자 추출:', {
        originalString: initialDepositString,
        numericValue,
        hasDigits: !!numericValue
      });

      if (numericValue) {
        const initialDeposit = parseInt(numericValue);
        if (initialDeposit < 0) {
          errors.initialDeposit = '초기 입금액은 0원 이상이어야 합니다.';
        }
      }
    }

    console.log('🔍 최종 검증 결과:', {
      isValid: Object.keys(errors).length === 0,
      errorCount: Object.keys(errors).length,
      errors: errors
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  /**
   * 사용자 모든 계좌 목록 조회 (입출금 + 적금)
   */
  const fetchAllAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    setError(null);
    
    try {
      const response = await getAllUserAccounts();
      
      if (response.success && response.data) {
        setAccounts(response.data);
        return response.data;
      } else {
        throw new Error(response.message || '계좌 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('계좌 목록 조회 오류:', err);
      setError(err.message || '계좌 목록을 불러오는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  /**
   * 적금 가입 처리
   * @param {Object} signupData - 가입 데이터
   * @param {string} signupData.productId - 상품 ID
   * @param {number} signupData.termMonths - 가입 기간 (개월)
   * @param {number} signupData.monthlyAmount - 월 납입액
   * @param {number} signupData.initialDeposit - 초기 입금액
   * @param {string|null} signupData.autoDebitAccountId - 자동이체 계좌번호
   * @param {number} signupData.preferredDay - 자동이체 희망일 (1-31)
   * @returns {Promise<Object>} 가입 결과
   */
  const submitSavingsSignup = useCallback(async (signupData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 사전 유효성 검사
      const validation = validateSignupData(signupData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }

      // startDate와 endDate 계산 (사용자가 선택한 자동이체일 기준)
      const today = new Date();
      const startDate = signupData.autoDebitDate || today.toISOString().split('T')[0];
      const endDate = dateUtils.addMonths(startDate, signupData.termMonths);
      
      console.log('📅 날짜 계산 결과:', {
        preferredDay: signupData.preferredDay,
        termMonths: signupData.termMonths,
        startDate,
        endDate,
        today: today.toISOString().split('T')[0]
      });
      
      // API 요청 데이터 구성
      console.log('🔍 signupData 확인:', {
        productId: signupData.productId,
        startDate,
        endDate,
        monthlyAmount: signupData.monthlyAmount,
        monthlyAmountType: typeof signupData.monthlyAmount,
        initialDeposit: signupData.initialDeposit,
        initialDepositType: typeof signupData.initialDeposit,
        autoDebitAccountId: signupData.autoDebitAccountId,
        autoDebitAccountIdType: typeof signupData.autoDebitAccountId
      });

      const apiData = {
        productId: signupData.productId,
        startDate,
        endDate,
        monthlyAmount: signupData.monthlyAmount,
        initialDeposit: signupData.initialDeposit || 0,
        autoDebitAccountId: signupData.autoDebitAccountId || null,
        autoDebitDate: signupData.autoDebitDate
      };

      console.log('💰 적금 가입 요청 데이터:', {
        ...apiData,
        originalPreferredDay: signupData.preferredDay,
        calculatedStartDate: startDate,
        calculatedEndDate: endDate,
        autoDebitAccountIdType: typeof signupData.autoDebitAccountId,
        autoDebitAccountIdValue: signupData.autoDebitAccountId
      });

      const response = await createSavingsAccount(apiData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '적금 가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('적금 가입 오류:', err);
      setError(err.message || '적금 가입 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [validateSignupData]);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    isLoading,
    error,
    accounts,
    isLoadingAccounts,
    
    // 액션
    fetchAllAccounts,
    submitSavingsSignup,
    validateSignupData,
    clearError
  };
};