/**
 * 공동적금 초대 수락 페이지
 * 초대 링크를 통해 접속한 사용자가 공동적금 초대를 수락하는 페이지
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { getInvitationDetail, acceptInvitation } from '@/services/invitationService';
import { authService } from '@/services/authService';
import { API_BASE_URL } from '@/config/api';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Clock,
  UserPlus,
  MessageCircle,
  PiggyBank,
  Heart,
  Star,
  Gift,
  Shield,
  Info,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const JointSavingsInviteAcceptPage = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  
  const [invitationData, setInvitationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [inviterName, setInviterName] = useState('');

  // 공동적금 초대 수락 API 호출
  const acceptJointSavingsInvite = async () => {
    try {
      setIsAccepting(true);
      console.log('🔍 공동적금 초대 수락 API 호출:', inviteId);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/bank/invitations/${inviteId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 공동적금 초대 수락 성공:', result);
        toast.success('공동적금 초대를 수락했습니다!');
        
        // 적금 가입 페이지로 이동
        navigate(`/joint-savings/signup/${inviteId}`);
      } else {
        throw new Error(result.message || '공동적금 초대 수락 실패');
      }
    } catch (error) {
      console.error('❌ 공동적금 초대 수락 실패:', error);
      toast.error(error.message || '공동적금 초대 수락 중 오류가 발생했습니다.');
    } finally {
      setIsAccepting(false);
    }
  };

  // 초대 정보 조회
  const fetchInvitationDetail = async () => {
    if (!inviteId) {
      setError('초대 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getInvitationDetail(inviteId);
      console.log('🚀 초대 상세 정보 조회 성공:', response);
      
      if (response.success && response.data) {
        setInvitationData(response.data);
        
        // 초대자 이름 조회
        try {
          const inviterResponse = await fetch(`${API_BASE_URL}/api/users/${response.data.inviterId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (inviterResponse.ok) {
            const inviterData = await inviterResponse.json();
            if (inviterData.success && inviterData.data?.userNm) {
              setInviterName(inviterData.data.userNm);
            }
          }
        } catch (nameError) {
          console.warn('초대자 이름 조회 실패:', nameError);
        }
      } else {
        setError(response.message || '초대 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('🚨 초대 상세 정보 조회 실패:', err);
      setError('초대 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초대 수락 처리
  const handleAcceptInvitation = async () => {
    if (!invitationData) return;

    try {
      setIsAccepting(true);
      
      const response = await acceptInvitation(invitationData.inviteId);
      console.log('🚀 초대 수락 응답:', response);
      
      if (response.success) {
        setIsAccepted(true);
        toast.success('초대를 성공적으로 수락했습니다!');
        
        // 잠시 후 마이페이지로 이동
        setTimeout(() => {
          navigate('/my-page');
        }, 2000);
      } else {
        toast.error(response.message || '초대 수락에 실패했습니다.');
      }
    } catch (err) {
      console.error('🚨 초대 수락 실패:', err);
      toast.error('초대 수락 중 오류가 발생했습니다.');
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    fetchInvitationDetail();
  }, [inviteId]);

  // 로그인 후 돌아왔을 때 초대 수락 처리
  useEffect(() => {
    const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
    const storedInviteId = sessionStorage.getItem('JOINT_SAVINGS_INVITE_ID');
    
    if (pendingInviteUrl && storedInviteId === inviteId && authService.isLoggedIn()) {
      // 로그인 후 돌아온 경우 초대 수락 API 호출
      console.log('🔍 로그인 후 돌아옴 - 초대 수락 처리');
      acceptJointSavingsInvite();
      
      // 세션 스토리지 정리
      sessionStorage.removeItem('pendingInviteUrl');
      sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
    }
  }, [inviteId]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">초대 정보를 불러오는 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 로그인 필요 상태
  if (!authService.isLoggedIn()) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            {/* 메인 카드 */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row min-h-[600px]">
                
                {/* 좌측 섹션 - 공동적금 초대장 */}
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="text-center lg:text-left">
                    {/* 공동적금 아이콘 */}
                    <div className="flex justify-center lg:justify-start mb-6">
                      <img
                        src="/mypage/bank-book.png"
                        alt="공동적금 아이콘"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    
                    {/* 제목 */}
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      공동적금 초대장
                    </h1>
                    
                    {/* 초대 메시지 */}
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      <span className="text-red-500 font-semibold">{inviterName ? `${inviterName}님` : '파트너님'}</span>이 공동적금에 함께 참여하도록 초대했습니다!
                    </p>
                    
                    {/* 초대 텍스트 박스 */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <p className="text-gray-800 font-medium text-center">
                        "함께 목표를 향해 저축해보세요!"
                      </p>
                    </div>
                    
                    {/* 함께 시작하기 버튼 */}
                    <button
                      onClick={() => {
                        // 로그인 상태 확인
                        const token = localStorage.getItem('accessToken');
                        if (token) {
                          // 로그인된 상태: 초대 수락 API 호출
                          acceptJointSavingsInvite();
                        } else {
                          // 로그인되지 않은 상태: 로그인 페이지로 이동
                          const currentPath = window.location.pathname;
                          sessionStorage.removeItem('pendingInviteUrl');
                          sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
                          
                          let storageAvailable = true;
                          try {
                            sessionStorage.setItem('test', 'test');
                            sessionStorage.removeItem('test');
                          } catch (e) {
                            storageAvailable = false;
                          }
                          
                          if (storageAvailable) {
                            sessionStorage.setItem('pendingInviteUrl', currentPath);
                            sessionStorage.setItem('JOINT_SAVINGS_INVITE_ID', inviteId);
                          }
                          
                          navigate(`/login?inviteId=${inviteId}&type=joint-savings`);
                        }
                      }}
                      disabled={isAccepting}
                      className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAccepting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          수락 중...
                        </>
                      ) : (
                        <>
                          함께 시작하기
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                        </>
                      )}
                    </button>
                    
                    {/* 계정 정보 */}
                    <div className="mt-6 text-sm text-gray-600 space-y-1">
                      <p>계정이 없으시면 회원가입 후 자동으로 연결됩니다</p>
                      <p>
                        이미 계정이 있으신가요? 
                        <button
                          onClick={() => {
                            const currentPath = window.location.pathname;
                            sessionStorage.removeItem('pendingInviteUrl');
                            sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
                            
                            let storageAvailable = true;
                            try {
                              sessionStorage.setItem('test', 'test');
                              sessionStorage.removeItem('test');
                            } catch (e) {
                              storageAvailable = false;
                            }
                            
                            if (storageAvailable) {
                              sessionStorage.setItem('pendingInviteUrl', currentPath);
                              sessionStorage.setItem('JOINT_SAVINGS_INVITE_ID', inviteId);
                            }
                            
                            navigate(`/login?inviteId=${inviteId}&type=joint-savings`);
                          }}
                          className="text-blue-600 hover:text-blue-800 underline ml-1"
                        >
                          로그인하기
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 우측 섹션 - 공동적금 혜택 */}
                <div className="lg:w-1/2 bg-gradient-to-br from-green-50 to-emerald-50 p-8 lg:p-12 flex flex-col justify-center items-center">
                  <div className="text-center">
                    {/* 제목 */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                      함께하는 공동적금
                    </h2>
                    
                    {/* 부제목 */}
                    <p className="text-lg text-gray-700 mb-8">
                      파트너와 함께 목표를 달성해보세요
                    </p>
                    
                    {/* 공동적금 아이콘 */}
                    <div className="relative mb-8">
                      <img
                        src="/icon/invite.png"
                        alt="공동적금 초대 아이콘"
                        className="w-48 h-48 object-contain mx-auto"
                      />
                    </div>
                    
                    {/* 하단 메시지 */}
                    <p className="text-sm text-gray-600">
                      공동적금으로 더 스마트한 자산 관리와 목표 달성을 경험하세요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 재시도 상태
  if (retryCount > 0) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">일시적인 오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">서버에서 일시적인 오류가 발생했습니다. 다시 시도해보세요.</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setRetryCount(prev => prev + 1);
                  fetchInvitationDetail();
                }}
                className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                다시 시도하기
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
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('🚀 [JointSavingsInviteAcceptPage] 에러 상태 로그인 버튼 클릭');
                  console.log('🚀 현재 inviteId:', inviteId);
                  if (inviteId) {
                    navigate(`/login?inviteId=${inviteId}&type=joint-savings`);
                  } else {
                    navigate('/login');
                  }
                }}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                로그인하기
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

  // 초대 정보가 없는 경우
  if (!invitationData) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">초대를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">초대 링크가 유효하지 않거나 만료되었습니다.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // 초대 수락 완료 상태
  if (isAccepted) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              초대 수락 완료! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              공동적금에 성공적으로 참여하셨습니다.<br />
              파트너와 함께 목표를 향해 나아가세요!
            </p>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">초대 ID</span>
                  <span className="font-mono text-gray-800">{invitationData.inviteId}</span>
                </div>
                
                {invitationData.accountId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">공동계좌 ID</span>
                    <span className="font-mono text-gray-800">{invitationData.accountId}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">상태</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    수락됨
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">수락일</span>
                  <span className="text-gray-800">
                    {new Date(invitationData.respondedAt || invitationData.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">공동계좌 가입 완료!</h3>
              </div>
              <p className="text-green-700 text-sm">
                이제 파트너와 함께 공동적금을 이용하실 수 있습니다. 
                마이페이지에서 계좌 정보를 확인하고 저축을 시작해보세요!
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-page')}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
              >
                마이페이지로 이동
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

  // 초대 수락 페이지
  return (
    <Layout currentPage="savings">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* 메인 카드 */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              
              {/* 좌측 섹션 - 커플 초대장 */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="text-center lg:text-left">
                  {/* 커플 아이콘 */}
                  <div className="flex justify-center lg:justify-start mb-6">
                    <img
                      src="/icon/invite.png"
                      alt="커플 초대 아이콘"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  
                  {/* 제목 */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    커플 초대장
                  </h1>
                  
                  {/* 초대 메시지 */}
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    <span className="text-red-500 font-semibold">배우자님</span>이 함께 내 집 마련 계획을 세우자고 초대했습니다!
                  </p>
                  
                  {/* 초대 텍스트 박스 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-gray-800 font-medium text-center">
                      "함께 내 집 마련 계획을 세워보세요!"
                    </p>
                  </div>
                  
                  {/* 함께 시작하기 버튼 */}
                  <button
                    onClick={handleAcceptInvitation}
                    disabled={isAccepting}
                    className={`w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      isAccepting ? 'opacity-50 cursor-not-allowed' : 'hover:from-pink-600 hover:to-blue-600'
                    }`}
                  >
                    {isAccepting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        수락 중...
                      </>
                    ) : (
                      <>
                        함께 시작하기
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </>
                    )}
                  </button>
                  
                  {/* 계정 정보 */}
                  <div className="mt-6 text-sm text-gray-600 space-y-1">
                    <p>계정이 없으시면 회원가입 후 자동으로 연결됩니다</p>
                    <p>
                      이미 계정이 있으신가요? 
                      <button
                        onClick={() => {
                          const currentPath = window.location.pathname;
                          sessionStorage.removeItem('pendingInviteUrl');
                          sessionStorage.removeItem('JOINT_SAVINGS_INVITE_ID');
                          
                          let storageAvailable = true;
                          try {
                            sessionStorage.setItem('test', 'test');
                            sessionStorage.removeItem('test');
                          } catch (e) {
                            storageAvailable = false;
                          }
                          
                          if (storageAvailable) {
                            sessionStorage.setItem('pendingInviteUrl', currentPath);
                            sessionStorage.setItem('JOINT_SAVINGS_INVITE_ID', inviteId);
                          }
                          
                          navigate(`/login?inviteId=${inviteId}&type=joint-savings`);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        로그인하기
                      </button>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 우측 섹션 - 함께하는 내 집 마련 */}
              <div className="lg:w-1/2 bg-gradient-to-br from-teal-50 to-blue-50 p-8 lg:p-12 flex flex-col justify-center items-center">
                <div className="text-center">
                  {/* 제목 */}
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    함께하는 내 집 마련
                  </h2>
                  
                  {/* 부제목 */}
                  <p className="text-lg text-gray-700 mb-8">
                    파트너와 함께 목표를 달성해보세요
                  </p>
                  
                  {/* 3D 일러스트레이션 영역 */}
                  <div className="relative mb-8">
                    {/* 책/플래너 일러스트레이션 */}
                    <div className="relative">
                      {/* 책 본체 */}
                      <div className="w-48 h-32 bg-teal-500 rounded-lg shadow-lg transform rotate-3 relative">
                        {/* 책 표지 */}
                        <div className="absolute inset-0 bg-teal-500 rounded-lg">
                          {/* 사람 아이콘 */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                            </div>
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          </div>
                          
                          {/* 숫자 9 또는 스와일 */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <span className="text-teal-500 font-bold text-sm">9</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 책 등 */}
                        <div className="absolute -left-2 top-0 w-4 h-full bg-amber-100 rounded-l-lg"></div>
                      </div>
                      
                      {/* 그림자 효과 */}
                      <div className="absolute inset-0 bg-teal-500 rounded-lg opacity-20 transform rotate-3 translate-x-1 translate-y-1"></div>
                    </div>
                  </div>
                  
                  {/* 하단 메시지 */}
                  <p className="text-sm text-gray-600">
                    커플 연등으로 더 스마트한 자산 관리와 목표 달성을 경험하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 추가 정보 카드 */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">초대 정보</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 mb-1">초대 ID</div>
                  <div className="font-mono text-gray-800">{invitationData.inviteId}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 mb-1">초대자</div>
                  <div className="text-gray-800">{inviterName || invitationData.inviterId}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 mb-1">상태</div>
                  <div className="text-green-600 font-medium">대기 중</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JointSavingsInviteAcceptPage;