import { useState, useCallback } from 'react'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const useHouseInfo = () => {
  const [houseApplyInfo, setHouseApplyInfo] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHouseApplyInfo = useCallback(async (sido, sigungu, eupmyeondong) => {
    if (!sido || !sigungu || !eupmyeondong) {
      setError('지역 정보가 올바르지 않습니다.')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.SEARCH}?page=0&size=20&sido=${encodeURIComponent(sido)}&sigungu=${encodeURIComponent(sigungu)}&eupmyeondong=${encodeURIComponent(eupmyeondong)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`API 요청에 실패했습니다. (${response.status})`)
      }
      
      const result = await response.json()
      
      if (result && result.success) {
        setHouseApplyInfo(Array.isArray(result.data?.content) ? result.data.content : [])
      } else {
        setError(result?.message || '데이터를 불러오는데 실패했습니다.')
        setHouseApplyInfo([])
      }
    } catch (err) {
      setError('주택 신청 정보를 불러오는데 실패했습니다.')
      setHouseApplyInfo([])
      console.error('API 호출 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retryFetch = useCallback((sido, sigungu, eupmyeondong) => {
    if (sido && sigungu && eupmyeondong) {
      fetchHouseApplyInfo(sido, sigungu, eupmyeondong)
    }
  }, [fetchHouseApplyInfo])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    houseApplyInfo,
    isLoading,
    error,
    fetchHouseApplyInfo,
    retryFetch,
    clearError
  }
}
