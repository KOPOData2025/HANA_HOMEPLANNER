import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  planName,
  planType,
  isDeleting = false 
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 모달이 열릴 때마다 확인 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setIsConfirmed(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    console.log('🔍 삭제 확인 버튼 클릭됨');
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">플랜 삭제 확인</h2>
              <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          {/* 경고 메시지 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  정말로 이 플랜을 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-red-700">
                  삭제된 플랜은 복구할 수 없으며, 모든 설정과 데이터가 영구적으로 사라집니다.
                </p>
              </div>
            </div>
          </div>

          {/* 삭제할 플랜 정보 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">삭제할 플랜</h4>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{planName}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    {planType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 확인 체크박스 */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => {
                  console.log('🔍 체크박스 상태 변경:', e.target.checked);
                  setIsConfirmed(e.target.checked);
                }}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={isDeleting}
              />
              <span className="text-sm text-gray-700">
                위 내용을 확인했으며, 플랜을 영구적으로 삭제하는 것에 동의합니다.
              </span>
            </label>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmed || isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  플랜 삭제하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
