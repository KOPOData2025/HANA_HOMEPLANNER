/**
 * 공동 대출 신청 섹션 컴포넌트
 * 배우자와 공동으로 대출 신청할 때 사용되는 컴포넌트
 */

import React from 'react';
import { User, AlertCircle } from 'lucide-react';

const JointLoanSection = ({ 
  formData, 
  handleInputChange, 
  errors 
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <User className="w-5 h-5 text-green-600 mr-2" />
        공동 대출 신청
      </h3>
      
      {/* 공동 대출 토글 */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <h4 className="text-sm font-medium text-blue-900">배우자와 공동으로 신청하시겠습니까?</h4>
            <p className="text-xs text-blue-700 mt-1">공동 신청 시 더 유리한 조건으로 대출이 가능할 수 있습니다.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isJoint === 'Y'}
              onChange={(e) => handleInputChange('isJoint', e.target.checked ? 'Y' : 'N')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* 배우자 정보 입력 (공동 신청 시에만 표시) */}
      {formData.isJoint === 'Y' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-4 h-4 text-green-600 mr-2" />
              배우자 정보
            </h4>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배우자 성명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.jointName}
              onChange={(e) => handleInputChange('jointName', e.target.value)}
              placeholder="배우자 이름을 입력하세요"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jointName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jointName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.jointName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배우자 휴대폰 번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.jointPhone}
              onChange={(e) => handleInputChange('jointPhone', e.target.value)}
              placeholder="010-1234-5678"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.jointPhone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jointPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.jointPhone}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">공동 신청 안내</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>배우자와 공동으로 신청하면 합산 소득으로 심사가 진행됩니다</li>
                    <li>두 분 모두 신용정보 조회에 동의하신 것으로 간주됩니다</li>
                    <li>대출 승인 후 두 분 모두 연대보증 책임을 지게 됩니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JointLoanSection;
