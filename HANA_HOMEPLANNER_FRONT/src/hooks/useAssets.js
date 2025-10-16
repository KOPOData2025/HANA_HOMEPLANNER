/**
 * 자산 관리 커스텀 훅
 * 데이터 로직과 UI 로직을 분리하여 재사용성 향상
 */

import { useState, useEffect, useCallback } from 'react';
import { assetsService } from '@/services/assetsService';
import useErrorNotification from './useErrorNotification';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { shouldShowErrorToUser, getUserFriendlyErrorMessage, logError, isAuthError } from '@/utils/errorHandler';

export const useAssets = () => {
  const [assetsData, setAssetsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();
  const navigate = useNavigate();

  // 자산 데이터 조회
  const fetchAssetsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 로그인 상태 먼저 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔇 [useAssets] 토큰 없음 - API 호출 중단');
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 useAssets - 토큰 상태:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? token.substring(0, 20) + '...' : '없음'
      });
      
      const response = await assetsService.getMyTotalAssets();
      console.log('🔍 useAssets - API 응답:', response);
      
      // 새로운 API 응답 형식에 맞게 데이터 변환
      if (response.success && response.data) {
        const apiData = response.data;
        
        // 자산 상세 정보에 백분율 계산 추가
        const assetsDetails = apiData.assets?.details?.map(asset => ({
          ...asset,
          percentage: apiData.assets.total > 0 ? (asset.balance / apiData.assets.total) * 100 : 0
        })) || [];
        
        // 부채 상세 정보에 백분율 계산 추가
        const liabilitiesDetails = apiData.liabilities?.details?.map(liability => ({
          ...liability,
          percentage: apiData.liabilities.total > 0 ? (liability.balance / apiData.liabilities.total) * 100 : 0
        })) || [];
        
        const transformedData = {
          summary: {
            netWorth: apiData.summary?.netWorth || 0,
            totalAssets: apiData.summary?.totalAssets || 0,
            totalLiabilities: apiData.summary?.totalLiabilities || 0,
            lastUpdated: apiData.summary?.lastUpdated || new Date().toISOString()
          },
          assets: {
            total: apiData.assets?.total || 0,
            breakdown: apiData.assets?.breakdown || {},
            details: assetsDetails
          },
          liabilities: {
            total: apiData.liabilities?.total || 0,
            breakdown: apiData.liabilities?.breakdown || {},
            details: liabilitiesDetails
          },
          analysis: {
            debtToAssetRatio: apiData.analysis?.debtToAssetRatio || 0,
            riskLevel: apiData.analysis?.riskLevel || '보통',
            recommendation: apiData.analysis?.recommendation || '',
            monthlyCashFlow: apiData.analysis?.monthlyCashFlow || 0,
            emergencyFund: apiData.analysis?.emergencyFund || 0,
            emergencyFundRatio: apiData.analysis?.emergencyFundRatio || 0
          }
        };
        
        console.log('🔍 useAssets - 변환된 데이터:', transformedData);
        setAssetsData(transformedData);
      } else {
        throw new Error(response.message || '자산 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      logError('자산 정보 조회', err);
      const errorMessage = err.message || '자산 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      
      // 사용자에게 표시해야 하는 에러인지 확인
      if (shouldShowErrorToUser(err)) {
        const friendlyMessage = getUserFriendlyErrorMessage(err, '자산 정보를 불러오는데 실패했습니다');
        showError(friendlyMessage);
      }
      
      // 로그인이 필요한 경우 조용히 로그인 페이지로 이동 (토스트 없이)
      if (isAuthError(err)) {
        navigate('/login');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [showError, navigate]);

  // 자산 요약 정보 가져오기
  const getSummary = useCallback(() => {
    if (!assetsData?.summary) return null;
    return {
      netWorth: assetsData.summary.netWorth,
      totalAssets: assetsData.summary.totalAssets,
      totalLiabilities: assetsData.summary.totalLiabilities,
      lastUpdated: assetsData.summary.lastUpdated
    };
  }, [assetsData]);

  // 자산 상세 정보 가져오기
  const getAssetsDetails = useCallback(() => {
    if (!assetsData?.assets?.details) return [];
    return assetsData.assets.details.map(asset => ({
      ...asset,
      formattedBalance: new Intl.NumberFormat('ko-KR').format(asset.balance)
    }));
  }, [assetsData]);

  // 부채 상세 정보 가져오기
  const getLiabilitiesDetails = useCallback(() => {
    if (!assetsData?.liabilities?.details) return [];
    return assetsData.liabilities.details.map(liability => ({
      ...liability,
      formattedBalance: new Intl.NumberFormat('ko-KR').format(liability.balance)
    }));
  }, [assetsData]);

  // 자산 분석 정보 가져오기
  const getAnalysis = useCallback(() => {
    if (!assetsData?.analysis) return null;
    return {
      ...assetsData.analysis,
      formattedDebtToAssetRatio: assetsData.analysis.debtToAssetRatio.toFixed(2),
      formattedEmergencyFund: new Intl.NumberFormat('ko-KR').format(assetsData.analysis.emergencyFund),
      formattedEmergencyFundRatio: assetsData.analysis.emergencyFundRatio.toFixed(1)
    };
  }, [assetsData]);

  // 자산 유형별 분류
  const getAssetsByType = useCallback(() => {
    if (!assetsData?.assets?.details) return {};
    
    const assetsByType = {
      DEPOSIT: [],
      SAVINGS: [],
      LOAN: [],
      INVESTMENT: [],
      REAL_ESTATE: [],
      OTHER: []
    };

    assetsData.assets.details.forEach(asset => {
      if (assetsByType[asset.type]) {
        assetsByType[asset.type].push(asset);
      } else {
        assetsByType.OTHER.push(asset);
      }
    });

    return assetsByType;
  }, [assetsData]);

  // 부채 유형별 분류
  const getLiabilitiesByType = useCallback(() => {
    if (!assetsData?.liabilities?.details) return {};
    
    const liabilitiesByType = {
      은행대출: [],
      카드대출: [],
      할부대출: [],
      보험대출: [],
      기타: []
    };

    assetsData.liabilities.details.forEach(liability => {
      if (liabilitiesByType[liability.type]) {
        liabilitiesByType[liability.type].push(liability);
      } else {
        liabilitiesByType.기타.push(liability);
      }
    });

    return liabilitiesByType;
  }, [assetsData]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchAssetsData();
  }, [fetchAssetsData]);

  return {
    assetsData,
    isLoading,
    error,
    fetchAssetsData,
    getSummary,
    getAssetsDetails,
    getLiabilitiesDetails,
    getAnalysis,
    getAssetsByType,
    getLiabilitiesByType,
  };
};
