/**
 * 대출 신청 4단계: 대출 신청서 작성 컴포넌트
 * 상세한 신청 정보 입력
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Home, DollarSign, FileText, AlertCircle, Plus, X, Upload } from 'lucide-react';
import AutoDebitAccountSelector from '../../savings/AutoDebitAccountSelector';
import JointLoanSection from '../JointLoanSection';

const LoanApplicationFormStep = ({ 
  productDetail, 
  applicationData, 
  onNext, 
  onBack, 
  accounts,
  isLoadingAccounts,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    // 대출 기본 정보
    loanAmount: applicationData.loanAmount || '',
    loanPeriod: applicationData.loanPeriod || '',
    purpose: applicationData.purpose || '',
    disburseAccountNumber: applicationData.disburseAccountNumber || '',
    repaymentType: applicationData.repaymentType || 'EQUAL_PRINCIPAL_INTEREST',
    
    // 신청인 인적사항
    name: applicationData.name || '',
    phone: applicationData.phone || '',
    email: applicationData.email || '',
    birthDate: applicationData.birthDate || '',
    address: applicationData.address || '',
    gender: applicationData.gender || '',
    
    // 주택 정보
    propertyType: applicationData.propertyType || '',
    propertyAddress: applicationData.propertyAddress || '',
    propertyValue: applicationData.propertyValue || '',
    propertySize: applicationData.propertySize || '',
    exclusiveArea: applicationData.exclusiveArea || '',
    contractAmount: applicationData.contractAmount || '',
    downPayment: applicationData.downPayment || '',
    remainingAmount: applicationData.remainingAmount || '',
    
    // 소득 및 재직 정보
    incomeType: applicationData.incomeType || 'SALARIED',
    monthlyIncome: applicationData.monthlyIncome || '',
    companyName: applicationData.companyName || '',
    jobTitle: applicationData.jobTitle || '',
    workPeriod: applicationData.workPeriod || '',
    
    // 기존 대출 내역
    existingLoans: applicationData.existingLoans || [],
    
    // 상담 정보
    consultationInfo: {
      housingRelated: applicationData.consultationInfo?.housingRelated || '',
      fundingRelated: applicationData.consultationInfo?.fundingRelated || '',
      loanConditions: applicationData.consultationInfo?.loanConditions || '',
      householdInfo: applicationData.consultationInfo?.householdInfo || '',
      preferentialConditions: applicationData.consultationInfo?.preferentialConditions || ''
    },
    
    // 제출 서류
    documents: {
      idCard: applicationData.documents?.idCard || false,
      incomeCertificate: applicationData.documents?.incomeCertificate || false,
      propertyCertificate: applicationData.documents?.propertyCertificate || false,
      bankStatement: applicationData.documents?.bankStatement || false
    },
    
    // 공동 대출 관련
    isJoint: applicationData.isJoint || 'N',
    jointName: applicationData.jointName || '',
    jointPhone: applicationData.jointPhone || ''
  });

  const [errors, setErrors] = useState({});
  const [newLoan, setNewLoan] = useState({ bank: '', amount: '', remainingAmount: '' });

  // 상품 정보에서 기본값 설정
  useEffect(() => {
    if (productDetail && !formData.loanPeriod) {
      // 상품의 기본 기간 설정 (예: 20년, 30년 등)
      const defaultPeriod = productDetail.defaultPeriod || 20;
      setFormData(prev => ({
        ...prev,
        loanPeriod: defaultPeriod.toString()
      }));
    }
  }, [productDetail, formData.loanPeriod]);

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

  const handleNestedInputChange = (parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const formatCurrency = (value) => {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const addExistingLoan = () => {
    if (newLoan.bank && newLoan.amount) {
      setFormData(prev => ({
        ...prev,
        existingLoans: [...prev.existingLoans, { ...newLoan, id: Date.now() }]
      }));
      setNewLoan({ bank: '', amount: '', remainingAmount: '' });
    }
  };

  const removeExistingLoan = (id) => {
    setFormData(prev => ({
      ...prev,
      existingLoans: prev.existingLoans.filter(loan => loan.id !== id)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // 대출 신청 API에 필요한 최소 필수 정보만 검증
    if (!formData.loanAmount || !formData.loanAmount.trim()) {
      newErrors.loanAmount = '대출 금액을 입력해주세요.';
    }

    if (!formData.loanPeriod || !formData.loanPeriod.trim()) {
      newErrors.loanPeriod = '대출 기간을 선택해주세요.';
    }

    if (!formData.disburseAccountNumber) {
      newErrors.disburseAccountNumber = '입금 계좌를 선택해주세요.';
    }

    // 공동 대출인 경우 배우자 정보 검증
    if (formData.isJoint === 'Y') {
      if (!formData.jointName || !formData.jointName.trim()) {
        newErrors.jointName = '배우자 성명을 입력해주세요.';
      }
      
      if (!formData.jointPhone || !formData.jointPhone.trim()) {
        newErrors.jointPhone = '배우자 휴대폰번호를 입력해주세요.';
      } else {
        // 핸드폰번호 형식 검증
        const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
        if (!phonePattern.test(formData.jointPhone)) {
          newErrors.jointPhone = '올바른 휴대폰번호 형식을 입력해주세요. (예: 010-1234-5678)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // 대출 신청 API에 필요한 기본값 설정
      const submitData = {
        ...formData,
        // 기본값 설정 (테스트용)
        name: formData.name || '홍길동',
        phone: formData.phone || '010-1234-5678',
        email: formData.email || 'test@example.com',
        birthDate: formData.birthDate || '19900101',
        address: formData.address || '서울시 강남구',
        propertyType: formData.propertyType || 'APARTMENT',
        propertyAddress: formData.propertyAddress || '서울시 강남구 테헤란로 123',
        propertyValue: formData.propertyValue || '500000000',
        exclusiveArea: formData.exclusiveArea || '84.5',
        monthlyIncome: formData.monthlyIncome || '5000000',
        purpose: formData.purpose || 'HOUSING'
      };
      
      onSubmit(submitData);
    }
  };

  const calculateMonthlyPayment = () => {
    const loanAmount = parseInt(formData.loanAmount.replace(/[^\d]/g, '') || '0');
    const loanPeriod = parseInt(formData.loanPeriod || '0');
    const interestRate = productDetail?.interestRate || 0.035; // 기본 3.5%
    
    if (loanAmount > 0 && loanPeriod > 0) {
      const monthlyRate = interestRate / 12;
      const totalMonths = loanPeriod * 12;
      
      if (formData.repaymentType === 'EQUAL_PRINCIPAL_INTEREST') {
        // 원리금균등
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                              (Math.pow(1 + monthlyRate, totalMonths) - 1);
        return Math.round(monthlyPayment);
      } else {
        // 원금균등
        const principalPayment = loanAmount / totalMonths;
        const interestPayment = loanAmount * monthlyRate;
        return Math.round(principalPayment + interestPayment);
      }
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">대출 신청서 작성</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* 대출 기본 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            대출 기본 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출 희망 금액 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', formatCurrency(e.target.value))}
                  placeholder="예: 300,000,000"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">원</span>
              </div>
              {errors.loanAmount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.loanAmount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출 기간 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.loanPeriod}
                onChange={(e) => handleInputChange('loanPeriod', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.loanPeriod ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">대출 기간을 선택하세요</option>
                <option value="10">10년</option>
                <option value="15">15년</option>
                <option value="20">20년</option>
                <option value="25">25년</option>
                <option value="30">30년</option>
                <option value="35">35년</option>
              </select>
              {errors.loanPeriod && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.loanPeriod}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출 목적
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.purpose ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">대출 목적을 선택하세요</option>
                <option value="HOUSING">주택 구매</option>
                <option value="REFINANCING">전세자금</option>
                <option value="RENOVATION">주택 리모델링</option>
                <option value="BUSINESS">사업자금</option>
                <option value="OTHER">기타</option>
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.purpose}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상환 방식
              </label>
              <select
                value={formData.repaymentType}
                onChange={(e) => handleInputChange('repaymentType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="EQUAL_PRINCIPAL_INTEREST">원리금균등</option>
                <option value="EQUAL_PRINCIPAL">원금균등</option>
              </select>
            </div>
          </div>

          {/* 입금 계좌 선택 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입금 계좌 <span className="text-red-500">*</span>
            </label>
            <AutoDebitAccountSelector
              accounts={accounts}
              isLoading={isLoadingAccounts}
              selectedAccountNum={formData.disburseAccountNumber}
              onAccountSelect={(accountNum) => handleInputChange('disburseAccountNumber', accountNum)}
              error={errors.disburseAccountNumber}
            />
          </div>

          {/* 예상 월 상환액 */}
          {(formData.loanAmount && formData.loanPeriod) && (
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">예상 월 상환액</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {calculateMonthlyPayment().toLocaleString()}원
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {formData.repaymentType === 'EQUAL_PRINCIPAL_INTEREST' ? '원리금균등' : '원금균등'} 방식 기준
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 공동 대출 신청 */}
        <JointLoanSection 
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* 기존 신청인 인적사항 섹션 제거됨 */}
        <div style={{display: 'none'}}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성명
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="홍길동"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                휴대폰 번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="010-1234-5678"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일
              </label>
              <input
                type="text"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                placeholder="19900101"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.birthDate}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="서울시 강남구 테헤란로 123"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 주택 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 text-purple-600 mr-2" />
            주택 정보
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부동산 유형
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.propertyType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">부동산 유형을 선택하세요</option>
                <option value="APARTMENT">아파트</option>
                <option value="VILLA">빌라</option>
                <option value="HOUSE">단독주택</option>
                <option value="OFFICETEL">오피스텔</option>
                <option value="COMMERCIAL">상업용</option>
              </select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.propertyType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부동산 가격
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.propertyValue}
                  onChange={(e) => handleInputChange('propertyValue', formatCurrency(e.target.value))}
                  placeholder="예: 500,000,000"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.propertyValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">원</span>
              </div>
              {errors.propertyValue && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.propertyValue}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전용 면적
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.exclusiveArea}
                  onChange={(e) => handleInputChange('exclusiveArea', e.target.value)}
                  placeholder="예: 84.5"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.exclusiveArea ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">㎡</span>
              </div>
              {errors.exclusiveArea && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.exclusiveArea}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부동산 주소
              </label>
              <input
                type="text"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                placeholder="서울시 강남구 테헤란로 123 아파트 101동 1001호"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.propertyAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.propertyAddress && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.propertyAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 소득 및 재직 정보 - 제거됨 */}
        <div className="mb-8" style={{display: 'none'}}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">소득 및 재직 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소득 유형
              </label>
              <select
                value={formData.incomeType}
                onChange={(e) => handleInputChange('incomeType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SALARIED">근로소득자</option>
                <option value="BUSINESS">사업소득자</option>
                <option value="OTHER">기타 소득</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월 소득
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', formatCurrency(e.target.value))}
                  placeholder="예: 5,000,000"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.monthlyIncome ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-3 text-gray-500">원</span>
              </div>
              {errors.monthlyIncome && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.monthlyIncome}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사명
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="예: 하나은행"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직책
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="예: 대리"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 기존 대출 내역 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기존 대출 내역</h3>
          
          <div className="space-y-4">
            {formData.existingLoans.map((loan) => (
              <div key={loan.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{loan.bank}</p>
                  <p className="text-sm text-gray-600">
                    대출금액: {loan.amount}원, 잔액: {loan.remainingAmount}원
                  </p>
                </div>
                <button
                  onClick={() => removeExistingLoan(loan.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newLoan.bank}
                  onChange={(e) => setNewLoan(prev => ({ ...prev, bank: e.target.value }))}
                  placeholder="은행명"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan(prev => ({ ...prev, amount: formatCurrency(e.target.value) }))}
                  placeholder="대출금액"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newLoan.remainingAmount}
                  onChange={(e) => setNewLoan(prev => ({ ...prev, remainingAmount: formatCurrency(e.target.value) }))}
                  placeholder="잔액"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={addExistingLoan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 제출 서류 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-orange-600 mr-2" />
            제출 서류
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.documents.idCard}
                onChange={(e) => handleNestedInputChange('documents', 'idCard', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">신분증 사본</p>
                <p className="text-sm text-gray-600">주민등록증 또는 운전면허증</p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.documents.incomeCertificate}
                onChange={(e) => handleNestedInputChange('documents', 'incomeCertificate', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">소득증명서</p>
                <p className="text-sm text-gray-600">근로소득원천징수영수증 등</p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.documents.propertyCertificate}
                onChange={(e) => handleNestedInputChange('documents', 'propertyCertificate', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">부동산 등기부등본</p>
                <p className="text-sm text-gray-600">담보 부동산 관련 서류</p>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.documents.bankStatement}
                onChange={(e) => handleNestedInputChange('documents', 'bankStatement', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">통장사본</p>
                <p className="text-sm text-gray-600">입금 계좌 통장 사본</p>
              </div>
            </label>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">신청 전 확인사항</h4>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>입력하신 정보는 신청 후 변경이 어려우니 신중히 입력해주세요</li>
                  <li>제출 서류는 신청 후 별도로 제출하시면 됩니다</li>
                  <li>대출 승인은 신청자의 신용상황에 따라 달라질 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                신청 처리 중...
              </div>
            ) : (
              '대출 신청하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationFormStep;
