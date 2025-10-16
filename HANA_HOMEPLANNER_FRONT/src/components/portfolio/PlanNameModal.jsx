import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const PlanNameModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  planType, 
  isLoading = false 
}) => {
  const [planName, setPlanName] = useState('');

  // 플랜 타입에 따른 기본 이름 제안
  const getDefaultPlanName = (type) => {
    switch (type) {
      case '보수형':
        return '안전한 주택 구매 계획';
      case '균형형':
        return '균형잡힌 내집마련 플랜';
      case '공격형':
        return '적극적인 투자 계획';
      default:
        return '나만의 주택 계획';
    }
  };

  // 모달이 열릴 때 기본 이름 설정
  useEffect(() => {
    if (isOpen) {
      setPlanName(getDefaultPlanName(planType));
    }
  }, [isOpen, planType]);

  // 모달이 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setPlanName('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (planName.trim()) {
      onConfirm(planName.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">플랜 이름 설정</h2>
            <p className="text-sm text-gray-500 mt-1">
              {planType} 포트폴리오 플랜의 이름을 입력해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 내용 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-2">
              플랜 이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="planName"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 안전한 주택 구매 계획"
              maxLength={50}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                최대 50자까지 입력 가능합니다
              </p>
              <p className="text-xs text-gray-400">
                {planName.length}/50
              </p>
            </div>
          </div>

          {/* 추천 이름들 */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">추천 이름</p>
            <div className="flex flex-wrap gap-2">
              {[
                getDefaultPlanName(planType),
                '내집마련 프로젝트',
                '주택구매 마스터플랜',
                'Dream House 계획'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPlanName(suggestion)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!planName.trim() || isLoading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  플랜 저장하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanNameModal;
