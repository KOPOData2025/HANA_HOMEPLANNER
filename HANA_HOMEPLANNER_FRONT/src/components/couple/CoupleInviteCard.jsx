/**
 * 커플 초대 유도 카드 컴포넌트
 */

import React from 'react';
import { 
  Users, 
  Heart, 
  ArrowRight, 
  MessageCircle,
  Share2,
  Sparkles
} from 'lucide-react';

const CoupleInviteCard = ({ 
  onKakaoInvite, 
  onCopyLink, 
  isGenerating, 
  inviteLink 
}) => {
  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border border-pink-200 rounded-xl p-6 shadow-sm">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          커플과 함께 내 집 마련하세요! 💕
        </h3>
        <p className="text-gray-600 text-sm">
          배우자와 함께 청약 정보를 공유하고<br />
          맞춤형 대출 상품을 추천받아보세요
        </p>
      </div>

      {/* 혜택 안내 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center p-3 bg-white rounded-lg border border-pink-100">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">청약 정보 실시간 공유</p>
            <p className="text-xs text-gray-500">관심 있는 청약 정보를 함께 확인</p>
          </div>
        </div>

        <div className="flex items-center p-3 bg-white rounded-lg border border-pink-100">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <MessageCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">맞춤형 대출 상품 추천</p>
            <p className="text-xs text-gray-500">커플 맞춤 대출 상품과 계획 수립</p>
          </div>
        </div>

        <div className="flex items-center p-3 bg-white rounded-lg border border-pink-100">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">가계부 및 자산 관리 공유</p>
            <p className="text-xs text-gray-500">함께하는 금융 관리로 목표 달성</p>
          </div>
        </div>
      </div>

      {/* 초대 버튼들 */}
      <div className="space-y-3">
        {/* 카카오톡 초대 버튼 */}
        <button
          onClick={onKakaoInvite}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span>
            {isGenerating ? '초대 링크 생성 중...' : '카카오톡으로 초대하기'}
          </span>
        </button>

        {/* 링크 복사 버튼 */}
        {inviteLink && (
          <button
            onClick={onCopyLink}
            className="w-full bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            초대 링크 복사하기
          </button>
        )}
      </div>

      {/* 안내 텍스트 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          초대 링크를 공유하면 배우자가 회원가입 후 자동으로 연결됩니다
        </p>
      </div>
    </div>
  );
};

export default CoupleInviteCard;
