/**
 * SMS 인증 폼 컴포넌트
 * 회원가입 전 본인인증을 위한 SMS 인증 처리
 */

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const SmsVerificationForm = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    residentNumberFront: '',
    residentNumberBack: '',
    phone: '',
    verificationCode: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerificationCompleted, setIsVerificationCompleted] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [verifiedUserInfo, setVerifiedUserInfo] = useState(null);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '휴대폰번호를 입력해주세요.';
    } else {
      const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phonePattern.test(formData.phone)) {
        newErrors.phone = '올바른 휴대폰번호 형식을 입력해주세요. (예: 010-1234-5678)';
      }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerification = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const fullResidentNumber = `${formData.residentNumberFront}-${formData.residentNumberBack}`;
      
      const response = await apiClient.post(`${API_BASE_URL}/api/auth/sms/verification`, {
        name: formData.name,
        residentNumber: fullResidentNumber,
        phoneNumber: formData.phone
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsVerificationSent(true);
          setVerificationTimer(180); // 3분
          toast.success(data.message || '인증번호가 발송되었습니다.');
        } else {
          toast.error(data.message || '인증번호 발송에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('SMS 발송 오류:', error);
      toast.error('인증번호 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      setErrors({ verificationCode: '인증번호를 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post(`${API_BASE_URL}/api/auth/sms/verification/confirm`, {
        phoneNumber: formData.phone,
        verificationCode: formData.verificationCode
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsVerificationCompleted(true);
          setVerifiedUserInfo(data.data);
          toast.success(data.message || '인증이 완료되었습니다!');
          
          // 에러 제거
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.verificationCode;
            return newErrors;
          });
        } else {
          setErrors({ verificationCode: data.message || '인증번호가 올바르지 않습니다.' });
          toast.error(data.message || '인증번호가 올바르지 않습니다.');
        }
      } else {
        const errorData = await response.json();
        setErrors({ verificationCode: errorData.message || '인증번호가 올바르지 않습니다.' });
        toast.error(errorData.message || '인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('인증번호 확인 오류:', error);
      toast.error('인증번호 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!isVerificationCompleted) {
      toast.error('SMS 인증을 완료해주세요.');
      return;
    }

    // 인증 완료 데이터를 부모 컴포넌트로 전달
    onComplete({
      ...verifiedUserInfo,
      originalFormData: formData
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Layout currentPage="signup" backgroundColor="bg-gray-50">
      <section className="py-16">
        <div className="container mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">본인인증</h1>
            <p className="text-gray-600">회원가입을 위해 본인인증을 진행해주세요</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              {/* 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="실명을 입력하세요"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* 휴대폰번호 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰번호 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="010-1234-5678"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* 주민등록번호 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주민등록번호 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.residentNumberFront}
                      onChange={(e) => handleInputChange('residentNumberFront', e.target.value)}
                      placeholder="901201"
                      maxLength="6"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.residentNumberFront ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.residentNumberFront && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.residentNumberFront}
                      </p>
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.residentNumberBack ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.residentNumberBack && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.residentNumberBack}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 인증번호 발송 버튼 */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isLoading || isVerificationSent}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '발송 중...' : isVerificationSent ? '인증번호 발송됨' : '인증번호 발송'}
                </button>
              </div>

              {/* 인증번호 입력 */}
              {isVerificationSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증번호 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.verificationCode}
                      onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                      placeholder="6자리 인증번호"
                      maxLength="6"
                      disabled={isVerificationCompleted}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                        className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isLoading ? '확인 중...' : '인증확인'}
                      </button>
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        인증완료
                      </div>
                    )}
                  </div>
                  
                  {/* 타이머 표시 */}
                  {verificationTimer > 0 && !isVerificationCompleted && (
                    <p className="mt-1 text-sm text-gray-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      남은 시간: {formatTime(verificationTimer)}
                    </p>
                  )}
                  
                  {/* 인증 완료 메시지 */}
                  {isVerificationCompleted && verifiedUserInfo && (
                    <p className="mt-1 text-sm text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {verifiedUserInfo.name}님으로 인증이 완료되었습니다
                    </p>
                  )}
                  
                  {errors.verificationCode && !isVerificationCompleted && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.verificationCode}
                    </p>
                  )}
                </div>
              )}

              {/* 다음 단계 버튼 */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isVerificationCompleted}
                  className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isVerificationCompleted ? '다음 단계' : 'SMS 인증을 완료해주세요'}
                  {isVerificationCompleted && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SmsVerificationForm;
