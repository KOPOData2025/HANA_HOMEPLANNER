import React from 'react';

const DataToggleButton = ({ 
  isRealTimeMode, 
  onToggle, 
  realTimeCount = 0, 
  historicalCount = 0,
  lastUpdated = null,
  isLoading = false 
}) => {
  const formatLastUpdated = (date) => {
    if (!date) return '업데이트 없음';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-3 shadow-lg z-30">
      <div className="flex items-center space-x-4">
        {/* 토글 버튼 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isRealTimeMode 
                ? 'bg-blue-600' 
                : 'bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isRealTimeMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${
            isRealTimeMode ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {isRealTimeMode ? '실시간' : '과거'}
          </span>
        </div>

        

        {/* 마지막 업데이트 시간 */}
        {isRealTimeMode && lastUpdated && (
          <div className="text-xs text-gray-500">
            마지막 업데이트: {formatLastUpdated(lastUpdated)}
          </div>
        )}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs text-blue-600">업데이트 중...</span>
          </div>
        )}
      </div>

      {/* 모드 설명 */}
      <div className="mt-2 text-xs text-gray-500">
        {isRealTimeMode 
          ? '현재 진행 중인 청약 정보만 표시됩니다.' 
          : '과거 청약 데이터와 통계 정보가 표시됩니다.'
        }
      </div>
    </div>
  );
};

export default DataToggleButton;
