/**
 * 초대 기반 공동적금 가입 페이지
 * 초대 링크를 통해 접속한 사용자를 적금 가입 페이지로 리다이렉트
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { getInvitationDetail, getInvitationAccountInfo } from '@/services/invitationService';
import { authService } from '@/services/authService';
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Clock,
  PiggyBank,
  Heart,
  Star,
  Gift,
  Shield,
  Info,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const JointSavingsSignupPage = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  
  const [invitationData, setInvitationData] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviterName, setInviterName] = useState('');

  // 초대 기반 계좌 정보 조회
  const fetchAccountInfo = async () => {
    try {
      const response = await getInvitationAccountInfo(inviteId);
      
      if (response.success) {
        setAccountInfo(response.data);
        console.log('✅ 초대 기반 계좌 정보 조회 성공:', response.data);
        
        // 적금 가입 페이지로 리다이렉트 (초대 정보를 state로 전달)
        navigate('/savings-signup/joint-savings/' + response.data.savingsProduct.productId, {
          state: {
            invitationData: response.data, // 계좌 정보를 invitationData로 사용
            accountInfo: response.data,
            inviterName: inviterName,
            inviteId: inviteId
          }
        });
      } else {
        throw new Error(response.message || '계좌 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('계좌 정보 조회 오류:', err);
      if (err.message === 'TOKEN_EXPIRED') {
        setError('TOKEN_EXPIRED');
      } else {
        toast.error('계좌 정보를 불러오는데 실패했습니다.');
      }
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
      
      if (response.success) {
        setInvitationData(response.data);
        console.log('✅ 초대 정보 조회 성공:', response.data);
        
        // 초대자 이름 가져오기 (선택사항)
        try {
          const userNameResponse = await authService.getUserName();
          if (userNameResponse.success && userNameResponse.data?.userNm) {
            setInviterName(userNameResponse.data.userNm);
          } else {
            setInviterName('파트너');
          }
        } catch (nameError) {
          console.warn('초대자 이름 조회 실패:', nameError);
          setInviterName('파트너');
        }
        
        // 계좌 정보 조회 후 리다이렉트
        await fetchAccountInfo();
      } else {
        throw new Error(response.message || '초대 정보를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('초대 정보 조회 오류:', err);
      
      // 토큰 만료 에러인지 확인
      if (err.message === 'TOKEN_EXPIRED' || (err.message && err.message.includes('토큰이 만료되었습니다'))) {
        setError('TOKEN_EXPIRED');
      } else {
        setError(err.message || '초대 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 초대 정보 조회 후 리다이렉트
  useEffect(() => {
    fetchInvitationDetail();
  }, [inviteId]);

  // 로딩 상태
  if (isLoading) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">공동적금 가입 준비 중...</h2>
            <p className="text-gray-600">초대 정보를 확인하고 적금 가입 페이지로 이동합니다</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Layout currentPage="savings">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
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

  // 이 컴포넌트는 리다이렉트만 담당하므로 여기까지 도달하면 안됨
  return null;
};

export default JointSavingsSignupPage;
