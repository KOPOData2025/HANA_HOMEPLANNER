import React, { useState } from 'react'
import { User, Phone, MapPin, Heart, DollarSign } from "lucide-react"

const PersonalInfoInput = ({ 
  formData, 
  onInputChange 
}) => {
  const [isCoupleLoan, setIsCoupleLoan] = useState(false);
  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">개인정보 입력</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            이름
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            연락처
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="010-0000-0000"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          주소
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="주소를 입력하세요"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
        />
      </div>

      {/* 부부 공동 대출 조회하기 체크박스 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            id="coupleLoan"
            checked={isCoupleLoan}
            onChange={(e) => {
              setIsCoupleLoan(e.target.checked);
              onInputChange('isCoupleLoan', e.target.checked);
            }}
            className="w-5 h-5 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
          />
          <label htmlFor="coupleLoan" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
            <Heart className="w-4 h-4 mr-2 text-pink-500" />
            부부 공동 대출 조회하기
          </label>
        </div>
        
        {/* 배우자 연소득 입력 화면 */}
        {isCoupleLoan && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">배우자 정보</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  배우자 이름
                </label>
                <input
                  type="text"
                  value={formData.spouseName || ''}
                  onChange={(e) => onInputChange('spouseName', e.target.value)}
                  placeholder="배우자 이름을 입력하세요"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  배우자 연소득
                </label>
                <input
                  type="number"
                  value={formData.spouseIncome || ''}
                  onChange={(e) => onInputChange('spouseIncome', e.target.value)}
                  placeholder="연소득을 입력하세요 (만원 단위)"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-pink-100 rounded-lg">
              <p className="text-sm text-pink-700">
                💡 부부 공동 대출 시 DTI, DSR, LTV 계산에 배우자의 소득이 함께 반영됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalInfoInput
