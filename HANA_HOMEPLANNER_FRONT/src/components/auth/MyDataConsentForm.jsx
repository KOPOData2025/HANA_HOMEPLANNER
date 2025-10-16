import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Shield, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle
} from "lucide-react";
import { useJointLoanInvite } from '@/hooks/useJointLoanInvite';
import { saveCiToLocal, getCiFromLocal, logCiInfo } from '@/utils/ciUtils';

const MyDataConsentForm = ({ 
  initialData, 
  onComplete, 
  onBack 
}) => {
  // SMS 인증 완료 여부 확인 (선택적)
  const hasVerifiedUserInfo = initialData.verifiedUserInfo;
  
  // SMS 인증 훅 사용
  const { isLoading, sendVerificationCode, verifyCode } = useJointLoanInvite();
  
  const [formData, setFormData] = useState({
    name: initialData.userNm || '', // 첫 번째 단계에서 입력한 이름 사용
    phone: '',
    residentNumberFront: '', // 주민번호 앞자리
    residentNumberBack: '',  // 주민번호 뒷자리
    verificationCode: '',
    ...initialData
  });

  const [verificationState, setVerificationState] = useState({
    isCodeSent: false,
    isVerified: false,
    timeLeft: 0,
    isLoading: false
  });

  const [agreements, setAgreements] = useState({
    myDataTerms: false,
    personalInfo: false,
    thirdParty: false,
    marketing: false
  });

  const [errors, setErrors] = useState({});
  const [verifiedUserInfo, setVerifiedUserInfo] = useState(hasVerifiedUserInfo || null);

  // 휴대폰번호 포맷팅
  const formatPhoneNumber = useCallback((value) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else if (name === 'residentNumberFront') {
      // 숫자만 입력 허용 (6자리)
      const numbers = value.replace(/[^\d]/g, "");
      setFormData(prev => ({ ...prev, residentNumberFront: numbers.slice(0, 6) }));
    } else if (name === 'residentNumberBack') {
      // 숫자만 입력 허용 (7자리)
      const numbers = value.replace(/[^\d]/g, "");
      setFormData(prev => ({ ...prev, residentNumberBack: numbers.slice(0, 7) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // 에러 제거
    if (errors[name] || (name.includes('residentNumber') && errors.residentNumber)) {
      setErrors(prev => ({ ...prev, [name]: '', residentNumber: '' }));
    }
  };

  const handleAgreementChange = (key) => {
    setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllAgree = () => {
    const allChecked = Object.values(agreements).every(Boolean);
    const newState = !allChecked;
    setAgreements({
      myDataTerms: newState,
      personalInfo: newState,
      thirdParty: newState,
      marketing: newState
    });
  };

  // 인증번호 발송
  const sendCode = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: '이름을 입력해주세요' });
      return;
    }

    if (!formData.residentNumberFront.trim() || !formData.residentNumberBack.trim()) {
      setErrors({ residentNumber: '주민번호를 입력해주세요' });
      return;
    }

    if (!formData.phone) {
      setErrors({ phone: '휴대폰번호를 입력해주세요' });
      return;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrors({ phone: '올바른 휴대폰번호를 입력해주세요' });
      return;
    }

    setVerificationState(prev => ({ ...prev, isLoading: true }));

    try {
      const fullResidentNumber = `${formData.residentNumberFront}-${formData.residentNumberBack}`;
      const result = await sendVerificationCode(formData.name, fullResidentNumber, formData.phone);
      
      if (result.success) {
        setVerificationState({
          isCodeSent: true,
          isVerified: false,
          timeLeft: 180, // 3분
          isLoading: false
        });

        // 타이머 시작
        const timer = setInterval(() => {
          setVerificationState(prev => {
            if (prev.timeLeft <= 1) {
              clearInterval(timer);
              return { ...prev, timeLeft: 0, isCodeSent: false };
            }
            return { ...prev, timeLeft: prev.timeLeft - 1 };
          });
        }, 1000);

        toast.success('인증번호가 발송되었습니다! 📱', {
          duration: 3000,
        });
      } else {
        throw new Error(result.message || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증번호 발송 오류:', error);
      toast.error(error.message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.');
      setVerificationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setErrors({ verificationCode: '인증번호를 입력해주세요' });
      return;
    }

    setVerificationState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await verifyCode(formData.phone, formData.verificationCode);
      
      if (result.success) {
        setVerificationState(prev => ({
          ...prev,
          isVerified: true,
          isLoading: false,
          timeLeft: 0
        }));
        
        // 인증된 사용자 정보 저장
        setVerifiedUserInfo(result.data);
        
        // CI 값을 로컬스토리지에 임시 저장
        if (result.data.ci) {
          saveCiToLocal(result.data.ci);
          logCiInfo(); // 개발용 로그
        }
        
        toast.success(`${result.data.name}님으로 본인인증이 완료되었습니다! ✅`, {
          duration: 3000,
        });
      } else {
        setErrors({ verificationCode: result.message || '인증번호가 올바르지 않습니다' });
        setVerificationState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('인증번호 확인 오류:', error);
      toast.error(error.message || '인증 확인에 실패했습니다. 다시 시도해주세요.');
      setVerificationState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요';
    }

    if (!formData.residentNumberFront || !formData.residentNumberBack) {
      newErrors.residentNumber = '주민등록번호를 입력해주세요';
    } else if (formData.residentNumberFront.length !== 6 || formData.residentNumberBack.length !== 7) {
      newErrors.residentNumber = '주민등록번호 형식이 올바르지 않습니다';
    }

    // SMS 인증은 선택사항으로 변경 (회원가입 흐름에서 제거됨)
    // if (!verificationState.isVerified && !verifiedUserInfo) {
    //   newErrors.phone = '휴대폰 인증을 완료해주세요';
    // }

    if (!agreements.myDataTerms || !agreements.personalInfo || !agreements.thirdParty) {
      newErrors.agreements = '필수 약관에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const completeData = {
      ...initialData,
      userNm: formData.name, // 이름을 userNm으로 매핑
      phnNum: formData.phone, // 전화번호를 phnNum으로 매핑
      ci: verifiedUserInfo?.ci || getCiFromLocal(), // CI 값 포함
      agreements,
      isPhoneVerified: verificationState.isVerified || !!verifiedUserInfo,
      verifiedUserInfo: verifiedUserInfo // 인증된 사용자 정보 포함
    };

    onComplete(completeData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto max-w-2xl px-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button 
              onClick={onBack}
              className="absolute left-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
            <h1 className="text-3xl font-bold text-gray-800">마이데이터 동의</h1>
          </div>
          <p className="text-gray-600">개인정보 입력 및 본인인증을 완료해주세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">

          <form onSubmit={handleSubmit} className="space-y-6">
              {/* 개인정보 입력 섹션 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">개인정보 입력</h2>

                {/* 이름 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="실명을 입력해주세요"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* 주민번호 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주민등록번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      name="residentNumberFront"
                      value={formData.residentNumberFront}
                      onChange={handleInputChange}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors ${
                        errors.residentNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="앞 6자리"
                      maxLength="6"
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                      type="password"
                      name="residentNumberBack"
                      value={formData.residentNumberBack}
                      onChange={handleInputChange}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors ${
                        errors.residentNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="뒤 7자리"
                      maxLength="7"
                    />
                  </div>
                  {errors.residentNumber && <p className="mt-1 text-sm text-red-600">{errors.residentNumber}</p>}
                </div>

                {/* 휴대폰번호 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    휴대폰번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="010-0000-0000"
                        maxLength="13"
                        disabled={verificationState.isVerified}
                      />
                      {verificationState.isVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={verificationState.isLoading || verificationState.isVerified}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        verificationState.isVerified
                          ? 'bg-green-600 text-white'
                          : verificationState.isLoading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {verificationState.isLoading ? '발송중...' : 
                       verificationState.isVerified ? '인증완료' : 
                       verificationState.isCodeSent ? '재발송' : '인증번호'}
                    </button>
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  
                  {/* 인증 완료 상태 표시 */}
                  {verifiedUserInfo && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-800">
                          <strong>{verifiedUserInfo.name}님</strong>으로 본인인증이 완료되었습니다.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 인증번호 입력 */}
                {verificationState.isCodeSent && !verificationState.isVerified && !verifiedUserInfo && (
                                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      인증번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          name="verificationCode"
                          value={formData.verificationCode}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors ${
                            errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="인증번호 6자리"
                          maxLength="6"
                        />
                        {verificationState.timeLeft > 0 && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-sm text-orange-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(verificationState.timeLeft)}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationState.isLoading}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          verificationState.isLoading
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {verificationState.isLoading ? '확인중...' : '인증확인'}
                      </button>
                    </div>
                    {errors.verificationCode && <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>}
                    
                  </div>
                )}
              </div>

              {/* 마이데이터 약관 동의 섹션 */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">마이데이터 이용약관</h2>

                {/* 전체 동의 */}
                <div className="border p-4 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Object.values(agreements).every(Boolean)}
                      onChange={handleAllAgree}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-800">
                      전체 동의
                    </span>
                  </label>
                </div>

                {/* 개별 약관 */}
                <div className="space-y-3">
                  <label className="flex items-start cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreements.myDataTerms}
                      onChange={() => handleAgreementChange('myDataTerms')}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          [필수] 마이데이터 서비스 이용약관
                        </span>
                        <button 
                          type="button"
                          onClick={() => window.open('/pdfs/마이데이터이용약관.pdf', '_blank')}
                          className="text-teal-600 hover:text-teal-700 text-sm underline"
                        >
                          전문보기
                        </button>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreements.personalInfo}
                      onChange={() => handleAgreementChange('personalInfo')}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          [필수] 개인정보 처리방침
                        </span>
                        <span className="text-teal-600 hover:text-teal-700 text-sm underline cursor-pointer">
                          전문보기
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreements.thirdParty}
                      onChange={() => handleAgreementChange('thirdParty')}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          [필수] 제3자 정보제공 동의
                        </span>
                        <span className="text-teal-600 hover:text-teal-700 text-sm underline cursor-pointer">
                          전문보기
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreements.marketing}
                      onChange={() => handleAgreementChange('marketing')}
                      className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-gray-800">
                        [선택] 마케팅 정보 수신 동의
                      </span>
                    </div>
                  </label>
                </div>

                {errors.agreements && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.agreements}</p>
                  </div>
                )}
              </div>

              {/* 제출 버튼 */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isLoading ? '처리 중...' : '마이데이터 연동 시작하기'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default MyDataConsentForm;
