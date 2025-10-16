/**
 * 찜한 주택 목록 관리 커스텀 훅
 * 데이터 로직과 UI 로직을 분리하여 재사용성 향상
 */

import { useState, useEffect, useCallback } from 'react';
import { getHouseLikes, removeHouseLike, addHouseLike } from '@/services/houseUserService';
import useErrorNotification from './useErrorNotification';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useHouseLikes = () => {
  const [houseLikes, setHouseLikes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useErrorNotification();
  const navigate = useNavigate();

  // 찜한 주택 목록 조회
  const fetchHouseLikes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHouseLikes();
      setHouseLikes(data || []);
    } catch (err) {
      const errorMessage = err.message || '찜한 주택 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      
      // 로그인이 필요한 경우 조용히 처리 (마이페이지에서 이미 리다이렉트 처리됨)
      if (errorMessage.includes('로그인이 필요합니다')) {
        console.log('🔇 [useHouseLikes] 로그인 필요 - 조용히 처리');
        return;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [showError, navigate]);

  // 찜한 주택 삭제
  const removeLike = useCallback(async (houseManageNo) => {
    try {
      await removeHouseLike(houseManageNo);
      setHouseLikes(prev => prev.filter(house => house.houseManageNo !== houseManageNo));
      return true;
    } catch (err) {
      const errorMessage = err.message || '찜한 주택 삭제에 실패했습니다.';
      showError(errorMessage);
      return false;
    }
  }, [showError]);

  // 찜한 주택 추가
  const addLike = useCallback(async (houseId) => {
    try {
      await addHouseLike(houseId);
      // 추가 후 목록 새로고침
      await fetchHouseLikes();
      return true;
    } catch (err) {
      const errorMessage = err.message || '찜한 주택 추가에 실패했습니다.';
      showError(errorMessage);
      return false;
    }
  }, [fetchHouseLikes, showError]);

  // 찜한 주택 토글 (추가/삭제)
  const toggleLike = useCallback(async (houseManageNo) => {
    const isLiked = houseLikes.some(house => house.houseManageNo === houseManageNo);
    
    if (isLiked) {
      return await removeLike(houseManageNo);
    } else {
      return await addLike(houseManageNo);
    }
  }, [houseLikes, removeLike, addLike]);

  // 찜한 주택인지 확인
  const isLiked = useCallback((houseManageNo) => {
    return houseLikes.some(house => house.houseManageNo === houseManageNo);
  }, [houseLikes]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchHouseLikes();
  }, [fetchHouseLikes]);

  return {
    houseLikes,
    isLoading,
    error,
    fetchHouseLikes,
    removeLike,
    addLike,
    toggleLike,
    isLiked,
  };
};
