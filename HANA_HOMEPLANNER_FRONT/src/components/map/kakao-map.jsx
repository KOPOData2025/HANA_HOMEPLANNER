import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { createRoot } from 'react-dom/client';
import './kakao-map.css';
import DataToggleButton from './DataToggleButton';
import AreaChart from '../charts/AreaChart';
import { injectMarkerStyles, createMarkerHTML, createMarkerHTMLWithSeparateText, createMarkerTextFromJson } from '../../utils/markerUtils';
import { getIndividualHouseData } from '../../utils/individualHouseService';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// 각 구의 중심 좌표를 계산하는 함수
const getPolygonCenter = (path) => {
  let lat = 0, lng = 0;
  path.forEach(point => {
    lat += point.getLat();
    lng += point.getLng();
  });
  return new window.kakao.maps.LatLng(lat / path.length, lng / path.length);
};

const KakaoMap = forwardRef(({ 
  markers, 
  priceMarkers = [], 
  areaPriceMarkers = [], 
  individualAptMarkers = [], 
  realTimeMarkers = [],
  isRealTimeMode = false,
  selectedMarkerStyle = 'classic',
  onToggleDataMode,
  lastUpdated = null,
  isLoadingRealTime = false,
  onMarkerClick, 
  onPolygonClick, 
  onRegionClick, 
  onAreaPriceMarkerClick, 
  onIndividualHouseClick 
}, ref) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  
  // 지도 위 객체들을 관리하기 위한 Refs
  const sidoPolygons = useRef([]); // 시도 단위 폴리곤
  const sigPolygons = useRef([]); // 시군구 단위 폴리곤
  const detailOverlays = useRef([]); // 개별 매물 오버레이
  const priceOverlays = useRef([]); // 시도별 가격 마커 오버레이
  const areaPriceOverlays = useRef([]); // 시군구별 평균분양가 마커 오버레이
  const individualAptOverlays = useRef([]); // 개별 아파트 마커 오버레이
  const realTimeOverlays = useRef([]); // 실시간 청약 마커 오버레이
  const guNameOverlay = useRef(null); // '구' 이름 라벨 오버레이
  const activePolygon = useRef(null); // 현재 활성화된 폴리곤
  const hoverTimers = useRef(new Map()); // 각 폴리곤별 타이머 관리

  // 좌표 스무딩 함수 - 폴리곤을 더 부드럽게 만들기
  const smoothCoordinates = (coordinates, smoothingFactor = 0.3) => {
    if (coordinates.length < 3) return coordinates;
    
    const smoothed = [];
    
    for (let i = 0; i < coordinates.length; i++) {
      const current = coordinates[i];
      const prev = coordinates[i === 0 ? coordinates.length - 1 : i - 1];
      const next = coordinates[i === coordinates.length - 1 ? 0 : i + 1];
      
      // 현재 점 추가
      smoothed.push(current);
      
      // 다음 점과의 중간에 부드러운 곡선을 위한 보간점 추가
      if (i < coordinates.length - 1) {
        const midLat = current.Ma + (next.Ma - current.Ma) * smoothingFactor;
        const midLng = current.La + (next.La - current.La) * smoothingFactor;
        smoothed.push(new window.kakao.maps.LatLng(midLat, midLng));
      }
    }
    
    return smoothed;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [sigGeoJsonData, setSigGeoJsonData] = useState(null); // 시군구 데이터
  const [sidoGeoJsonData, setSidoGeoJsonData] = useState(null); // 시도 데이터
  const [currentZoomLevel, setCurrentZoomLevel] = useState(3); // 현재 줌 레벨 상태
  const [isRenderingMarkers, setIsRenderingMarkers] = useState(false); // 마커 렌더링 상태
  const [visibleMarkersCount, setVisibleMarkersCount] = useState(0); // 현재 표시된 마커 수
  const zoomUpdateTimeoutRef = useRef(null); // 줌 레벨 업데이트 디바운싱용

  const ZOOM_THRESHOLD_HIGH = 10; // 시도 단위 -> 시군구 단위 전환 기준
  const ZOOM_THRESHOLD_LOW = 8;   // 시군구 단위 -> 개별 마커 전환 기준
  const ZOOM_THRESHOLD_INDIVIDUAL = 6; // 개별 아파트 마커 표시 기준 (줌 레벨 6부터)

  // 외부에서 호출할 수 있는 함수들을 노출
  useImperativeHandle(ref, () => ({
    // 지도를 특정 위치로 부드럽게 이동하고 줌 레벨을 설정하는 함수
    moveToLocationAndZoom: (lat, lng, zoomLevel) => {
      if (mapInstance.current) {
        const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
        const currentLevel = mapInstance.current.getLevel();
        const targetLevel = zoomLevel;
        
        // 부드러운 이동 애니메이션을 위한 함수
        const animateMapMovement = () => {
          // 1단계: 부드러운 위치 이동 (panTo 사용)
          mapInstance.current.panTo(moveLatLng);
          
          // 2단계: 위치 이동이 완료된 후 부드러운 줌 애니메이션
          if (currentLevel !== targetLevel) {
            setTimeout(() => {
              const smoothZoom = (current, target) => {
                if (Math.abs(current - target) <= 1) {
                  // 최종 줌 레벨 설정
                  mapInstance.current.setLevel(target);
                  // 애니메이션 완료 후 레이어 업데이트
                  setTimeout(() => {
                    updateLayersVisibility();
                  }, 150);
                  return;
                }
                
                // 한 단계씩 줌 변경
                const nextLevel = current > target ? current - 1 : current + 1;
                mapInstance.current.setLevel(nextLevel);
                
                // 다음 단계 실행 (부드러운 속도로)
                setTimeout(() => {
                  smoothZoom(nextLevel, target);
                }, 150); // 150ms 간격으로 더 부드럽게
              };
              
              smoothZoom(currentLevel, targetLevel);
            }, 400); // panTo 애니메이션 시간 고려
          } else {
            // 줌 레벨이 같으면 이동 완료 후 레이어만 업데이트
            setTimeout(() => {
              updateLayersVisibility();
            }, 500);
          }
        };
        
        // 애니메이션 실행
        animateMapMovement();
      }
    },
    
    // 부드러운 줌만 변경하는 함수 (위치 이동 없이)
    smoothZoomTo: (zoomLevel) => {
      if (mapInstance.current) {
        const currentLevel = mapInstance.current.getLevel();
        const targetLevel = zoomLevel;
        
        if (currentLevel !== targetLevel) {
          const smoothZoom = (current, target) => {
            if (Math.abs(current - target) <= 1) {
              mapInstance.current.setLevel(target);
              setTimeout(() => {
                updateLayersVisibility();
              }, 150);
              return;
            }
            
            const nextLevel = current > target ? current - 1 : current + 1;
            mapInstance.current.setLevel(nextLevel);
            
            setTimeout(() => {
              smoothZoom(nextLevel, target);
            }, 150);
          };
          
          smoothZoom(currentLevel, targetLevel);
        }
      }
    },
    
    // 현재 지도의 중심 좌표를 가져오는 함수
    getCenter: () => {
      if (mapInstance.current) {
        const center = mapInstance.current.getCenter();
        return { lat: center.getLat(), lng: center.getLng() };
      }
      return null;
    },
    
    // 현재 줌 레벨을 가져오는 함수
    getZoomLevel: () => {
      if (mapInstance.current) {
        return mapInstance.current.getLevel();
      }
      return null;
    },
    
    // 마커 표시 상태 복원 함수
    restoreMarkersVisibility: () => {
      console.log('🔄 [마커 복원] 패널 닫힘 후 마커 표시 상태 복원');
      if (isMapReady) {
        // updateLayersVisibility 함수가 정의된 후에 호출되도록 지연
        setTimeout(() => {
          if (typeof updateLayersVisibility === 'function') {
            updateLayersVisibility();
          }
        }, 0);
      }
    }
  }));

  // 마커를 배치로 나누어 렌더링하는 함수
  const renderMarkersInBatches = useCallback((markers, setMapFunction, batchSize = 50, delay = 10) => {
    if (!markers || markers.length === 0) return;
    
    setIsRenderingMarkers(true);
    let currentIndex = 0;
    
    const processBatch = () => {
      const endIndex = Math.min(currentIndex + batchSize, markers.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        if (markers[i]) {
          setMapFunction(markers[i]);
        }
      }
      
      currentIndex = endIndex;
      
      if (currentIndex < markers.length) {
        // 다음 배치를 requestAnimationFrame으로 지연 처리
        requestAnimationFrame(() => {
          setTimeout(processBatch, delay);
        });
      } else {
        setIsRenderingMarkers(false);
        setVisibleMarkersCount(markers.length);
      }
    };
    
    // 첫 번째 배치 시작
    requestAnimationFrame(processBatch);
  }, [setIsRenderingMarkers, setVisibleMarkersCount]);

  // 줌 레벨에 따라 모든 레이어의 표시 여부를 업데이트하는 함수
  const updateLayersVisibility = useCallback(() => {
    if (!mapInstance.current || !isMapReady) return;
    
    const level = mapInstance.current.getLevel();
    
    // 모드에 따른 표시 로직 결정
    const showHistoricalData = !isRealTimeMode;
    const showRealTimeData = isRealTimeMode;
    
    // 4단계 표시 로직 (과거 데이터 모드일 때만 적용)
    const showSidoPolygons = showHistoricalData && level > ZOOM_THRESHOLD_HIGH;
    const showSigPolygons = showHistoricalData && level > ZOOM_THRESHOLD_LOW && level <= ZOOM_THRESHOLD_HIGH;
    const showDetails = showHistoricalData && level <= ZOOM_THRESHOLD_HIGH && level > ZOOM_THRESHOLD_INDIVIDUAL;
    const showPriceMarkers = showHistoricalData && level > ZOOM_THRESHOLD_HIGH;
    const showAreaPriceMarkers = showHistoricalData && level <= ZOOM_THRESHOLD_HIGH && level > ZOOM_THRESHOLD_INDIVIDUAL;
    // 개별 주택 마커 표시 조건 (줌 레벨 6 이하에서 표시 - 더 확대된 상태에서만)
    const showIndividualAptMarkers = showHistoricalData && level <= 6;
    
    // 실시간 데이터 마커는 실시간 모드일 때 줌 레벨에 관계없이 표시
    const showRealTimeMarkers = showRealTimeData;

    // 디버깅 로그
    console.log(`[레이어 표시 상태] 줌레벨: ${level}, 모드: ${isRealTimeMode ? '실시간' : '과거'}`);
    if (showHistoricalData) {
      console.log(`  - 시도 폴리곤: ${showSidoPolygons ? '표시' : '숨김'} (${sidoPolygons.current.length}개)`);
      console.log(`  - 시군구 폴리곤: ${showSigPolygons ? '표시' : '숨김'} (${sigPolygons.current.length}개)`);
      console.log(`  - 개별 매물: ${showDetails ? '표시' : '숨김'} (${detailOverlays.current.length}개)`);
      console.log(`  - 시도 가격 마커: ${showPriceMarkers ? '표시' : '숨김'} (${priceOverlays.current.length}개)`);
      console.log(`  - 시군구 가격 마커: ${showAreaPriceMarkers ? '표시' : '숨김'} (${areaPriceOverlays.current.length}개)`);
      console.log(`  - 개별 주택: ${showIndividualAptMarkers ? '표시' : '숨김'} (${individualAptOverlays.current.length}개)`);
    }
    if (showRealTimeData) {
      console.log(`  - 실시간 마커: ${showRealTimeMarkers ? '표시' : '숨김'} (${realTimeOverlays.current.length}개)`);
    }

    // 모든 레이어를 먼저 숨김 (깔끔한 전환을 위해)
    sidoPolygons.current.forEach(p => p.polygon.setMap(null));
    sigPolygons.current.forEach(p => p.polygon.setMap(null));
    priceOverlays.current.forEach(o => o.setMap(null));
    areaPriceOverlays.current.forEach(o => o.setMap(null));
    detailOverlays.current.forEach(o => o.setMap(null));
    individualAptOverlays.current.forEach(o => o.setMap(null));
    
    // 실시간 마커는 패널이 열려있지 않을 때만 숨김
    const isPanelOpen = window.isLeftPanelOpen || false;
    if (!isPanelOpen) {
      realTimeOverlays.current.forEach(o => o.setMap(null));
    }
    setVisibleMarkersCount(0);

    // 과거 데이터 모드일 때만 과거 데이터 레이어 표시
    if (showHistoricalData) {
      console.log(`[과거 데이터 모드] 줌레벨 ${level}에 따른 레이어 표시`);
      
      // 시도 단위 폴리곤 표시/숨김
      if (showSidoPolygons) {
        console.log(`[시도 폴리곤] ${sidoPolygons.current.length}개 표시`);
        sidoPolygons.current.forEach(p => p.polygon.setMap(mapInstance.current));
      }
      
      // 시군구 단위 폴리곤 표시/숨김
      if (showSigPolygons) {
        console.log(`[시군구 폴리곤] ${sigPolygons.current.length}개 표시`);
        sigPolygons.current.forEach(p => p.polygon.setMap(mapInstance.current));
      }
      
      // 시도별 가격 마커 표시/숨김
      if (showPriceMarkers) {
        console.log(`[시도 가격 마커] ${priceOverlays.current.length}개 표시`);
        priceOverlays.current.forEach(o => o.setMap(mapInstance.current));
      }
      
      // 시군구별 평균분양가 마커 표시/숨김
      if (showAreaPriceMarkers) {
        console.log(`[시군구 가격 마커] ${areaPriceOverlays.current.length}개 표시`);
        areaPriceOverlays.current.forEach(o => o.setMap(mapInstance.current));
      }
      
      // 개별 매물 마커 표시/숨김
      if (showDetails) {
        console.log(`[개별 매물 마커] ${detailOverlays.current.length}개 표시`);
        detailOverlays.current.forEach(o => o.setMap(mapInstance.current));
      }
      
      // 개별 아파트 마커 표시/숨김 (배치 처리)
      if (showIndividualAptMarkers && individualAptOverlays.current.length > 0) {
        console.log(`[개별 주택 마커] ${individualAptOverlays.current.length}개 마커 배치 렌더링 시작`);
        console.log(`[개별 주택 마커] 첫 번째 마커 위치:`, individualAptOverlays.current[0]?.getPosition());
        
        // 900개의 마커를 배치로 나누어 렌더링하여 성능 최적화
        renderMarkersInBatches(
          individualAptOverlays.current,
          (overlay) => overlay.setMap(mapInstance.current),
          100, // 배치 크기를 늘려서 렌더링 속도 향상
          5   // 배치 간 지연 (ms)
        );
      }
    }
    
    // 실시간 마커 표시/숨김 (실시간 모드일 때만 표시)
    if (showRealTimeData && realTimeOverlays.current.length > 0) {
      // 패널이 열려있으면 마커를 다시 표시
      const isPanelOpen = window.isLeftPanelOpen || false;
      if (isPanelOpen) {
        console.log(`[실시간 마커] 패널이 열려있어 마커 유지 (${realTimeOverlays.current.length}개)`);
        // 이미 표시된 마커는 그대로 유지
      } else {
        console.log(`[실시간 마커] 패널이 닫혀있어 마커 표시 (${realTimeOverlays.current.length}개)`);
        renderMarkersInBatches(
          realTimeOverlays.current,
          (overlay) => overlay.setMap(mapInstance.current),
          20, // 실시간 마커는 더 작은 배치로 빠르게 처리
          2   // 더 빠른 지연
        );
      }
    } else {
      // 실시간 모드가 아닐 때는 확실히 모든 실시간 마커 숨김
      realTimeOverlays.current.forEach(o => o.setMap(null));
    }
  }, [isRealTimeMode, isMapReady, renderMarkersInBatches, setVisibleMarkersCount]);

  // 1. 지도 초기화 및 데이터 로드 Effect
  useEffect(() => {
    // 임시 테스트용 다른 API 키 (필요시 교체)
    const KAKAO_APP_KEY = "244eb9b776fdd2dcefb98ce91e328b01";
    console.log('🗺️ 카카오 지도 초기화 시작:', KAKAO_APP_KEY);
    const SCRIPT_ID = 'kakao-maps-sdk';

    const initMap = () => {
      console.log('🗺️ initMap 호출됨');
      if (!mapContainer.current) { 
        console.log('⏳ mapContainer가 아직 준비되지 않음, 100ms 후 재시도');
        setTimeout(initMap, 100); 
        return; 
      }
      
      console.log('🎯 지도 생성 중...');
      try {
        // 서울과 경기도를 모두 포함하도록 중심 좌표와 줌 레벨 조정
        const options = { center: new window.kakao.maps.LatLng(37.4, 127.1), level: 10 };
        mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options);
        console.log('✅ 카카오 지도 생성 성공');
      } catch (err) {
        console.error('❌ 지도 생성 실패:', err);
        setError(`지도 생성 실패: ${err.message}`);
        setIsLoading(false);
        return;
      }
      
      // 초기 줌 레벨 설정
      setCurrentZoomLevel(10);
      console.log(`[초기 줌 레벨] 설정: 10`);
      
      window.kakao.maps.event.addListener(mapInstance.current, 'zoom_changed', () => {
        const zoomLevel = mapInstance.current.getLevel();
        
        // 디바운싱으로 줌 레벨 변경 시 끊김 방지
        if (zoomUpdateTimeoutRef.current) {
          clearTimeout(zoomUpdateTimeoutRef.current);
        }
        
        zoomUpdateTimeoutRef.current = setTimeout(() => {
          console.log(`[줌 이벤트] 레벨 변경: ${zoomLevel}, 임계값: ${ZOOM_THRESHOLD_HIGH}/${ZOOM_THRESHOLD_LOW}/${ZOOM_THRESHOLD_INDIVIDUAL}`);
          setCurrentZoomLevel(zoomLevel); // 상태 업데이트만 하고 useEffect에서 레이어 업데이트 처리
        }, 100); // 100ms 디바운싱으로 단축
      });

      // 지도 크기 재조정 (컨테이너 크기 문제 해결)
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.relayout();
          console.log('🔧 지도 크기 재조정 완료');
        }
      }, 100);
      
      setIsLoading(false);
      setIsMapReady(true);
    };

    const fetchGeoJson = async () => {
      try {
        // 시군구 단위 데이터 로드
        const sigResponse = await fetch('/sig/sig.json');
        if (!sigResponse.ok) throw new Error('시군구 행정구역 데이터 로드 실패');
        
        const sigData = await sigResponse.json();
        
        // 서울(11), 경기도(41), 인천(28) 시군구만 필터링
        const filteredSigFeatures = sigData.features.filter(feature => {
          const sigCode = feature.properties.SIG_CD;
          return sigCode.startsWith('11') || sigCode.startsWith('41') || sigCode.startsWith('28');
        });
        
        
        // 시도 단위 데이터 로드
        const sidoResponse = await fetch('/sig/sido.json');
        if (!sidoResponse.ok) throw new Error('시도 행정구역 데이터 로드 실패');
        
        const sidoData = await sidoResponse.json();
        
        // 서울, 경기, 인천만 필터링 (시도 코드 기준)
        const filteredSidoFeatures = sidoData.features.filter(feature => {
          const sidoCode = feature.properties.CTPRVN_CD;
          return sidoCode === '11' || sidoCode === '41' || sidoCode === '28';
        });
        
        
        // 시군구 데이터 처리
        const processedSigData = {
          type: 'FeatureCollection',
          features: filteredSigFeatures.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              name: feature.properties.SIG_KOR_NM
            }
          }))
        };

        // 시도 데이터 처리
        const processedSidoData = {
          type: 'FeatureCollection',
          features: filteredSidoFeatures.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              name: feature.properties.SIG_KOR_NM || feature.properties.CTPRVN_CD
            }
          }))
        };

        setSigGeoJsonData(processedSigData);
        setSidoGeoJsonData(processedSidoData);
      } catch (err) { 
        console.error('GeoJSON 로드 오류:', err);
        setError(err.message); 
        setIsLoading(false); 
      }
    };

    fetchGeoJson();
    
    // 카카오 스크립트 로드 함수
    const loadKakaoScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.kakao && window.kakao.maps) {
          console.log('✅ 카카오 지도 이미 로드됨');
          resolve();
          return;
        }

        // 기존 스크립트 제거
        const existingScript = document.getElementById(SCRIPT_ID);
        if (existingScript) {
          console.log('🔄 기존 스크립트 제거');
          existingScript.remove();
        }

        // 새 스크립트 생성
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services,clusterer,drawing`;
        script.async = true;
        
        script.onload = () => {
          console.log('✅ 카카오 스크립트 로드 성공');
          if (window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              console.log('✅ 카카오 maps 로드 완료');
              resolve();
            });
          } else {
            reject(new Error('카카오 객체를 찾을 수 없습니다'));
          }
        };
        
        script.onerror = (error) => { 
          console.error('❌ 스크립트 로드 실패:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      });
    };

    // 스크립트 로드 및 지도 초기화
    loadKakaoScript()
      .then(() => {
        console.log('📍 지도 초기화 시작');
        initMap();
      })
      .catch((error) => {
        console.error('❌ 카카오 지도 로드 실패:', error);
        setError('카카오 지도를 불러오는데 실패했습니다.');
        setIsLoading(false);
      });

    // 클린업
    return () => {
      console.log('🧹 지도 컴포넌트 언마운트');
    };
  }, []);

    // 2. 지도 위 객체(폴리곤, 마커)를 그리는 메인 Effect
  useEffect(() => {
    if (!isMapReady || !sigGeoJsonData || !sidoGeoJsonData || !markers) return;

    const map = mapInstance.current;
    let clickHandlers = []; // 생성된 클릭 핸들러들을 추적

    // 기존 객체들 및 전역 함수들 초기화
    sidoPolygons.current.forEach(p => p.polygon.setMap(null));
    sidoPolygons.current = [];
    sigPolygons.current.forEach(p => p.polygon.setMap(null));
    sigPolygons.current = [];
    detailOverlays.current.forEach(o => o.setMap(null));
    detailOverlays.current = [];
    priceOverlays.current.forEach(o => o.setMap(null));
    priceOverlays.current = [];
    areaPriceOverlays.current.forEach(o => o.setMap(null));
    areaPriceOverlays.current = [];
    individualAptOverlays.current.forEach(o => o.setMap(null));
    individualAptOverlays.current = [];
    realTimeOverlays.current.forEach(o => o.setMap(null));
    realTimeOverlays.current = [];
    guNameOverlay.current = new window.kakao.maps.CustomOverlay({ yAnchor: 0 });
    
    // 활성 폴리곤과 타이머들 정리
    activePolygon.current = null;
    hoverTimers.current.forEach((timer) => clearTimeout(timer));
    hoverTimers.current.clear();
    
    // 기존 전역 마커 클릭 핸들러들 정리
    Object.keys(window).forEach(key => {
      if (key.startsWith('handleMarkerClick_') || key.startsWith('handleRealTimeMarkerHover')) {
        delete window[key];
      }
    });

    // HTML 미리보기 상태 관리
    if (!window.htmlPreviewState) {
      window.htmlPreviewState = {
        currentPopup: null,
        currentHoveredMarker: null,
        hoverTimeouts: new Map(),
        isLoading: new Set()
      };
    }

    // 차트 표시 전역 함수
    window.showAreaChart = (areaType, data) => {
      const chartContainer = document.createElement('div');
      chartContainer.id = 'area-chart-container';
      document.body.appendChild(chartContainer);

      const root = createRoot(chartContainer);
      root.render(
        React.createElement(AreaChart, {
          areaType,
          data,
          onClose: () => {
            root.unmount();
            document.body.removeChild(chartContainer);
          }
        })
      );
    };

    // HTML 미리보기 팝업 전역 함수들 (카드 형태로 개선)
    window.showHtmlPreview = (houseName, htmlContent, houseManageNo, realTimeMarkerData, x = window.innerWidth/2, y = window.innerHeight/2) => {
      const state = window.htmlPreviewState;
      
      // 이미 같은 팝업이 표시 중이면 무시
      if (state.currentPopup === houseManageNo) {
        return;
      }

      // 모든 기존 타이머 정리
      state.hoverTimeouts.forEach((timeoutId, key) => {
        clearTimeout(timeoutId);
      });
      state.hoverTimeouts.clear();
      
      // 기존 팝업이 있으면 제거
      if (state.currentPopup) {
        window.hideHtmlPreview(state.currentPopup);
      }

      state.currentPopup = houseManageNo;

      // HTML에서 주택 데이터 파싱
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const cards = doc.querySelectorAll('.payment-card');
      
      // 카드 데이터 추출
      const houseTypes = [];
      cards.forEach(card => {
        const header = card.querySelector('.card-header');
        const items = card.querySelectorAll('.list-item');
        
        if (header && items.length > 0) {
          const typeText = header.textContent.trim();
          const priceText = items[0]?.textContent || '';
          const contractText = items[1]?.textContent || '';
          
          // 가격 추출 (₩1,154,700,000 형태)
          const priceMatch = priceText.match(/₩([\d,]+)/);
          const price = priceMatch ? priceMatch[1] : '';
          
          // 계약금 추출
          const contractMatch = contractText.match(/₩([\d,]+)/);
          const contract = contractMatch ? contractMatch[1] : '';
          
          houseTypes.push({
            type: typeText,
            price: price,
            contract: contract
          });
        }
      });

      // x, y가 유효한 값인지 확인
      if (typeof x !== 'number' || typeof y !== 'number') {
        console.warn('Invalid coordinates provided to showHtmlPreview:', x, y);
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }
      
      // 말풍선 위치 계산 - 마커 바로 위에 표시
      const popupWidth = 320; // 말풍선 크기 축소
      const popupHeight = 110; // 말풍선 높이 축소
      const tailHeight = 15; // 말풍선 꼬리 높이
      
      // 마커 중앙에서 말풍선 중앙으로 정렬
      let finalX = x - (popupWidth / 2);
      let finalY = y - popupHeight - tailHeight - 10; // 마커 위 10px 간격
      
      // 화면 경계 체크하여 위치 조정
      // 좌측 경계 체크
      if (finalX < 20) {
        finalX = 20;
      }
      
      // 우측 경계 체크
      if (finalX + popupWidth > window.innerWidth - 20) {
        finalX = window.innerWidth - popupWidth - 20;
      }
      
      // 상단 경계 체크 (마커가 화면 상단에 너무 가까우면 아래쪽에 표시)
      if (finalY < 20) {
        finalY = y + 60; // 마커 아래쪽에 표시
      }
      
      // 새 팝업 생성 (카드 형태) - DOM 추가 전에 모든 스타일 설정
      const popup = document.createElement('div');
      popup.id = `html-preview-${houseManageNo}`;
      
      // 초기 위치를 정확히 설정하고 visibility를 hidden으로 시작
      popup.style.cssText = `
        position: fixed;
        left: ${finalX}px;
        top: ${finalY}px;
        width: ${popupWidth}px;
        height: ${popupHeight}px;
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        border: none;
        opacity: 0;
        transform: scale(0.8);
        visibility: hidden;
        position: relative;
      `;

      // CSS 애니메이션 및 말풍선 스타일 추가
      if (!document.getElementById('popup-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-styles';
        style.textContent = `
          /* 말풍선 꼬리 스타일 */
          .speech-bubble {
            position: relative !important;
          }
          .speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 40%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-top: 15px solid #0d9488;
            z-index: 10001;
          }
          .speech-bubble-bottom::after {
            bottom: auto;
            top: -15px;
            border-top: none;
            border-bottom: 15px solid #0d9488;
          }
          @keyframes popupFadeIn {
            from { 
              opacity: 0; 
              transform: scale(0.8) rotateX(10deg); 
              filter: blur(10px);
            }
            to { 
              opacity: 1; 
              transform: scale(1) rotateX(0deg);
              filter: blur(0px);
            }
          }
          @keyframes overlayFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .html-preview-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px 28px;
            font-weight: 700;
            font-size: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
          }
          .html-preview-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            animation: shimmer 4s infinite;
          }
          .html-preview-header .header-title {
            z-index: 1;
            position: relative;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .html-preview-close {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-weight: bold;
            z-index: 1;
            position: relative;
          }
          .html-preview-close:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.1) rotate(90deg);
            animation: pulse 0.6s ease-in-out;
          }
          .html-preview-content {
            flex: 1;
            padding: 0;
            overflow: hidden;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            position: relative;
          }
          .html-preview-iframe {
            width: calc(100% - 32px);
            height: calc(100% - 32px);
            margin: 16px;
            border: none;
            border-radius: 16px;
            background: white;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          }
          
          /* HTML 파일 내 테이블 스타일링 */
          .table-container {
            overflow-x: auto;
            margin: 16px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .payment-table th.header-cell,
          .payment-table th.section-title {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            font-weight: 600;
            padding: 12px 8px;
            text-align: center;
            border: 1px solid #d97706;
            font-size: 12px;
            line-height: 1.3;
          }
          
          .payment-table th.section-title {
            background: linear-gradient(135deg, #0ea5e9, #0284c7);
            border-color: #0284c7;
          }
          
          .payment-table td.data-cell {
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
            background: white;
            font-size: 12px;
            font-weight: 500;
            color: #374151;
          }
          
          .payment-table tr:nth-child(even) td.data-cell {
            background: #f9fafb;
          }
          
          .payment-table tr:hover td.data-cell {
            background: #eff6ff;
          }
          
          .payment-table td.data-cell:first-child {
            font-weight: 600;
            background: #fef3c7;
            color: #92400e;
          }
          
          .payment-table tr:nth-child(even) td.data-cell:first-child {
            background: #fde68a;
          }
          
          /* 금액 스타일링 */
          .payment-table td.data-cell.money-cell {
            font-weight: 600;
            color: #059669;
          }
          
          /* 반응형 디자인 */
          @media (max-width: 768px) {
            .payment-table {
              font-size: 11px;
            }
            
            .payment-table th.header-cell,
            .payment-table th.section-title {
              padding: 8px 4px;
              font-size: 10px;
            }
            
            .payment-table td.data-cell {
              padding: 8px 4px;
              font-size: 10px;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // 헤더 생성 (말풍선에 맞게 조정)
      const header = document.createElement('div');
      header.style.cssText = `
        background: transparent;
        color: white;
        padding: 16px 20px;
        font-weight: 600;
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      // 실시간 마커 데이터에서 주소, 주택타입, 신청시작일 가져오기
      const address = realTimeMarkerData?.address || '주소 정보 없음';
      
      // 주택 타입 정보 - 여러 가능한 필드명 확인
      let houseType = 'APT';
      if (realTimeMarkerData?.houseSecdNm) {
        houseType = realTimeMarkerData.houseSecdNm;
      } else if (realTimeMarkerData?.houseSecdNm) {
        houseType = realTimeMarkerData.houseSecdNm;
      } else if (realTimeMarkerData?.houseSecdNm) {
        houseType = realTimeMarkerData.houseSecdNm;
      } else if (realTimeMarkerData?.houseSecdNm) {
        houseType = realTimeMarkerData.houseSecdNm;
      }
      
      const rceptBgnde = realTimeMarkerData?.rceptBgnde || '신청일 정보 없음';
      
      // 신청시작일 포맷팅
      const formatRceptDate = (dateString) => {
        if (!dateString) return '신청일 정보 없음';
        try {
          const date = new Date(dateString);
          const year = date.getFullYear().toString().slice(-2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}.${month}.${day}`;
        } catch (e) {
          return dateString;
        }
      };

      header.innerHTML = `
        <div>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">🏠 ${houseName || '주택 정보'}</div>
          <div style="font-size: 12px; opacity: 0.8; margin-bottom: 6px;">📍 ${address}</div>
          <div style="font-size: 11px; opacity: 0.7; display: flex; gap: 12px;">
            <span>🏘️ ${houseType}</span>
            <span>📅 ${formatRceptDate(rceptBgnde)}</span>
          </div>
        </div>
      `;

      // 컨텐츠 컨테이너 제거 - 헤더만 표시
      const content = document.createElement('div');
      content.style.cssText = `
        display: none;
      `;

      // 팝업 조립
      popup.appendChild(header);
      popup.appendChild(content);

      // 팝업에 마우스 이벤트 추가 (flickering 방지)
      popup.onmouseenter = function() {
        // 팝업에 마우스가 들어오면 모든 숨김 타이머 취소
        if (state.hoverTimeouts.out) {
          clearTimeout(state.hoverTimeouts.out);
          state.hoverTimeouts.out = null;
        }
        
        // 마커의 hoverOut 타이머도 취소
        const outKey = `out_${houseManageNo}`;
        if (state.hoverTimeouts.has(outKey)) {
          clearTimeout(state.hoverTimeouts.get(outKey));
          state.hoverTimeouts.delete(outKey);
        }
      };

      popup.onmouseleave = function() {
        // 팝업에서 마우스가 나가면 짧은 지연 후 숨김
        state.hoverTimeouts.out = setTimeout(() => {
          // 마커 위에 마우스가 있는지 다시 확인
          const markerElement = document.querySelector(`[data-house-no="${houseManageNo}"]`);
          const popup = document.getElementById(`html-preview-${houseManageNo}`);
          
          // 마커나 팝업 위에 마우스가 있으면 숨기지 않음
          const isMarkerHovered = markerElement && markerElement.matches(':hover');
          const isPopupHovered = popup && popup.matches(':hover');
          
          if (!isMarkerHovered && !isPopupHovered) {
            window.hideHtmlPreview(houseManageNo);
          }
        }, 300); // 빠른 반응으로 반응성 향상
      };

      // DOM에 추가
      document.body.appendChild(popup);
      
      // 말풍선 클래스 추가 (위치에 따라 꼬리 방향 결정)
      const isBottom = finalY > y; // 마커 아래쪽에 표시되는 경우
      popup.className = `speech-bubble ${isBottom ? 'speech-bubble-bottom' : ''}`;
      
    
      
      // DOM에 추가된 후 애니메이션 시작 (reflow 강제 발생)
      popup.offsetHeight; // reflow 강제 발생
      
      // 애니메이션으로 표시
      popup.style.cssText = `
        position: fixed !important;
        left: ${finalX}px !important;
        top: ${finalY}px !important;
        width: ${popupWidth}px !important;
        height: ${popupHeight}px !important;
        background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        z-index: 10000 !important;
        border: none !important;
        opacity: 1 !important;
        transform: scale(1) !important;
        visibility: visible !important;
        transition: all 0.3s ease-out !important;
        display: block !important;
      `;
    };

    window.hideHtmlPreview = (houseManageNo) => {
      const state = window.htmlPreviewState;
      const popup = document.getElementById(`html-preview-${houseManageNo}`);
      
      if (popup) {
        popup.remove();
      }
      
      if (state.currentPopup === houseManageNo) {
        state.currentPopup = null;
      }
      
      // 해당 houseNo와 관련된 모든 타이머 정리
      const keysToDelete = [];
      state.hoverTimeouts.forEach((timeoutId, key) => {
        if (key.includes(houseManageNo.toString()) || key === 'out') {
          clearTimeout(timeoutId);
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => state.hoverTimeouts.delete(key));
      
      // 전역 타이머도 정리
      if (state.hoverTimeouts.out) {
        clearTimeout(state.hoverTimeouts.out);
        state.hoverTimeouts.out = null;
      }
    };

    // 폴리곤 생성 함수
    const createPolygons = (geoData, polygonArray, style, type) => {
      geoData.features.forEach(feature => {
        const areaName = feature.properties.name;
        

      
      if (!feature.geometry || !feature.geometry.coordinates) {
          console.error(`[${type} 폴리곤 오류] 좌표 데이터가 없는 지역:`, areaName);
        return;
      }
      
      let path;
      
      // MultiPolygon과 Polygon 타입을 구분하여 처리
      if (feature.geometry.type === 'MultiPolygon') {
        if (!feature.geometry.coordinates[0] || !feature.geometry.coordinates[0][0] || !feature.geometry.coordinates[0][0][0]) {
            console.error(`[${type} 폴리곤 오류] MultiPolygon 좌표 구조가 올바르지 않음:`, areaName);
          return;
        }
        path = feature.geometry.coordinates[0][0].map(c => new window.kakao.maps.LatLng(c[1], c[0]));
      } else {
        if (!feature.geometry.coordinates[0]) {
            console.error(`[${type} 폴리곤 오류] Polygon 좌표 구조가 올바르지 않음:`, areaName);
          return;
        }
        path = feature.geometry.coordinates[0].map(c => new window.kakao.maps.LatLng(c[1], c[0]));
      }
      

      
      // 좌표 스무딩 적용
      const smoothedPath = smoothCoordinates(path, 0.2);
      
      const polygon = new window.kakao.maps.Polygon({
        path: smoothedPath,
        strokeWeight: style.strokeWeight,
        strokeColor: style.strokeColor,
        strokeOpacity: style.strokeOpacity,
        strokeStyle: 'solid',
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        clickable: true,
        zIndex: type === '시군구' ? 100 : 50 // 시군구가 더 위에 오도록
      });
        
        polygonArray.push({ polygon, areaName, path: smoothedPath });
        
        // 마우스 이벤트 추가 (개선된 버전)
        window.kakao.maps.event.addListener(polygon, 'mouseover', (mouseEvent) => {
          // 기존 타이머들 모두 정리
          hoverTimers.current.forEach((timer, key) => {
            clearTimeout(timer);
            hoverTimers.current.delete(key);
          });
          
          // 이전 활성 폴리곤 초기화
          if (activePolygon.current && activePolygon.current !== polygon) {
            const prevStyle = activePolygon.current.originalStyle;
            if (prevStyle) {
              activePolygon.current.setOptions(prevStyle);
            }
          }
          
          // 현재 폴리곤 활성화
          activePolygon.current = polygon;
          polygon.originalStyle = {
            fillOpacity: style.fillOpacity,
            fillColor: style.fillColor,
            strokeWeight: style.strokeWeight,
            strokeOpacity: style.strokeOpacity
          };
          
          polygon.setOptions({
            fillOpacity: 0.35,
            fillColor: '#10b981',
            strokeWeight: style.strokeWeight + 1,
            strokeOpacity: 0.9
          });
        
        const labelClass = type === '시군구' ? 'area-label clickable-district' : 'area-label';
        guNameOverlay.current.setContent(`<div class="${labelClass}">${areaName}</div>`);
        guNameOverlay.current.setPosition(mouseEvent.latLng);
        guNameOverlay.current.setMap(map);
      });

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
          const timerId = setTimeout(() => {
            // 해당 폴리곤이 여전히 활성 상태인지 확인
            if (activePolygon.current === polygon) {
          polygon.setOptions({
                fillOpacity: style.fillOpacity,
                fillColor: style.fillColor,
                strokeWeight: style.strokeWeight,
                strokeOpacity: style.strokeOpacity
          });
          guNameOverlay.current.setMap(null);
              activePolygon.current = null;
            }
            hoverTimers.current.delete(polygon);
          }, 50); // 타이머 시간을 조금 늘려서 안정성 확보
          
          hoverTimers.current.set(polygon, timerId);
        });

        window.kakao.maps.event.addListener(polygon, 'click', (mouseEvent) => {
          // 시군구 폴리곤만 청약 데이터 표시 (시도는 너무 넓음)
          if (type === '시군구' && onPolygonClick) {
            onPolygonClick(areaName);
          }
        });

        // 시도 폴리곤 클릭 이벤트 제거 (마커 클릭 방식으로 변경)
      });
    };

    // 시도 단위 폴리곤 생성 (더 굵은 선과 다른 색상)
    createPolygons(sidoGeoJsonData, sidoPolygons.current, {
      strokeWeight: 2.5,
      strokeColor: '#1e40af',
      strokeOpacity: 0.8,
      fillColor: '#3b82f6',
      fillOpacity: 0.15 // 클릭 가능하도록 불투명도 증가
    }, '시도');

    // 시군구 단위 폴리곤 생성
    createPolygons(sigGeoJsonData, sigPolygons.current, {
      strokeWeight: 1.5,
      strokeColor: '#2563eb',
      strokeOpacity: 0.7,
      fillColor: '#3b82f6',
      fillOpacity: 0.1 // 클릭 가능하도록 불투명도 증가
    }, '시군구');
    
    // 폴리곤 데이터를 전역으로 노출 (마커 위치 계산용)
    window.sigPolygons = sigPolygons.current;
    window.sidoPolygons = sidoPolygons.current;

    // 시도별 가격 마커 생성 (API 데이터 기반) - 클릭 이벤트 추가
    priceMarkers.forEach(priceMarker => {
      // 전역 함수를 통해 클릭 이벤트 처리
      const clickHandler = `handlePriceMarkerClick_${priceMarker.region.replace(/\s+/g, '_')}`;
      clickHandlers.push(clickHandler); // cleanup을 위해 추적
      
      window[clickHandler] = () => {
        if (onRegionClick) {
          onRegionClick(priceMarker.region);
        }
      };
      
      const content = `<div class="price-marker clickable" data-region="${priceMarker.region}" onclick="${clickHandler}()" style="cursor: pointer;">
        <div class="price-marker-content">
          <div class="price-marker-region">${priceMarker.region}</div>
          <div class="price-marker-price">${priceMarker.averagePrice}</div>
        </div>
      </div>`;
      
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(priceMarker.lat, priceMarker.lng),
        content: content,
        yAnchor: 0.5,
        zIndex: 1000
      });
      
      priceOverlays.current.push(overlay);
    });

    // 시군구별 평균분양가 마커 생성 (API 데이터 기반)
    areaPriceMarkers.forEach(areaPriceMarker => {
      // 전역 함수를 통해 클릭 이벤트 처리
      const clickHandler = `handleAreaPriceMarkerClick_${areaPriceMarker.sigungu.replace(/\s+/g, '_')}`;
      clickHandlers.push(clickHandler); // cleanup을 위해 추적
      
      window[clickHandler] = () => {
        console.log('[시군구 평균분양가 마커 클릭] 시군구:', areaPriceMarker);
        if (onAreaPriceMarkerClick) {
          onAreaPriceMarkerClick(areaPriceMarker);
        }
      };  
      
      const content = `<div class="area-price-marker clickable" data-sigungu="${areaPriceMarker.sigungu}" onclick="${clickHandler}()" style="cursor: pointer;">
        <div class="area-price-marker-content">
          <div class="area-price-marker-sigungu">${areaPriceMarker.sigungu}</div>
          <div class="area-price-marker-price">${(areaPriceMarker.avgPrice / 10000).toFixed(1)}억원</div>
          <div class="area-price-marker-info">${areaPriceMarker.complexCount}개 단지</div>
        </div>
      </div>`;
      
      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(areaPriceMarker.lat, areaPriceMarker.lng),
        content: content,
        yAnchor: 0.5,
        zIndex: 800
      });
      
      areaPriceOverlays.current.push(overlay);
    });

    // 개별 매물 마커 생성 (구역명 포함)
    markers.forEach(markerData => {
      // 전역 함수를 통해 클릭 이벤트 처리
      const clickHandler = `handleMarkerClick_${markerData.id}`;
      clickHandlers.push(clickHandler); // cleanup을 위해 추적
      
      window[clickHandler] = () => {
        if (onMarkerClick) {
          onMarkerClick(markerData);
        }
      };
      
      // 구역명과 가격을 함께 표시
      const district = markerData.district || markerData.address.split(' ').slice(-1)[0]; // district 속성이 없으면 주소에서 추출
      const content = `<div class="kakao-custom-overlay clickable-marker" data-marker-id="${markerData.id}" onclick="${clickHandler}()">
        <div class="overlay-content apartment">
          <span class="detail-marker-icon">🏠</span>
          <div class="overlay-info">
            <div class="overlay-district">${district}</div>
            <div class="overlay-price">${markerData.price}</div>
          </div>
        </div>
        <div class="overlay-arrow apartment"></div>
      </div>`;
      
      const overlay = new window.kakao.maps.CustomOverlay({ 
        position: new window.kakao.maps.LatLng(markerData.lat, markerData.lng), 
        content: content, 
        yAnchor: 1 
      });
      
      detailOverlays.current.push(overlay);
    });

    // 개별 주택 마커 생성 (API 데이터 기반)
    if (individualAptMarkers.length > 0) {
      individualAptMarkers.forEach((houseMarker, index) => {
        // 전역 함수를 통해 클릭 이벤트 처리
        const clickHandler = `handleIndividualHouseClick_${houseMarker.houseManageNo}`;
        clickHandlers.push(clickHandler); // cleanup을 위해 추적
        
        window[clickHandler] = () => {
          if (onIndividualHouseClick) {
            onIndividualHouseClick(houseMarker);
          }
        };
        
        // 성능을 위해 간단한 CSS 기반 마커로 변경
        const content = `<div class="individual-house-marker clickable" data-house-no="${houseMarker.houseManageNo}" onclick="${clickHandler}()" style="cursor: pointer;">
          <div class="house-marker-circle" style="
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
            border: 2px solid white;
            position: relative;
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 5px 15px rgba(0, 0, 0, 0.4)';" 
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 8px rgba(0, 0, 0, 0.3)';">
            <div style="font-size: 8px; font-weight: 600; line-height: 1; margin-bottom: 1px; text-align: center; max-width: 35px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${houseMarker.houseName.length > 6 ? houseMarker.houseName.substring(0, 6) : houseMarker.houseName}
            </div>
            <div style="font-size: 9px; font-weight: 700; line-height: 1;">
              ${houseMarker.avgPrice && !isNaN(houseMarker.avgPrice) ? (houseMarker.avgPrice / 10000).toFixed(1) + '억' : '정보없음'}
            </div>
          </div>
        </div>`;
        
        try {
          const position = new window.kakao.maps.LatLng(houseMarker.y, houseMarker.x);
          const overlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: content,
            xAnchor: 0.5, // 이미지 마커 중앙 정렬
            yAnchor: 1.0, // 마커 하단이 좌표를 가리키도록 조정
            zIndex: 5000 // 기본 zIndex
          });
          
          individualAptOverlays.current.push(overlay);
          
          // 오버레이가 지도에 추가된 후 DOM 요소에 이벤트 리스너 추가
          setTimeout(() => {
            try {
              const overlayElement = overlay.a; // 카카오맵 오버레이의 DOM 요소
              if (overlayElement && overlayElement.addEventListener) {
                overlayElement.addEventListener('mouseenter', () => {
                  overlay.setZIndex(999999); // 호버 시 최상위로
                });
                overlayElement.addEventListener('mouseleave', () => {
                  overlay.setZIndex(5000); // 호버 해제 시 원래대로
                });
              }
            } catch (err) {
              console.warn('[개별 주택 마커] 이벤트 리스너 추가 실패:', err);
            }
          }, 200);
        } catch (error) {
          console.error(`[개별 주택 마커 생성 오류 ${index}]`, error, houseMarker);
        }
      });
    }

    // 실시간 청약 마커 생성 (기존 마커 먼저 완전히 정리)
    console.log(`[실시간 마커] 기존 마커 ${realTimeOverlays.current.length}개 정리 후 새로 생성`);
    
    // 기존 마커 완전히 정리
    realTimeOverlays.current.forEach(overlay => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null);
      }
    });
    realTimeOverlays.current = [];
    
    // 기존 클릭 핸들러도 정리
    clickHandlers.forEach(handlerName => {
      if (window[handlerName]) {
        delete window[handlerName];
      }
    });
    clickHandlers.length = 0; // 배열 초기화
    
    // 실시간 청약 마커 생성
    console.log(`[실시간 마커] 기존 마커 ${realTimeOverlays.current.length}개 정리 후 새로 생성`);
    
    // 기존 마커 완전히 정리
    realTimeOverlays.current.forEach(overlay => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null);
      }
    });
    realTimeOverlays.current = [];
    
    // 기존 클릭 핸들러도 정리
    clickHandlers.forEach(handlerName => {
      if (window[handlerName]) {
        delete window[handlerName];
      }
    });
    clickHandlers.length = 0; // 배열 초기화

    realTimeMarkers.forEach(realTimeMarker => {
      // 전역 함수를 통해 클릭 이벤트 처리
      const clickHandler = `handleRealTimeMarkerClick_${realTimeMarker.houseManageNo}`;
      clickHandlers.push(clickHandler); // cleanup을 위해 추적
      
      window[clickHandler] = async () => {
        console.log('🔍 [실시간 마커 클릭] 클릭된 마커:', realTimeMarker.houseName);
        
        // 클릭 시에만 상세 정보 API 호출
        const houseManageNo = realTimeMarker.houseManageNo;
        
        if (houseManageNo) {
          try {
            console.log('🔍 [실시간 마커 클릭] 개별 주택 정보 조회 시작:', houseManageNo);
            
            // 최적화된 개별 주택 정보 조회
            const jsonData = await getIndividualHouseData(houseManageNo);
            
            if (jsonData) {
              console.log('✅ [실시간 마커 클릭] 개별 주택 정보 조회 성공:', {
                houseName: realTimeMarker.houseName,
                houseManageNo: houseManageNo,
                dataSource: 'Individual API'
              });
              
              // 전역 함수를 통해 좌측 패널 열기
              if (window.openLeftHouseTypePanel) {
                // houseData에 실시간 마커의 모든 필요한 정보 포함
                const houseData = {
                  hssplyAdres: realTimeMarker.address || realTimeMarker.hssplyAdres || null,
                  houseManageNo: realTimeMarker.houseManageNo,
                  id: realTimeMarker.id,
                  houseName: realTimeMarker.houseName,
                  parsedjsonfiles: realTimeMarker.parsedjsonfiles,
                  // 실시간 마커의 모든 데이터 포함
                  ...realTimeMarker
                };
                console.log('🔍 카카오맵 - 좌측 패널로 전달할 houseData:', houseData);
                window.openLeftHouseTypePanel(realTimeMarker.houseName, null, jsonData, houseData);
              }
            } else {
              console.warn('⚠️ [실시간 마커 클릭] 개별 주택 정보 조회 실패:', houseManageNo);
              
              // 기본 정보로 패널 열기
              if (window.openLeftHouseTypePanel) {
                const houseData = {
                  hssplyAdres: realTimeMarker.address || realTimeMarker.hssplyAdres || null,
                  houseManageNo: realTimeMarker.houseManageNo,
                  id: realTimeMarker.id,
                  houseName: realTimeMarker.houseName,
                  parsedjsonfiles: realTimeMarker.parsedjsonfiles,
                  ...realTimeMarker
                };
                
                const defaultJsonData = {
                  houseType: '정보없음',
                  region: '정보없음',
                  regulation: '정보없음',
                  resaleLimit: '정보없음',
                  specialSupplyCount: {},
                  generalSupplyCount: {}
                };
                
                window.openLeftHouseTypePanel(realTimeMarker.houseName, null, defaultJsonData, houseData);
              }
            }
          } catch (error) {
            console.error('❌ [실시간 마커 클릭] 개별 주택 정보 조회 오류:', error);
            
            // 에러 발생 시에도 패널은 열되 기본 정보만 표시
            if (window.openLeftHouseTypePanel) {
              const houseData = {
                hssplyAdres: realTimeMarker.address || realTimeMarker.hssplyAdres || null,
                houseManageNo: realTimeMarker.houseManageNo,
                id: realTimeMarker.id,
                houseName: realTimeMarker.houseName,
                parsedjsonfiles: realTimeMarker.parsedjsonfiles,
                ...realTimeMarker
              };
              
              const defaultJsonData = {
                houseType: '정보없음',
                region: '정보없음',
                regulation: '정보없음',
                resaleLimit: '정보없음',
                specialSupplyCount: {},
                generalSupplyCount: {}
              };
              
              window.openLeftHouseTypePanel(realTimeMarker.houseName, null, defaultJsonData, houseData);
            }
          }
        } else {
          console.warn('⚠️ [실시간 마커 클릭] houseManageNo가 없습니다:', realTimeMarker);
        }
      };
        
        // HTML 파일 경로 파싱 (가격 표시용)
        const getHtmlFilePath = (parsedjsonfiles) => {
          if (!parsedjsonfiles || parsedjsonfiles === '[]') return null;
          try {
            const files = JSON.parse(parsedjsonfiles);
            if (files.length > 0) {
              // JSON 경로를 HTML 경로로 변환
              return files[0]
                .replace('parsed_json/', 'parsed_html/')
                .replace('.json', '.html');
            }
          } catch (e) {
            return null;
          }
          return null;
        };

        const htmlFilePath = getHtmlFilePath(realTimeMarker.parsedjsonfiles);
        const hoverHandler = `handleRealTimeMarkerHover_${realTimeMarker.houseManageNo}`;
        const hoverOutHandler = `handleRealTimeMarkerHoverOut_${realTimeMarker.houseManageNo}`;
      
      // 호버 이벤트 핸들러 등록 (즉시 표시)
      window[hoverHandler] = async (markerElement) => {
      
        const state = window.htmlPreviewState;
        const houseNo = realTimeMarker.houseManageNo;
        
        // 모든 관련 타이머 취소 (호버 인, 호버 아웃 모두)
        const keysToCancel = [houseNo, `out_${houseNo}`];
        keysToCancel.forEach(key => {
          if (state.hoverTimeouts.has(key)) {
            clearTimeout(state.hoverTimeouts.get(key));
            state.hoverTimeouts.delete(key);
          }
        });
        
        // 전역 out 타이머도 취소
        if (state.hoverTimeouts.out) {
          clearTimeout(state.hoverTimeouts.out);
          state.hoverTimeouts.out = null;
        }
        
        // 현재 호버 중인 마커 설정
        state.currentHoveredMarker = houseNo;
        
        // 이미 로딩 중이거나 같은 팝업이 표시 중이면 무시
        if (state.isLoading.has(houseNo) || state.currentPopup === houseNo) {
          return;
        }
        
        // 즉시 팝업 표시 (지연 제거)
        if (htmlFilePath && !state.isLoading.has(houseNo)) {
          state.isLoading.add(houseNo);
          try {
            // HTML 파일 읽기
            const response = await fetch(`/${htmlFilePath.replace(/\\\\/g, '/')}`);
            if (response.ok) {
              const htmlContent = await response.text();
              // 마커 요소를 직접 사용하여 위치 계산
              let x, y;
              
              if (markerElement) {
                const rect = markerElement.getBoundingClientRect();
                x = rect.right + 10; // 마커 우측에 10px 간격
                y = rect.top; // 마커와 같은 높이
              } else {
                // 마커 요소가 없는 경우에만 중앙 사용 (fallback)
                x = window.innerWidth / 2;
                y = window.innerHeight / 2;
              }
              
              showHtmlPreview(realTimeMarker.houseName, htmlContent, houseNo, realTimeMarker, x, y);
            }
          } catch (error) {
            console.error('HTML 파일 로드 실패:', error);
          } finally {
            state.isLoading.delete(houseNo);
          }
        }
      };
      
      window[hoverOutHandler] = () => {
        const state = window.htmlPreviewState;
        const houseNo = realTimeMarker.houseManageNo;
        
        // 현재 호버 중인 마커 해제
        if (state.currentHoveredMarker === houseNo) {
          state.currentHoveredMarker = null;
        }
        
        // 호버 아웃 시 팝업 숨김 (지연 후)
        const timeoutId = setTimeout(() => {
          // 마커 위에 마우스가 있는지 확인
          const markerElement = document.querySelector(`[data-house-no="${houseNo}"]`);
          const popup = document.getElementById(`html-preview-${houseNo}`);
          
          // 마커나 팝업 위에 마우스가 있거나, 여전히 호버 중인 마커라면 숨기지 않음
          const isMarkerHovered = markerElement && markerElement.matches(':hover');
          const isPopupHovered = popup && popup.matches(':hover');
          const isStillCurrentHover = state.currentHoveredMarker === houseNo;
          
          if (!isMarkerHovered && !isPopupHovered && !isStillCurrentHover) {
            window.hideHtmlPreview(houseNo);
          }
        }, 400); // 400ms 지연으로 빠른 반응
        
        state.hoverTimeouts.set(`out_${houseNo}`, timeoutId);
      };

      // 신청일자 포맷팅 함수
      const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          const year = date.getFullYear().toString().slice(-2); // YY
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); // MM
          const day = date.getDate().toString().padStart(2, '0'); // DD
          return `${year}.${month}.${day}`;
        } catch (e) {
          return dateString;
        }
      };

      // HTML에서 분양가를 가져오는 함수
      const getPriceFromHtml = async (htmlFilePath) => {
        if (!htmlFilePath) return null;
        
        try {
          const response = await fetch(`/${htmlFilePath.replace(/\\\\/g, '/')}`);
          if (response.ok) {
            const htmlContent = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // 첫 번째 payment-card에서 분양가 찾기
            const firstCard = doc.querySelector('.payment-card');
            if (firstCard) {
              const salePriceElement = Array.from(firstCard.querySelectorAll('li')).find(li => 
                li.textContent.includes('분양가'));
              if (salePriceElement) {
                const match = salePriceElement.textContent.match(/₩([\d,]+)/);
                if (match) {
                  return match[1]; // 콤마가 포함된 숫자 반환
                }
              }
            }
          }
        } catch (error) {
          console.error('HTML 파일에서 가격 파싱 실패:', error);
        }
        return null;
      };

      // 매매가격 포맷팅 함수
      const formatPrice = (priceString) => {
        if (!priceString) return '가격정보없음';
        
        // 콤마 제거하고 숫자만 추출
        const numPrice = priceString.replace(/[^\d]/g, '');
        if (numPrice && numPrice.length > 0) {
          const billionPrice = (parseInt(numPrice) / 100000000).toFixed(1);
          return `${billionPrice}억`;
        }
        
        return '가격정보없음';
      };

        // 최적화된 마커 생성 (기존 방식으로 복원)
        const createMarkerWithJsonData = async () => {
          try {
            // 개별 주택 정보 API 호출
            const apiId = `${realTimeMarker.houseManageNo}_${realTimeMarker.houseManageNo}_1`;
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REAL_ESTATE.INDIVIDUAL_JSON}/${apiId}`);
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                // 마커 텍스트 생성
                const markerText = createMarkerTextFromJson(result.data);
                
                // 마커 스타일 주입 (크기 조정)
                injectMarkerStyles(selectedMarkerStyle, 60);
                
                // 커스텀 집 마커 HTML 생성 (분리된 텍스트 및 툴팁 포함)
                const tooltipTitle = realTimeMarker.houseName || '매물';
                const tooltipSubtitle = realTimeMarker.address || realTimeMarker.addrRaw || '';
                const customMarkerHTML = createMarkerHTMLWithSeparateText(selectedMarkerStyle, 60, 'kakao-custom-marker', markerText.areaRange, markerText.priceRange, tooltipTitle, tooltipSubtitle);
                
                const content = `<div class="real-time-marker clickable" data-house-no="${realTimeMarker.houseManageNo}" onclick="${clickHandler}()"
                  onmouseover="${hoverHandler}(this);" 
                  onmouseout="${hoverOutHandler}();"
                  style="cursor: pointer; position: relative; display: inline-block;">
                  
                  ${customMarkerHTML}
                  
                </div>`;
                
                const overlay = new window.kakao.maps.CustomOverlay({
                  position: new window.kakao.maps.LatLng(realTimeMarker.lat, realTimeMarker.lng),
                  content: content,
                  xAnchor: 0.15, // 포인터 위치에 맞춰 더 정확히 조정
                  yAnchor: 0.9, // 포인터가 좌표를 정확히 가리키도록 조정
                  zIndex: 10000 // 기본 zIndex
                });
                
                realTimeOverlays.current.push(overlay);
                
                // 오버레이가 지도에 추가된 후 DOM 요소에 이벤트 리스너 추가
                setTimeout(() => {
                  try {
                    const overlayElement = overlay.a; // 카카오맵 오버레이의 DOM 요소
                    if (overlayElement && overlayElement.addEventListener) {
                      overlayElement.addEventListener('mouseenter', () => {
                        overlay.setZIndex(999999); // 호버 시 최상위로
                      });
                      overlayElement.addEventListener('mouseleave', () => {
                        overlay.setZIndex(10000); // 호버 해제 시 원래대로
                      });
                    }
                  } catch (err) {
                    console.warn('[실시간 마커] 이벤트 리스너 추가 실패:', err);
                  }
                }, 200);
              } else {
                console.warn(`[실시간 마커] API 응답 실패: ${realTimeMarker.houseName}`);
                // 기본 마커 생성
                createDefaultMarker();
              }
            } else {
              console.warn(`[실시간 마커] API 호출 실패: ${realTimeMarker.houseName}`);
              // 기본 마커 생성
              createDefaultMarker();
            }
          } catch (error) {
            console.error(`[실시간 마커] 마커 생성 오류: ${realTimeMarker.houseName}`, error);
            // 기본 마커 생성
            createDefaultMarker();
          }
        };

        // 기본 마커 생성 함수
        const createDefaultMarker = () => {
          // 마커 스타일 주입 (크기 조정)
          injectMarkerStyles(selectedMarkerStyle, 60);
          
          // 커스텀 집 마커 HTML 생성 (기본 텍스트)
          const tooltipTitle = realTimeMarker.houseName || '매물';
          const tooltipSubtitle = realTimeMarker.address || realTimeMarker.addrRaw || '';
          const customMarkerHTML = createMarkerHTMLWithSeparateText(selectedMarkerStyle, 60, 'kakao-custom-marker', '정보없음', '정보없음', tooltipTitle, tooltipSubtitle);
          
          const content = `<div class="real-time-marker clickable" data-house-no="${realTimeMarker.houseManageNo}" onclick="${clickHandler}()"
            onmouseover="${hoverHandler}(this);" 
            onmouseout="${hoverOutHandler}();"
            style="cursor: pointer; position: relative; display: inline-block;">
            
            ${customMarkerHTML}
            
          </div>`;
          
          const overlay = new window.kakao.maps.CustomOverlay({
            position: new window.kakao.maps.LatLng(realTimeMarker.lat, realTimeMarker.lng),
            content: content,
            xAnchor: 0.15,
            yAnchor: 0.9,
            zIndex: 10000
          });
          
          realTimeOverlays.current.push(overlay);
          
          // 오버레이가 지도에 추가된 후 DOM 요소에 이벤트 리스너 추가
          setTimeout(() => {
            try {
              const overlayElement = overlay.a;
              if (overlayElement && overlayElement.addEventListener) {
                overlayElement.addEventListener('mouseenter', () => {
                  overlay.setZIndex(999999);
                });
                overlayElement.addEventListener('mouseleave', () => {
                  overlay.setZIndex(10000);
                });
              }
            } catch (err) {
              console.warn('[실시간 마커] 이벤트 리스너 추가 실패:', err);
            }
          }, 200);
        };
        
        // 마커 생성 실행
        createMarkerWithJsonData();
    });

    // 모든 레이어의 초기 표시 상태 설정
    setTimeout(() => {
      updateLayersVisibility();
    }, 100); // 약간의 지연을 주어 모든 오버레이가 생성된 후 실행

    // cleanup 함수 - 컴포넌트 언마운트 시 전역 함수들과 타이머들 정리
    return () => {
      clickHandlers.forEach(handler => {
        if (window[handler]) {
          delete window[handler];
        }
      });
      
      // 전역 폴리곤 데이터 정리
      if (window.sigPolygons) {
        delete window.sigPolygons;
      }
      if (window.sidoPolygons) {
        delete window.sidoPolygons;
      }
      
      // 활성 폴리곤과 타이머들 정리
      activePolygon.current = null;
      hoverTimers.current.forEach((timer) => clearTimeout(timer));
      hoverTimers.current.clear();
      
      // 줌 업데이트 타임아웃 정리
      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }
      
      // 오버레이 정리
      if (guNameOverlay.current) {
        guNameOverlay.current.setMap(null);
      }
    };

  }, [isMapReady, sigGeoJsonData, sidoGeoJsonData, markers, priceMarkers, areaPriceMarkers, individualAptMarkers, realTimeMarkers, selectedMarkerStyle, onMarkerClick, onPolygonClick, onRegionClick, onAreaPriceMarkerClick, onIndividualHouseClick, updateLayersVisibility]);

  // 3. 실시간 모드 변경 시 레이어 즉시 업데이트
  useEffect(() => {
    if (isMapReady) {
      console.log(`[모드 변경 감지] 실시간 모드: ${isRealTimeMode}`);
      updateLayersVisibility();
    }
  }, [isRealTimeMode, isMapReady, updateLayersVisibility]);

  // 4. 줌 레벨 변경 시 레이어 업데이트
  useEffect(() => {
    if (isMapReady) {
      console.log(`[줌 레벨 변경 감지] 현재: ${currentZoomLevel}, 모드: ${isRealTimeMode ? '실시간' : '과거'}`);
      updateLayersVisibility();
    }
  }, [currentZoomLevel, isMapReady, updateLayersVisibility, isRealTimeMode]);

  // 전역 함수 등록
  useEffect(() => {
    window.restoreMarkersVisibility = () => {
      console.log('🔄 [마커 복원] 전역 함수 호출됨');
      if (isMapReady) {
        setTimeout(() => {
          updateLayersVisibility();
        }, 0);
      }
    };
    
    return () => {
      delete window.restoreMarkersVisibility;
    };
  }, [isMapReady, updateLayersVisibility]);

  return (
    <div className="w-full h-full relative">
      
      {/* 데이터 토글 버튼 */}
      <DataToggleButton
        isRealTimeMode={isRealTimeMode}
        onToggle={onToggleDataMode}
        realTimeCount={realTimeMarkers.length}
        historicalCount={markers.length + individualAptMarkers.length}
        lastUpdated={lastUpdated}
        isLoading={isLoadingRealTime}
      />
      

      {/* 디버깅 정보 표시 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white rounded-lg px-3 py-2 shadow-lg z-30 max-w-xs">
        <div className="text-sm font-semibold mb-2">🔍 디버깅 정보</div>
        <div className="text-xs space-y-1">
          <div>현재 줌: <span className="text-yellow-300">{currentZoomLevel}</span></div>
          <div>모드: <span className={isRealTimeMode ? 'text-orange-400' : 'text-blue-400'}>
            {isRealTimeMode ? '실시간' : '과거'}
          </span></div>
          {!isRealTimeMode && (
            <>
              <div>시도 폴리곤: <span className={currentZoomLevel > ZOOM_THRESHOLD_HIGH ? 'text-green-400' : 'text-red-400'}>
                {currentZoomLevel > ZOOM_THRESHOLD_HIGH ? '표시' : '숨김'}
              </span></div>
              <div>시군구 폴리곤: <span className={currentZoomLevel > ZOOM_THRESHOLD_LOW && currentZoomLevel <= ZOOM_THRESHOLD_HIGH ? 'text-green-400' : 'text-red-400'}>
                {currentZoomLevel > ZOOM_THRESHOLD_LOW && currentZoomLevel <= ZOOM_THRESHOLD_HIGH ? '표시' : '숨김'}
              </span></div>
              <div>시군구 마커: <span className={currentZoomLevel <= ZOOM_THRESHOLD_HIGH && currentZoomLevel > ZOOM_THRESHOLD_INDIVIDUAL ? 'text-green-400' : 'text-red-400'}>
                {currentZoomLevel <= ZOOM_THRESHOLD_HIGH && currentZoomLevel > ZOOM_THRESHOLD_INDIVIDUAL ? '표시' : '숨김'}
              </span></div>
              <div>개별 주택: <span className={currentZoomLevel <= 6 ? 'text-green-400' : 'text-red-400'}>
                {currentZoomLevel <= 6 ? '표시' : '숨김'} ({individualAptMarkers.length}개)
              </span></div>
            </>
          )}
          {isRealTimeMode && (
            <div>실시간 마커: <span className="text-green-400">
              표시 ({realTimeMarkers.length}개)
            </span></div>
          )}
          <div className="border-t border-gray-600 pt-1 mt-1">
            <div>마커 렌더링: <span className={isRenderingMarkers ? 'text-yellow-300' : 'text-green-400'}>
              {isRenderingMarkers ? '진행중' : '완료'}
            </span></div>
            <div>표시된 마커: <span className="text-blue-300">{visibleMarkersCount}개</span></div>
          </div>
        </div>
      </div>

      {(isLoading || error) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">카카오맵을 불러오는 중...</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">지도 로딩 오류</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">다시 시도</button>
            </div>
          )}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
});

KakaoMap.displayName = 'KakaoMap';

export default KakaoMap; 