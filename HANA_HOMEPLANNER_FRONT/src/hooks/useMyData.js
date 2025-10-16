/**
 * 마이데이터 조회 커스텀 훅
 * CI 값을 통한 사용자 금융 정보 조회 및 관리
 */

import { useState, useCallback } from 'react';
import { myDataService } from '@/services/myDataService';
import { getFinancialInstitution } from '@/utils/financialInstitutionUtils';

export const useMyData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myData, setMyData] = useState(null);

  /**
   * CI 값으로 마이데이터 조회
   * @param {string} ci - SMS 인증을 통해 받은 CI 값
   * @returns {Promise<Object>} 마이데이터 조회 결과
   */
  const fetchMyData = useCallback(async (ci) => {
    if (!ci) {
      setError('CI 값이 필요합니다.');
      return { success: false, message: 'CI 값이 필요합니다.' };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 마이데이터 조회 시작:', ci);
      const result = await myDataService.getMyDataByCi(ci);
      
      if (result.success) {
        // 금융기관 정보 매핑
        const processedData = processMyData(result.data);
        setMyData(processedData);
        console.log('✅ 마이데이터 조회 성공:', processedData);
        return { success: true, data: processedData, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMessage = err.message || '마이데이터 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 마이데이터 조회 오류:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 마이데이터 처리 및 금융기관 정보 매핑
   * @param {Object} rawData - 원본 마이데이터
   * @returns {Object} 처리된 마이데이터
   */
  const processMyData = (rawData) => {
    if (!rawData) return null;

    // 은행 계좌 정보 처리
    const processedBankAccounts = rawData.bankAccounts?.map(account => ({
      ...account,
      institution: getFinancialInstitution(account.orgCode)
    })) || [];

    // 카드 정보 처리
    const processedCards = rawData.cards?.map(card => ({
      ...card,
      institution: getFinancialInstitution(card.orgCode)
    })) || [];

    // 은행 대출 정보 처리
    const processedBankLoans = rawData.bankLoans?.map(loan => ({
      ...loan,
      institution: getFinancialInstitution(loan.orgCode)
    })) || [];

    // 카드 대출 정보 처리
    const processedCardLoans = rawData.cardLoans?.map(loan => ({
      ...loan,
      institution: getFinancialInstitution(loan.orgCode)
    })) || [];

    // 할부 대출 정보 처리
    const processedInstallmentLoans = rawData.installmentLoans?.map(loan => ({
      ...loan,
      institution: getFinancialInstitution(loan.orgCode)
    })) || [];

    // 보험 대출 정보 처리
    const processedInsuranceLoans = rawData.insuranceLoans?.map(loan => ({
      ...loan,
      institution: getFinancialInstitution(loan.orgCode)
    })) || [];

    // 자산 요약 계산 (새로운 구조에서는 summary에 totalAssets가 null일 수 있음)
    const calculateTotalAssets = () => {
      const bankBalance = processedBankAccounts.reduce((sum, account) => sum + (account.balanceAmt || 0), 0);
      return bankBalance;
    };

    const calculateTotalLiabilities = () => {
      const bankLoanBalance = processedBankLoans.reduce((sum, loan) => sum + (loan.balanceAmt || 0), 0);
      const cardLoanBalance = processedCardLoans.reduce((sum, loan) => sum + (loan.balanceAmt || 0), 0);
      const installmentLoanBalance = processedInstallmentLoans.reduce((sum, loan) => sum + (loan.balanceAmt || 0), 0);
      const insuranceLoanBalance = processedInsuranceLoans.reduce((sum, loan) => sum + (loan.balanceAmt || 0), 0);
      return bankLoanBalance + cardLoanBalance + installmentLoanBalance + insuranceLoanBalance;
    };

    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const netWorth = totalAssets - totalLiabilities;

    return {
      ...rawData,
      bankAccounts: processedBankAccounts,
      cards: processedCards,
      bankLoans: processedBankLoans,
      cardLoans: processedCardLoans,
      installmentLoans: processedInstallmentLoans,
      insuranceLoans: processedInsuranceLoans,
      // 계산된 자산 요약 정보 추가
      calculatedSummary: {
        totalAssets: totalAssets,
        totalLiabilities: totalLiabilities,
        netWorth: netWorth
      }
    };
  };

  /**
   * 도메인별 데이터 그룹화
   * @returns {Object} 도메인별 그룹화된 데이터
   */
  const getGroupedData = useCallback(() => {
    if (!myData) return null;

    return {
      banks: {
        accounts: myData.bankAccounts || [],
        loans: myData.bankLoans || [],
        count: (myData.bankAccounts?.length || 0) + (myData.bankLoans?.length || 0)
      },
      cards: {
        cards: myData.cards || [],
        loans: myData.cardLoans || [],
        count: (myData.cards?.length || 0) + (myData.cardLoans?.length || 0)
      },
      loans: {
        installment: myData.installmentLoans || [],
        insurance: myData.insuranceLoans || [],
        count: (myData.installmentLoans?.length || 0) + (myData.insuranceLoans?.length || 0)
      },
      insurance: {
        loans: myData.insuranceLoans || [],
        count: myData.insuranceLoans?.length || 0
      }
    };
  }, [myData]);

  /**
   * 금융기관별 데이터 그룹화
   * @returns {Object} 금융기관별 그룹화된 데이터
   */
  const getInstitutionGroupedData = useCallback(() => {
    if (!myData) return null;

    const institutionMap = {};

    // 모든 금융 상품을 하나의 배열로 합치기
    const allProducts = [
      ...(myData.bankAccounts || []).map(item => ({ ...item, type: 'account' })),
      ...(myData.cards || []).map(item => ({ ...item, type: 'card' })),
      ...(myData.bankLoans || []).map(item => ({ ...item, type: 'bankLoan' })),
      ...(myData.cardLoans || []).map(item => ({ ...item, type: 'cardLoan' })),
      ...(myData.installmentLoans || []).map(item => ({ ...item, type: 'installmentLoan' })),
      ...(myData.insuranceLoans || []).map(item => ({ ...item, type: 'insuranceLoan' }))
    ];

    // 금융기관별로 그룹화
    allProducts.forEach(product => {
      const orgCode = product.orgCode;
      if (!institutionMap[orgCode]) {
        institutionMap[orgCode] = {
          institution: product.institution,
          products: [],
          count: 0
        };
      }
      institutionMap[orgCode].products.push(product);
      institutionMap[orgCode].count++;
    });

    return institutionMap;
  }, [myData]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 데이터 초기화
   */
  const clearData = useCallback(() => {
    setMyData(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    myData,
    fetchMyData,
    getGroupedData,
    getInstitutionGroupedData,
    clearError,
    clearData
  };
};
