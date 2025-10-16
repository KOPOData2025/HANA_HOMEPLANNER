/**
 * 파트너 정보 표시 카드 컴포넌트
 */

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Heart, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Eye,
  ChevronRight
} from 'lucide-react';
import PartnerDetailModal from './PartnerDetailModal';

const PartnerInfoCard = ({ 
  coupleStatus, 
  partnerInfo, 
  isLoading, 
  onRefresh 
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 rounded-xl p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-pink-500 animate-spin mr-2" />
          <span className="text-pink-600 font-medium">커플 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!coupleStatus?.hasCouple) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '정보 없음';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            활성
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            알 수 없음
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-blue-50 border border-pink-200 rounded-xl p-6 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">커플 연동</h3>
            <p className="text-sm text-gray-600">함께 내 집 마련 계획을 세우고 있어요</p>
          </div>
        </div>
        {getStatusBadge(coupleStatus.status)}
      </div>

      {/* 파트너 기본 정보 (간단하게) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-pink-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">파트너</p>
              <p className="text-lg font-semibold text-gray-800">
                {partnerInfo?.partnerName || '파트너 정보 없음'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">연동일</p>
            <p className="text-sm text-gray-600">
              {formatDate(partnerInfo?.coupleCreatedAt || coupleStatus?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="mt-4 pt-4 border-t border-pink-200 space-y-2">
        <button
          onClick={() => setIsDetailModalOpen(true)}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all duration-200"
        >
          <Eye className="w-4 h-4 mr-2" />
          상세 정보 보기
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
        
        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-200 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          정보 새로고침
        </button>
      </div>

      {/* 상세 정보 모달 */}
      <PartnerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        partnerInfo={partnerInfo}
        coupleStatus={coupleStatus}
      />
    </div>
  );
};

export default PartnerInfoCard;
