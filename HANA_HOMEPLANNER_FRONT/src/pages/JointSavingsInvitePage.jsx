/**
 * 공동적금 초대 링크 생성 페이지
 * JOINT_SAVING 상품 가입 후 파트너 초대를 위한 링크 생성
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { createJointSavingsInvitation } from '@/services/invitationService';
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import JointSavingsKakaoShareButton from '@/components/common/JointSavingsKakaoShareButton';
import { getUser } from '@/lib/auth';
import { authService } from '@/services/authService';

const JointSavingsInvitePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // location.state에서 전달받은 데이터
  const { accountNumber, productName, productId } = location.state || {};
  
  // 사용자 이름을 API로 가져오기
  const fetchUserName = async () => {
    try {
      const response = await authService.getUserName();
      if (response.success && response.data?.userNm) {
        setUserName(response.data.userNm);
      } else {
        setUserName('하나님');
      }
    } catch (error) {
      console.error('사용자 이름 조회 실패:', error);
      setUserName('하나님');
    }
  };
  
  const [isCreating, setIsCreating] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);

  // 초대 링크 생성
  const handleCreateInvitation = async () => {
    if (!accountNumber) {
      setError('계좌번호 정보가 없습니다.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await createJointSavingsInvitation(accountNumber);
      
      if (response.success) {
        setInvitationData(response.data);
        toast.success('초대 링크가 생성되었습니다!', {
          duration: 3000,
          position: 'top-center'
        });
      } else {
        throw new Error(response.message || '초대 링크 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('초대 링크 생성 오류:', err);
      setError(err.message || '초대 링크 생성 중 오류가 발생했습니다.');
      toast.error('초대 링크 생성에 실패했습니다.', {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // 초대 링크 복사
  const handleCopyLink = async () => {
    if (!invitationData?.inviteId) return;

    const inviteLink = `${window.location.origin}/joint-savings/accept/${invitationData.inviteId}`;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('초대 링크가 복사되었습니다!', {
        duration: 2000,
        position: 'top-center'
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('링크 복사 오류:', err);
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  // 페이지 로드 시 자동으로 초대 링크 생성
  useEffect(() => {
    // 사용자 이름 가져오기
    fetchUserName();
    
    if (accountNumber && !invitationData && !isCreating) {
      handleCreateInvitation();
    }
  }, [accountNumber]);

  // 필수 데이터가 없는 경우 처리
  if (!accountNumber || !productName) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">접근 오류</h2>
            <p className="text-gray-600 mb-6">필요한 정보가 없습니다.</p>
            <button
              onClick={() => navigate('/savings-products')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              적금 상품 목록으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="savings">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/savings-products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              상품 목록으로 돌아가기
            </button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                공동적금 파트너 초대
              </h1>
              
              <p className="text-lg text-gray-600 mb-4">
                <span className="font-semibold text-orange-600">{productName}</span>에 함께 참여할 파트너를 초대해보세요
              </p>
              
            
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="max-w-6xl mx-auto">
            
            {/* 좌우 5:5 배치 */}
            <div className="flex items-start gap-12">
              
              {/* 좌측 절반 - 아이콘 영역 (50%) */}
              <div className="w-1/2 flex justify-center items-center">
                <div className="w-full h-full max-w-lg max-h-lg flex items-center justify-center p-8">
                  <img
                    src="/icon/invite.png"
                    alt="공동적금 초대 아이콘"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* 우측 절반 - 초대 링크 관리 (50%) */}
              <div className="w-1/2 flex flex-col space-y-6">
                
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-4 text-white">
                  <h2 className="text-xl font-semibold">적금 초대</h2>
                  <p className="text-orange-100 text-sm mt-1">링크를 복사하고 파트너를 초대해보세요!</p>
                </div>

                {/* 안내 멘트 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm">💡</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">초대 방법 안내</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        아래 버튼을 통해 파트너에게 초대 링크를 전달하거나 카카오톡으로 직접 초대 메시지를 보낼 수 있습니다. 
                        파트너가 링크를 통해 가입하면 함께 목표를 향해 나아갈 수 있어요! 🎯
                      </p>
                    </div>
                  </div>
                </div>
              
              {/* 초대 링크 생성 카드 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                
                {!invitationData ? (
                  <div className="text-center py-8">
                    {isCreating ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="text-gray-600">초대 링크를 생성하는 중...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">아직 초대 링크가 생성되지 않았습니다.</p>
                        <button
                          onClick={handleCreateInvitation}
                          disabled={isCreating}
                          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          초대 링크 생성하기
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                  
                    
                    <div className="space-y-3">
                      {/* 링크 복사와 카카오톡 초대 버튼을 좌우 5:5로 배치 */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          링크 복사
                        </button>
                        
                        {/* 카카오톡 공유 버튼 */}
                        <JointSavingsKakaoShareButton
                          inviteUrl={`${window.location.origin}/joint-savings/accept/${invitationData.inviteId}`}
                          productName={productName}
                          accountNumber={accountNumber}
                          userName={userName}
                          isGenerating={isCreating}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">오류</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                )}
              </div>

              {/* 초대 상태 정보 */}
              {invitationData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">상태</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invitationData.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {invitationData.status === 'PENDING' ? '대기 중' : '수락됨'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">생성일</span>
                      <span className="text-sm text-gray-800">
                        {(() => {
                          try {
                            // createdAt이 배열 형태인 경우 처리
                            if (Array.isArray(invitationData.createdAt)) {
                              const [year, month, day, hour, minute, second] = invitationData.createdAt;
                              const date = new Date(year, month - 1, day, hour, minute, second);
                              return date.toLocaleDateString('ko-KR');
                            }
                            // 일반적인 Date 객체나 문자열인 경우
                            return new Date(invitationData.createdAt).toLocaleDateString('ko-KR');
                          } catch (error) {
                            console.error('날짜 파싱 오류:', error);
                            return '날짜 정보 없음';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JointSavingsInvitePage;
