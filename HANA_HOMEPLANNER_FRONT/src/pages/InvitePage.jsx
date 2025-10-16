/**
 * 초대 링크 처리 페이지
 * 커플 초대 링크를 통해 접근한 사용자를 처리하는 페이지
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { Heart, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useInviteSignup } from '@/hooks/useInviteSignup';
import { coupleAcceptService } from '@/services/coupleAcceptService';
import { getUser } from '@/lib/auth';
import toast from 'react-hot-toast';

const InvitePage = () => {
  const { inviteToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const { getInviteInfo } = useInviteSignup();

  useEffect(() => {
    // URL에서 초대 토큰 추출
    const token = inviteToken || searchParams.get('token') || searchParams.get('invite');
    
    if (!token) {
      setError('초대 링크가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    // 배우자 초대 토큰을 sessionStorage에 저장 (로그인/회원가입 후 리다이렉트용)
    // 적금 초대 링크와 구분하기 위해 배우자 초대만 설정
    if (window.location.pathname.includes('/invite/') && !window.location.pathname.includes('/joint-savings/')) {
      sessionStorage.setItem('coupleInviteToken', token);
    }

    // 초대 정보 로드 (실제 API 호출)
    const loadInviteInfo = async () => {
      try {
        console.log('초대 토큰:', token);
        
        // 실제 API 호출
        const inviteData = await getInviteInfo(token);
        
        let inviterName = '배우자';
        
        // 초대자 ID가 있으면 실제 초대자 정보 조회
        if (inviteData.inviterId) {
          try {
            const inviterInfo = await coupleAcceptService.getInviterInfo(inviteData.inviterId);
            inviterName = inviterInfo.userNm || '배우자';
          } catch (inviterError) {
            console.warn('초대자 정보 조회 실패:', inviterError);
            inviterName = inviteData.inviterName || '배우자';
          }
        } else {
          inviterName = inviteData.inviterName || '배우자';
        }
        
        const processedInviteInfo = {
          inviterName: inviterName,
          inviterId: inviteData.inviterId || null,
          inviterEmail: inviteData.inviterEmail || '',
          message: inviteData.message || '함께 내 집 마련 계획을 세워보세요!',
          token: token
        };
        
        setInviteInfo(processedInviteInfo);
      } catch (err) {
        console.error('초대 정보 로드 실패:', err);
        
        // 토큰 만료 에러인지 확인
        if (err.message && err.message.includes('토큰이 만료되었습니다')) {
          setError('TOKEN_EXPIRED');
        } else {
          setError('초대 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInviteInfo();
  }, [inviteToken, searchParams]);

  const handleJoinCouple = async () => {
    // 로그인된 사용자인지 확인
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // 이미 로그인된 경우 - 커플 연결 API 호출
      setIsAccepting(true);
      
      try {
        const user = getUser();
        const acceptorId = user?.userId || user?.id;
        
        if (!acceptorId) {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }
        
        const response = await coupleAcceptService.acceptInvite(inviteInfo.token, acceptorId);
        
        if (response.success) {
          setIsAccepted(true);
          toast.success('커플 연결이 완료되었습니다! 🎉', {
            duration: 4000,
            position: 'top-center'
          });
        } else {
          throw new Error(response.message || '커플 연결에 실패했습니다.');
        }
      } catch (err) {
        console.error('커플 연결 오류:', err);
        toast.error(err.message || '커플 연결 중 오류가 발생했습니다.', {
          duration: 4000,
          position: 'top-center'
        });
      } finally {
        setIsAccepting(false);
      }
    } else {
      // 로그인되지 않은 경우 - 회원가입 페이지로 이동 (초대 토큰 포함)
      navigate(`/signup?invite_token=${inviteInfo.token}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">초대 정보를 확인하고 있습니다...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 토큰 만료 상태 (로그인/회원가입 선택)
  if (error === 'TOKEN_EXPIRED') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              커플 초대장
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              배우자님이 함께 내 집 마련 계획을 세우자고 초대했습니다!
            </p>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">초대 토큰</span>
                  <span className="font-mono text-gray-800">{inviteToken}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // 배우자 초대는 coupleInviteToken만 사용 (pendingInviteUrl 설정하지 않음)
                  navigate('/login');
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                로그인하기
              </button>
              
              <button
                onClick={() => {
                  // 배우자 초대는 coupleInviteToken만 사용 (pendingInviteUrl 설정하지 않음)
                  navigate(`/signup?invite_token=${inviteToken}`);
                }}
                className="w-full px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium"
              >
                회원가입하기
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 기타 에러 상태
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">초대 링크 오류</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // 커플 연결 완료 화면
  if (isAccepted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                커플 연결 완료! 🎉
              </h1>
              
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-green-600">{inviteInfo.inviterName}</span>님과 
                성공적으로 연결되었습니다!
              </p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">커플 연동 완료!</h3>
                </div>
                <p className="text-green-700 text-sm">
                  이제 파트너와 함께 내 집 마련 계획을 세우고, 
                  청약 정보를 공유하며 가계부를 관리할 수 있습니다!
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/mypage')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center"
                >
                  <span>마이페이지로 이동</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors py-3 px-6"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* 가로 레이아웃 초대 카드 */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* 좌측: 초대 정보 */}
              <div className="lg:w-1/2 p-8 lg:p-12">
                {/* 아이콘 */}
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>

                {/* 제목 */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  커플 초대장
                </h1>
                
                {/* 초대자 정보 */}
                <p className="text-lg text-gray-600 mb-6">
                  <span className="font-semibold text-pink-600">{inviteInfo.inviterName}</span>님이 
                  함께 내 집 마련 계획을 세우자고 초대했습니다!
                </p>

                {/* 메시지 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 italic">
                    "{inviteInfo.message}"
                  </p>
                </div>

                {/* 액션 버튼 */}
                <button
                  onClick={handleJoinCouple}
                  disabled={isAccepting}
                  className={`w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isAccepting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:from-pink-600 hover:to-blue-600'
                  }`}
                >
                  {isAccepting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>연결 중...</span>
                    </>
                  ) : (
                    <>
                      <span>함께 시작하기</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                {/* 안내 텍스트 */}
                <p className="text-sm text-gray-500 mt-4">
                  계정이 없으시면 회원가입 후 자동으로 연결됩니다
                </p>

                {/* 로그인 링크 */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <button
                      onClick={() => navigate(`/login?invite_token=${inviteInfo.token}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      로그인하기
                    </button>
                  </p>
                </div>
              </div>

              {/* 우측: 이미지 섹션 */}
              <div className="lg:w-1/2 bg-gradient-to-br from-blue-50 to-pink-50 p-8 lg:p-12">
                <div className="h-full flex flex-col justify-center items-center">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">함께하는 내 집 마련</h3>
                    <p className="text-gray-600">파트너와 함께 목표를 달성해보세요</p>
                  </div>
                  
                  {/* bank-book.png 이미지 */}
                  <div className="w-full max-w-sm">
                    <img 
                      src="/mypage/bank-book.png" 
                      alt="함께하는 내 집 마련" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      커플 연동으로 더 스마트한<br />
                      자산 관리와 목표 달성을 경험하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvitePage;
