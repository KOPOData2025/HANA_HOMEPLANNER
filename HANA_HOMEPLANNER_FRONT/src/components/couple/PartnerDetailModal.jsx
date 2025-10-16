/**
 * 파트너 상세 정보 모달 컴포넌트
 */

import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  Heart,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

const PartnerDetailModal = ({ 
  isOpen, 
  onClose, 
  partnerInfo, 
  coupleStatus 
}) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '정보 없음';
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            활성
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Calendar className="w-4 h-4 mr-1" />
            대기중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            알 수 없음
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-blue-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">파트너 상세 정보</h2>
                  <p className="text-pink-100 text-sm">함께 내 집 마련을 계획하는 파트너</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 파트너 기본 정보 */}
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Heart className="w-5 h-5 text-pink-500 mr-2" />
                파트너 정보
              </h3>
              
              <div className="space-y-3">
                {/* 이름 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-pink-500 mr-3" />
                    <span className="font-medium text-gray-700">이름</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">{partnerInfo?.partnerName || '정보 없음'}</span>
                    {partnerInfo?.partnerName && (
                      <button
                        onClick={() => copyToClipboard(partnerInfo.partnerName, 'name')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'name' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 이메일 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-3" />
                    <span className="font-medium text-gray-700">이메일</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2 text-sm">{partnerInfo?.partnerEmail || '정보 없음'}</span>
                    {partnerInfo?.partnerEmail && (
                      <button
                        onClick={() => copyToClipboard(partnerInfo.partnerEmail, 'email')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 전화번호 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-green-500 mr-3" />
                    <span className="font-medium text-gray-700">전화번호</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">{partnerInfo?.partnerPhoneNumber || '정보 없음'}</span>
                    {partnerInfo?.partnerPhoneNumber && (
                      <button
                        onClick={() => copyToClipboard(partnerInfo.partnerPhoneNumber, 'phone')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'phone' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 커플 연동 정보 */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 text-purple-500 mr-2" />
                커플 연동 정보
              </h3>
              
              <div className="space-y-3">
                {/* 연동 상태 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <span className="font-medium text-gray-700">연동 상태</span>
                  {getStatusBadge(partnerInfo?.coupleStatus || coupleStatus?.status)}
                </div>

                {/* 연동일 */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-purple-500 mr-3" />
                    <span className="font-medium text-gray-700">연동일</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    {formatDate(partnerInfo?.coupleCreatedAt || coupleStatus?.createdAt)}
                  </span>
                </div>

                {/* 커플 ID */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <span className="font-medium text-gray-700">커플 ID</span>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-mono text-sm mr-2">
                      {partnerInfo?.coupleId ? partnerInfo.coupleId.substring(0, 12) + '...' : '정보 없음'}
                    </span>
                    {partnerInfo?.coupleId && (
                      <button
                        onClick={() => copyToClipboard(partnerInfo.coupleId, 'coupleId')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'coupleId' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 파트너 사용자 ID */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100">
                  <span className="font-medium text-gray-700">파트너 ID</span>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-mono text-sm mr-2">
                      {partnerInfo?.partnerUserId || '정보 없음'}
                    </span>
                    {partnerInfo?.partnerUserId && (
                      <button
                        onClick={() => copyToClipboard(partnerInfo.partnerUserId, 'partnerId')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copiedField === 'partnerId' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all duration-200"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailModal;
