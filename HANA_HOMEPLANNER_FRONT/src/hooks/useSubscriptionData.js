import { useState, useEffect } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const useSubscriptionData = () => {
  const [subscriptionCalendarData, setSubscriptionCalendarData] = useState([]);
  const [subscriptionDateRange, setSubscriptionDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [subscriptionCache, setSubscriptionCache] = useState(new Map());
  const [lastCacheUpdate, setLastCacheUpdate] = useState(null);

  // 기본 날짜 범위 계산 (한 달 전 ~ 내일)
  const getDefaultDateRange = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      startDate: oneMonthAgo.toISOString().split("T")[0],
      endDate: tomorrow.toISOString().split("T")[0],
    };
  };

  // 로컬 스토리지에서 캐시 로드
  const loadCacheFromStorage = () => {
    try {
      const cached = localStorage.getItem("subscriptionCache");
      const cacheTime = localStorage.getItem("subscriptionCacheTime");

      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        const CACHE_DURATION = 10 * 60 * 1000; // 10분

        if (cacheAge < CACHE_DURATION) {
          const parsedCache = JSON.parse(cached);
          const cacheMap = new Map(Object.entries(parsedCache));
          setSubscriptionCache(cacheMap);
          setLastCacheUpdate(parseInt(cacheTime));
          console.log("[캐시] 로컬 스토리지에서 캐시 로드됨");
          return true;
        } else {
          // 캐시 만료
          localStorage.removeItem("subscriptionCache");
          localStorage.removeItem("subscriptionCacheTime");
          console.log("[캐시] 만료된 캐시 삭제됨");
        }
      }
    } catch (error) {
      console.error("[캐시] 로컬 스토리지 로드 실패:", error);
    }
    return false;
  };

  // 로컬 스토리지에 캐시 저장
  const saveCacheToStorage = (cacheMap) => {
    try {
      const cacheObj = Object.fromEntries(cacheMap);
      const cacheTime = Date.now();

      localStorage.setItem("subscriptionCache", JSON.stringify(cacheObj));
      localStorage.setItem("subscriptionCacheTime", cacheTime.toString());
      setLastCacheUpdate(cacheTime);
      console.log("[캐시] 로컬 스토리지에 캐시 저장됨");
    } catch (error) {
      console.error("[캐시] 로컬 스토리지 저장 실패:", error);
    }
  };

  // 캐시 키 생성
  const getCacheKey = (startDate, endDate) => `${startDate}_${endDate}`;

  // 청약 캘린더 데이터 조회 (캐시 적용)
  const fetchSubscriptionCalendarData = async (
    startDate = null,
    endDate = null
  ) => {
    const dateRange =
      startDate && endDate ? { startDate, endDate } : getDefaultDateRange();

    const cacheKey = getCacheKey(dateRange.startDate, dateRange.endDate);

    // 캐시 확인
    if (subscriptionCache.has(cacheKey)) {
      console.log("[캐시] 캐시된 데이터 사용:", cacheKey);
      const cachedData = subscriptionCache.get(cacheKey);
      setSubscriptionCalendarData(cachedData);
      setSubscriptionDateRange(dateRange);
      return;
    }

    // API 호출
    setIsLoadingSubscription(true);
    try {
      console.log("[API] 새로운 데이터 요청:", cacheKey);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.SUBSCRIPTION}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );

      if (!response.ok) {
        throw new Error("청약 데이터 조회 실패");
      }

      const result = await response.json();
      console.log("[청약 캘린더] API 응답:", result);

      if (result.success) {
        const data = result.data.subscriptionList || [];
        setSubscriptionCalendarData(data);
        setSubscriptionDateRange(dateRange);

        // 캐시에 저장
        const newCache = new Map(subscriptionCache);
        newCache.set(cacheKey, data);
        setSubscriptionCache(newCache);
        saveCacheToStorage(newCache);

        console.log("[캐시] 새 데이터 캐시됨:", cacheKey, `(${data.length}개)`);
      } else {
        console.error("[청약 캘린더] API 오류:", result.message);
        setSubscriptionCalendarData([]);
      }
    } catch (error) {
      console.error("[청약 캘린더] 데이터 로드 실패:", error);
      setSubscriptionCalendarData([]);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // 청약 데이터 정렬 및 분류
  const getSortedSubscriptionData = () => {
    const today = new Date().toISOString().split("T")[0];

    // 오늘 시작/마감인 청약 필터링
    const todayStart = subscriptionCalendarData.filter(
      (apt) => apt.rceptBgnDe === today
    );
    const todayEnd = subscriptionCalendarData.filter(
      (apt) => apt.rceptEndDe === today
    );
    const others = subscriptionCalendarData.filter(
      (apt) => apt.rceptBgnDe !== today && apt.rceptEndDe !== today
    );

    // 나머지는 접수 시작일 기준으로 정렬
    const sortedOthers = others.sort(
      (a, b) => new Date(a.rceptBgnDe) - new Date(b.rceptBgnDe)
    );

    return {
      todayStart: todayStart.sort(
        (a, b) => new Date(a.rceptBgnDe) - new Date(b.rceptBgnDe)
      ),
      todayEnd: todayEnd.sort(
        (a, b) => new Date(a.rceptBgnDe) - new Date(b.rceptBgnDe)
      ),
      others: sortedOthers,
    };
  };

  // 날짜 변경 시 재조회
  const handleDateRangeChange = () => {
    if (subscriptionDateRange.startDate && subscriptionDateRange.endDate) {
      fetchSubscriptionCalendarData(
        subscriptionDateRange.startDate,
        subscriptionDateRange.endDate
      );
    }
  };

  // 컴포넌트 마운트 시 캐시 로드
  useEffect(() => {
    loadCacheFromStorage();
  }, []);

  return {
    subscriptionCalendarData,
    subscriptionDateRange,
    setSubscriptionDateRange,
    isLoadingSubscription,
    fetchSubscriptionCalendarData,
    getSortedSubscriptionData,
    handleDateRangeChange,
  };
};
