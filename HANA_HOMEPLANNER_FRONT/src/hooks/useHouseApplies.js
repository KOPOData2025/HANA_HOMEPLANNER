/**
 * 신청한 주택 목록 관리 커스텀 훅
 * 데이터 로직과 UI 로직을 분리하여 재사용성 향상
 */

import { useState, useEffect, useCallback } from 'react';
import { getHouseApplies } from '@/services/houseUserService';
import useErrorNotification from './useErrorNotification';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useHouseApplies = () => {
  const [houseApplies, setHouseApplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();
  const navigate = useNavigate();

  // 신청한 주택 목록 조회
  const fetchHouseApplies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHouseApplies();
      setHouseApplies(data || []);
    } catch (err) {
      const errorMessage = err.message || '신청한 주택 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      
      // 로그인이 필요한 경우 조용히 처리 (마이페이지에서 이미 리다이렉트 처리됨)
      if (errorMessage.includes('로그인이 필요합니다')) {
        console.log('🔇 [useHouseApplies] 로그인 필요 - 조용히 처리');
        return;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError, navigate]);

  // 신청 상태별 필터링
  const getAppliesByStatus = useCallback((status) => {
    return houseApplies.filter(apply => apply.status === status);
  }, [houseApplies]);

  // 당첨된 신청 목록
  const getWonApplies = useCallback(() => {
    return houseApplies.filter(apply => apply.isWon === true);
  }, [houseApplies]);

  // 진행 중인 신청 목록
  const getInProgressApplies = useCallback(() => {
    return houseApplies.filter(apply => 
      apply.status === '접수완료' || 
      apply.status === '접수중' || 
      apply.statusCode === 'RECEIVED' || 
      apply.statusCode === 'IN_PROGRESS'
    );
  }, [houseApplies]);

  // 최근 신청 목록 (최신순)
  const getRecentApplies = useCallback((limit = 5) => {
    return [...houseApplies]
      .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
      .slice(0, limit);
  }, [houseApplies]);

  // 신청 통계
  const getApplyStats = useCallback(() => {
    const total = houseApplies.length;
    const won = houseApplies.filter(apply => apply.isWon).length;
    const inProgress = getInProgressApplies().length;
    const lost = houseApplies.filter(apply => apply.status === '낙첨').length;

    return {
      total,
      won,
      inProgress,
      lost,
      winRate: total > 0 ? Math.round((won / total) * 100) : 0,
    };
  }, [houseApplies, getInProgressApplies]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchHouseApplies();
  }, [fetchHouseApplies]);

  return {
    houseApplies,
    isLoading,
    error,
    fetchHouseApplies,
    getAppliesByStatus,
    getWonApplies,
    getInProgressApplies,
    getRecentApplies,
    getApplyStats,
  };
};
