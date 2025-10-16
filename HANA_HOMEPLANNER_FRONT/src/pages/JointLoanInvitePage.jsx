/**
 * 공동 대출 초대 페이지
 * 초대 링크를 통해 접속한 사용자의 인증을 처리하는 페이지
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { 
  User, 
  Phone, 
  Calendar,
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJointLoanInvite } from '@/hooks/useJointLoanInvite';

const JointLoanInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = searchParams.get('inviteId');

  const {
    isLoading,
    error,
    getInviteInfo,
    sendVerificationCode,
    verifyCode,
    acceptInvite,
    acceptInviteWithCi,
    clearError
  } = useJointLoanInvite();

  const [step, setStep] = useState(1); // 1: 초대 확인, 2: 사용자 인증, 3: 완료
  const [inviteInfo, setInviteInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    residentNumberFront: '',
    residentNumberBack: '',
    verificationCode: '',
    agreementCheck: false
  });

  const [errors, setErrors] = useState({});
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationCompleted, setIsVerificationCompleted] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [verifiedUserInfo, setVerifiedUserInfo] = useState(null);

  // 초대 정보 조회
  useEffect(() => {
    if (inviteId) {
      loadInviteInfo();
    } else {
      toast.error('잘못된 초대 링크입니다.');
      navigate('/');
    }
  }, [inviteId]);

  // 인증번호 타이머
  useEffect(() => {
    let interval = null;
    if (verificationTimer > 0) {
      interval = setInterval(() => {
        setVerificationTimer(timer => timer - 1);
      }, 1000);
    } else if (verificationTimer === 0 && isVerificationSent) {
      setIsVerificationSent(false);
    }
    return () => clearInterval(interval);
  }, [verificationTimer, isVerificationSent]);

  const loadInviteInfo = async () => {
    try {
      console.log('[Page] 초대 정보 로드 시작:', inviteId);
      
      if (!inviteId) {
        console.error('[Page] inviteId가 없습니다');
        toast.error('잘못된 초대 링크입니다.');
        navigate('/');
        return;
      }
      
      console.log('[Page] getInviteInfo 호출');
      const response = await getInviteInfo(inviteId);
      console.log('[Page] getInviteInfo 응답:', response);
      
      if (response) {
        console.log('[Page] 초대 정보 로드 성공:', response);
        setInviteInfo(response);
        
        // 초대받은 사용자의 이름과 전화번호를 폼에 미리 채워넣기
        if (response.jointName && response.jointPhone) {
          console.log('[Page] 폼 데이터 자동 채우기:', {
            name: response.jointName,
            phone: response.jointPhone
          });
          setFormData(prev => ({
            ...prev,
            name: response.jointName,
            phone: response.jointPhone
          }));
        }
      } else {
        console.error('[Page] 초대 정보 로드 실패: response is null/undefined');
        toast.error('초대 정보를 불러오는데 실패했습니다.');
        navigate('/');
      }
    } catch (error) {
      console.error('[Page] 초대 정보 로드 오류:', error);
      toast.error('초대 정보를 불러오는데 실패했습니다.');
      navigate('/');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.residentNumberFront.trim()) {
      newErrors.residentNumberFront = '주민번호 앞자리를 입력해주세요.';
    } else {
      const frontPattern = /^\d{6}$/;
      if (!frontPattern.test(formData.residentNumberFront)) {
        newErrors.residentNumberFront = '주민번호 앞자리 6자리를 입력해주세요.';
      }
    }

    if (!formData.residentNumberBack.trim()) {
      newErrors.residentNumberBack = '주민번호 뒤자리를 입력해주세요.';
    } else {
      const backPattern = /^\d{7}$/;
      if (!backPattern.test(formData.residentNumberBack)) {
        newErrors.residentNumberBack = '주민번호 뒤자리 7자리를 입력해주세요.';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '휴대폰번호를 입력해주세요.';
    } else {
      const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phonePattern.test(formData.phone)) {
        newErrors.phone = '올바른 휴대폰번호 형식을 입력해주세요. (예: 010-1234-5678)';
      }
    }

    if (isVerificationSent && !isVerificationCompleted) {
      if (!formData.verificationCode.trim()) {
        newErrors.verificationCode = '인증번호를 입력해주세요.';
      } else if (!isVerificationCompleted) {
        newErrors.verificationCode = '인증번호 확인을 완료해주세요.';
      }
    }

    if (!formData.agreementCheck) {
      newErrors.agreementCheck = '개인정보 처리방침에 동의해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerification = async () => {
    // 필수 입력값 검증
    const tempErrors = {};
    
    if (!formData.name.trim()) {
      tempErrors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.residentNumberFront.trim()) {
      tempErrors.residentNumberFront = '주민번호 앞자리를 입력해주세요.';
    } else {
      const frontPattern = /^\d{6}$/;
      if (!frontPattern.test(formData.residentNumberFront)) {
        tempErrors.residentNumberFront = '주민번호 앞자리 6자리를 입력해주세요.';
      }
    }
    
    if (!formData.residentNumberBack.trim()) {
      tempErrors.residentNumberBack = '주민번호 뒤자리를 입력해주세요.';
    } else {
      const backPattern = /^\d{7}$/;
      if (!backPattern.test(formData.residentNumberBack)) {
        tempErrors.residentNumberBack = '주민번호 뒤자리 7자리를 입력해주세요.';
      }
    }
    
    if (!formData.phone.trim()) {
      tempErrors.phone = '휴대폰번호를 입력해주세요.';
    } else {
      const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phonePattern.test(formData.phone)) {
        tempErrors.phone = '올바른 휴대폰번호 형식을 입력해주세요.';
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      // 주민번호 합치기
      const fullResidentNumber = `${formData.residentNumberFront}-${formData.residentNumberBack}`;
      const result = await sendVerificationCode(formData.name, fullResidentNumber, formData.phone);
      if (result.success) {
        setIsVerificationSent(true);
        setVerificationTimer(180); // 3분
        toast.success(result.message);
        console.log('SMS 인증 발송 성공:', result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      setErrors({ verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    try {
      console.log('[Page] 인증번호 확인 시작');
      const verifyResult = await verifyCode(formData.phone, formData.verificationCode);
      console.log('[Page] 인증번호 확인 결과:', verifyResult);
      
      if (verifyResult.success) {
        console.log('[Page] 인증 완료:', verifyResult.data);
        setIsVerificationCompleted(true);
        setVerifiedUserInfo(verifyResult.data);
        toast.success(verifyResult.message || '인증이 완료되었습니다!');
        
        // 인증번호 입력 필드 에러 제거
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.verificationCode;
          return newErrors;
        });
      } else {
        console.log('[Page] 인증 실패:', verifyResult.message);
        setErrors({ verificationCode: verifyResult.message || '인증번호가 올바르지 않습니다.' });
        toast.error(verifyResult.message || '인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('[Page] 인증번호 확인 오류:', error);
      toast.error('인증번호 확인에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // 인증번호가 발송되었지만 인증이 완료되지 않은 경우
    if (isVerificationSent && !isVerificationCompleted) {
      toast.error('휴대폰 인증을 완료해주세요.');
      return;
    }

    try {
      console.log('[Page] 초대 수락 시작');
      
      // 인증된 사용자의 CI 값 확인
      if (!verifiedUserInfo || !verifiedUserInfo.ci) {
        toast.error('인증된 사용자 정보가 없습니다. 다시 인증해주세요.');
        return;
      }

      console.log('[Page] CI 값으로 초대 수락:', {
        inviteId,
        jointCi: verifiedUserInfo.ci
      });

      // CI 값을 사용한 초대 수락
      const result = await acceptInviteWithCi(inviteId, verifiedUserInfo.ci);
      if (result.success) {
        toast.success(result.message || '공동 대출 초대가 수락되었습니다!');
        setStep(3);
      } else {
        toast.error(result.message || '초대 수락에 실패했습니다.');
      }
    } catch (error) {
      console.error('[Page] 초대 수락 오류:', error);
      toast.error('초대 수락에 실패했습니다.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading && !inviteInfo) {
    return (
      <Layout currentPage="joint-loan-invite" backgroundColor="bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">초대 정보를 확인하는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="joint-loan-invite" backgroundColor="bg-gray-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        {step === 1 && (
          <div className="w-full max-w-6xl">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
                {/* 좌측 패널 - 초대 수락 정보 */}
                <div className="bg-white p-8 flex flex-col justify-center">
                  <div className="flex justify-center mb-8">
                    <img 
                      src="/public/icon/loan_invite.png" 
                      alt="대출 초대 아이콘" 
                      className="w-24 h-24"
                    />
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                    공동대출 초대장
                  </h1>
                  
                  {inviteInfo && (
                    <>
                      <p className="text-red-500 text-center mb-6">
                        {inviteInfo.inviterName}님이 공동대출에 함께 참여하도록 초대했습니다!
                      </p>
                      
                      <div className="bg-gray-100 rounded-lg p-4 mb-6">
                        <p className="text-gray-900 text-center">
                          함께 내 집 마련 목표를 달성해보아요!
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setStep(2)}
                        className="w-full bg-[#009071] hover:bg-[#007a5f] text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center mb-4"
                      >
                        함께 시작하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                      
                      <p className="text-sm text-gray-600 text-center mb-2">
                      </p>
                      
                      <p className="text-sm text-gray-600 text-center">
                        계정이 있으신가요? <span className="text-blue-600 cursor-pointer hover:underline">로그인하기</span>
                      </p>
                    </>
                  )}
                </div>
                
                {/* 우측 패널 - 대출 정보 */}
                <div className="bg-green-50 p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    함께하는 공동대출
                  </h2>
                  
                  <p className="text-gray-700 mb-8">
                    파트너와 함께 목표를 달성해보세요
                  </p>
                  
                  {/* 3D 일러스트레이션 영역 */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      {/* 간단한 3D 효과를 위한 박스 */}
                      <div className="w-32 h-24 bg-blue-100 rounded-lg shadow-lg transform rotate-3 relative">
                        <div className="absolute inset-2 bg-white rounded border-2 border-blue-200">
                          <div className="h-full flex flex-col justify-center space-y-1 px-2">
                            <div className="h-1 bg-gray-300 rounded"></div>
                            <div className="h-1 bg-gray-300 rounded"></div>
                            <div className="h-1 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {inviteInfo && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">상품명</span>
                          <span className="font-semibold text-gray-900">{inviteInfo.productName}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">대출 금액</span>
                          <span className="font-semibold text-gray-900">
                            {(inviteInfo.requestAmount / 10000).toLocaleString()}만원
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">대출 기간</span>
                          <span className="font-semibold text-gray-900">{inviteInfo.requestTerm}개월</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-6">
                    공동대출로 더 스마트한 자산 관리와 목표 달성을 경험하세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">본인 인증</h2>
                <p className="text-gray-600">안전한 공동대출 신청을 위해 본인 인증이 필요합니다</p>
              </div>
                
              <div className="space-y-6">
                {/* 1행: 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="홍길동"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* 2행: 주민등록번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주민등록번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.residentNumberFront}
                        onChange={(e) => handleInputChange('residentNumberFront', e.target.value)}
                        placeholder="901201"
                        maxLength="6"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                          errors.residentNumberFront ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.residentNumberFront && (
                        <p className="mt-1 text-sm text-red-600">{errors.residentNumberFront}</p>
                      )}
                    </div>
                    <div className="flex items-center px-2">
                      <span className="text-gray-400">-</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="password"
                        value={formData.residentNumberBack}
                        onChange={(e) => handleInputChange('residentNumberBack', e.target.value)}
                        placeholder="1234567"
                        maxLength="7"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                          errors.residentNumberBack ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.residentNumberBack && (
                        <p className="mt-1 text-sm text-red-600">{errors.residentNumberBack}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3행: 휴대폰번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-1234-5678"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* 4행: 인증번호 입력 (인증번호 발송 후에만 표시) */}
                {isVerificationSent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      인증번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.verificationCode}
                        onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                        placeholder="6자리 인증번호"
                        maxLength="6"
                        disabled={isVerificationCompleted}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009071] focus:border-[#009071] transition-colors ${
                          isVerificationCompleted 
                            ? 'bg-gray-100 border-gray-300' 
                            : errors.verificationCode 
                              ? 'border-red-500' 
                              : 'border-gray-300'
                        }`}
                      />
                      {!isVerificationCompleted ? (
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={isLoading || !formData.verificationCode.trim()}
                          className="px-6 py-3 bg-[#009071] text-white font-semibold rounded-lg hover:bg-[#007a5f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? '확인 중...' : '인증확인'}
                        </button>
                      ) : (
                        <div className="flex items-center px-6 py-3 bg-[#009071]/10 text-[#009071] font-semibold rounded-lg">
                          인증완료
                        </div>
                      )}
                    </div>
                    
                    {/* 타이머 및 상태 메시지 */}
                    {verificationTimer > 0 && !isVerificationCompleted && (
                      <p className="mt-2 text-sm text-orange-600">
                        남은 시간: {formatTime(verificationTimer)}
                      </p>
                    )}
                    
                    {isVerificationCompleted && verifiedUserInfo && (
                      <p className="mt-2 text-sm text-[#009071]">
                        {verifiedUserInfo.name}님으로 인증이 완료되었습니다
                      </p>
                    )}
                    
                    {errors.verificationCode && !isVerificationCompleted && (
                      <p className="mt-2 text-sm text-red-600">{errors.verificationCode}</p>
                    )}
                  </div>
                )}

                {/* 5행: 인증번호 발송 버튼 */}
                <div>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isLoading || isVerificationSent}
                    className="w-full px-6 py-3 bg-[#009071] text-white font-semibold rounded-lg hover:bg-[#007a5f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '발송 중...' : isVerificationSent ? '인증번호 발송됨' : '인증번호 발송'}
                  </button>
                </div>

                {/* 개인정보 동의 */}
                <div className="border-t pt-6">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreementCheck}
                      onChange={(e) => handleInputChange('agreementCheck', e.target.checked)}
                      className="w-5 h-5 text-[#009071] border-gray-300 rounded focus:ring-[#009071] mt-1"
                    />
                    <div className="ml-3">
                      <p className="text-gray-700 font-medium">
                        <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다.
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        공동 대출 신청을 위해 마이데이터에서 대출 조회를 위한 데이터가 수집 및 이용됩니다.
                      </p>
                    </div>
                  </label>
                  {errors.agreementCheck && (
                    <p className="mt-2 text-sm text-red-600">{errors.agreementCheck}</p>
                  )}
                </div>

                {/* 하단 버튼 */}
                <div className="flex justify-between mt-8 gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || (isVerificationSent && !isVerificationCompleted)}
                    className="px-8 py-4 bg-[#009071] text-white rounded-xl hover:bg-[#007a5f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-semibold shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        처리중...
                      </div>
                    ) : (isVerificationSent && !isVerificationCompleted) ? (
                      'SMS 인증을 완료해주세요'
                    ) : (
                      <div className="flex items-center">
                        대출 신청하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  신청이 완료되었습니다!
                </h2>
                
                <p className="text-gray-600 mb-8">
                  공동 대출 초대가 성공적으로 수락되었습니다.<br />
                  대출 심사가 진행되며, 결과는 등록하신 연락처로 안내드립니다.
                </p>
                
                
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    홈으로 이동
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JointLoanInvitePage;