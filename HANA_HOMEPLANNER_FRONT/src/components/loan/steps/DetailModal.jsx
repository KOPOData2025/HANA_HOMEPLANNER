/**
 * 상세 정보 모달 컴포넌트
 */

import React from 'react';
import { X } from 'lucide-react';
import LTVResultCard from '@/components/loan/LTVResultCard';
import DSRResultCard from '@/components/loan/DSRResultCard';
import DTIResultCard from '@/components/loan/DTIResultCard';

const DetailModal = ({ isOpen, onClose, type, data }) => {
  if (!isOpen || !data) return null;

  const getModalInfo = () => {
    switch (type) {
      case 'ltv':
        return {
          title: 'LTV 분석 상세 정보',
          icon: '🏠',
          color: 'blue'
        };
      case 'dsr':
        return {
          title: 'DSR 분석 상세 정보',
          icon: '💰',
          color: 'purple'
        };
      case 'dti':
        return {
          title: 'DTI 분석 상세 정보',
          icon: '📊',
          color: 'emerald'
        };
      default:
        return null;
    }
  };

  const modalInfo = getModalInfo();
  if (!modalInfo) return null;

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    emerald: 'border-emerald-200 bg-emerald-50'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${colorClasses[modalInfo.color]}`}>
        {/* 모달 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{modalInfo.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">{modalInfo.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          {type === 'ltv' && <LTVResultCard ltvData={data} />}
          {type === 'dsr' && <DSRResultCard dsrData={data} />}
          {type === 'dti' && <DTIResultCard dtiData={data} />}
        </div>

        {/* 모달 푸터 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
