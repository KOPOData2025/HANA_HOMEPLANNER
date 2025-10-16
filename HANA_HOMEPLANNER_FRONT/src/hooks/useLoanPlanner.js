/**
 * 대출 플래너 커스텀 훅
 * LTV 계산 API 연동 및 대출 플래너 상태 관리
 */

import { useState, useCallback, useMemo } from 'react';
import { calculateLTVComplete } from '@/services';
import useErrorNotification from './useErrorNotification';

export const useLoanPlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ltvResult, setLtvResult] = useState(null);
  const [error, setError] = useState(null);
  const [adjustments, setAdjustments] = useState({
    loanAmount: null,
    loanPeriod: 30,
    interestRate: null,
    repaymentType: 'principal_interest', // principal_interest, interest_only, principal_first
    stressRateMode: false
  });

  const { showError } = useErrorNotification();

  /**
   * LTV 계산 실행
   */
  const calculateLTV = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await calculateLTVComplete(formData);
      setLtvResult(result);
      
      // 조정값 초기화
      setAdjustments(prev => ({
        ...prev,
        loanAmount: result.desiredLoanAmount || result.maxAllowedLoanAmount,
        interestRate: result.stressRate || 3.5
      }));
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'LTV 계산 중 오류가 발생했습니다.';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  /**
   * 대출금액 조정
   */
  const adjustLoanAmount = useCallback((amount) => {
    setAdjustments(prev => ({
      ...prev,
      loanAmount: amount
    }));
  }, []);

  /**
   * 대출기간 조정
   */
  const adjustLoanPeriod = useCallback((period) => {
    setAdjustments(prev => ({
      ...prev,
      loanPeriod: period
    }));
  }, []);

  /**
   * 금리 조정
   */
  const adjustInterestRate = useCallback((rate) => {
    setAdjustments(prev => ({
      ...prev,
      interestRate: rate
    }));
  }, []);

  /**
   * 상환방식 조정
   */
  const adjustRepaymentType = useCallback((type) => {
    setAdjustments(prev => ({
      ...prev,
      repaymentType: type
    }));
  }, []);

  /**
   * 스트레스 금리 모드 토글
   */
  const toggleStressRateMode = useCallback(() => {
    setAdjustments(prev => ({
      ...prev,
      stressRateMode: !prev.stressRateMode,
      interestRate: !prev.stressRateMode 
        ? (ltvResult?.stressRate || 6.0)
        : (ltvResult?.interestRate || 3.5)
    }));
  }, [ltvResult]);

  /**
   * 조정된 월 상환액 계산
   */
  const calculateAdjustedMonthlyPayment = useCallback((loanAmount, period, rate) => {
    if (!loanAmount || !period || !rate) return 0;
    
    const monthlyRate = rate / 100 / 12;
    const totalMonths = period * 12;
    
    if (monthlyRate === 0) {
      return loanAmount / totalMonths;
    }
    
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
           (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }, []);

  /**
   * 조정된 DSR 계산
   */
  const calculateAdjustedDSR = useCallback((monthlyPayment, annualIncome) => {
    if (!monthlyPayment || !annualIncome) return 0;
    return (monthlyPayment * 12 / annualIncome) * 100;
  }, []);

  /**
   * 조정된 LTV 계산
   */
  const calculateAdjustedLTV = useCallback((loanAmount, housePrice) => {
    if (!loanAmount || !housePrice) return 0;
    return (loanAmount / housePrice) * 100;
  }, []);

  /**
   * 조정된 계산 결과
   */
  const adjustedResult = useMemo(() => {
    if (!ltvResult) return null;

    const currentLoanAmount = adjustments.loanAmount || ltvResult.desiredLoanAmount || ltvResult.maxAllowedLoanAmount;
    const currentRate = adjustments.interestRate || ltvResult.stressRate || 3.5;
    const currentPeriod = adjustments.loanPeriod || 30;

    const monthlyPayment = calculateAdjustedMonthlyPayment(currentLoanAmount, currentPeriod, currentRate);
    const dsr = calculateAdjustedDSR(monthlyPayment, ltvResult.annualIncome);
    const ltv = calculateAdjustedLTV(currentLoanAmount, ltvResult.housePrice);

    return {
      ...ltvResult,
      adjustedLoanAmount: currentLoanAmount,
      adjustedMonthlyPayment: monthlyPayment,
      adjustedDSR: dsr,
      adjustedLTV: ltv,
      adjustedInterestRate: currentRate,
      adjustedLoanPeriod: currentPeriod,
      adjustedRepaymentType: adjustments.repaymentType,
      stressRateMode: adjustments.stressRateMode
    };
  }, [ltvResult, adjustments, calculateAdjustedMonthlyPayment, calculateAdjustedDSR, calculateAdjustedLTV]);

  /**
   * 플랜 제안 생성
   */
  const generatePlanSuggestions = useCallback(() => {
    if (!ltvResult) return [];

    const maxLoan = ltvResult.maxAllowedLoanAmount;
    const currentLoan = adjustments.loanAmount || ltvResult.desiredLoanAmount || maxLoan;
    const housePrice = ltvResult.housePrice;

    return [
      {
        id: 'conservative',
        name: '보수적 플랜',
        description: '안전한 상환 여유를 확보하는 플랜',
        loanAmount: Math.min(maxLoan * 0.7, currentLoan * 0.8),
        color: 'green',
        features: ['낮은 DSR', '여유로운 상환', '안정성 우선']
      },
      {
        id: 'balanced',
        name: '균형형 플랜',
        description: '현실적이고 균형잡힌 플랜',
        loanAmount: Math.min(maxLoan * 0.85, currentLoan),
        color: 'blue',
        features: ['적정 DSR', '균형잡힌 상환', '현실적 목표']
      },
      {
        id: 'aggressive',
        name: '공격적 플랜',
        description: '최대한 활용하는 플랜',
        loanAmount: Math.min(maxLoan * 0.95, maxLoan),
        color: 'orange',
        features: ['높은 LTV 활용', '최대 대출', '성장 우선']
      },
      {
        id: 'couple',
        name: '부부 통합 플랜',
        description: '부부 소득 합산 기반 플랜',
        loanAmount: Math.min(maxLoan * 1.2, maxLoan * 1.5),
        color: 'purple',
        features: ['소득 합산', '기존 대출 통합', '가족 단위 계획']
      }
    ];
  }, [ltvResult, adjustments]);

  /**
   * 결과 초기화
   */
  const resetResult = useCallback(() => {
    setLtvResult(null);
    setError(null);
    setAdjustments({
      loanAmount: null,
      loanPeriod: 30,
      interestRate: null,
      repaymentType: 'principal_interest',
      stressRateMode: false
    });
  }, []);

  return {
    // 상태
    isLoading,
    ltvResult,
    error,
    adjustments,
    adjustedResult,
    
    // 액션
    calculateLTV,
    adjustLoanAmount,
    adjustLoanPeriod,
    adjustInterestRate,
    adjustRepaymentType,
    toggleStressRateMode,
    generatePlanSuggestions,
    resetResult,
    
    // 계산 함수
    calculateAdjustedMonthlyPayment,
    calculateAdjustedDSR,
    calculateAdjustedLTV
  };
};
