import React from 'react'
import { Eye, EyeOff, Lock, Mail, MapPin, Search } from "lucide-react"

const SignupForm = ({ 
  formData, 
  errors, 
  isLoading, 
  showPassword, 
  showPasswordConfirm,
  inviteToken,
  onInputChange, 
  onSubmit, 
  onAddressSearch,
  onTogglePassword,
  onTogglePasswordConfirm,
  onBack
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 초대 토큰 hidden field */}
      {inviteToken && (
        <input
          type="hidden"
          name="inviteToken"
          value={inviteToken}
        />
      )}
      
      {/* 초대 알림 */}
      {inviteToken && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-pink-800">
                <strong>커플 초대</strong>를 통한 회원가입입니다. 가입 완료 후 자동으로 연결됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
      
      
      {/* 이름 입력 */}
      <div>
        <label htmlFor="userNm" className="block text-sm font-medium text-gray-700 mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="userNm"
            name="userNm"
            value={formData.userNm}
            onChange={onInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans ${
              errors.userNm ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        {errors.userNm && <p className="mt-1 text-sm text-red-600">{errors.userNm}</p>}
      </div>

      {/* 이메일 입력 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          이메일 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>



      {/* 비밀번호 입력 */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={onInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="비밀번호를 입력하세요 (8자 이상)"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 확인 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPasswordConfirm ? "text" : "password"}
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={onInputChange}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans ${
              errors.passwordConfirm ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          <button
            type="button"
            onClick={onTogglePasswordConfirm}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.passwordConfirm && <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>}
      </div>

      {/* 주소 입력 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          주소 <span className="text-red-500">*</span>
        </label>
        
        {/* 우편번호 + 주소 검색 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="zipcode"
              value={formData.zipcode}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans"
              placeholder="우편번호"
              readOnly
            />
          </div>
          <button
            type="button"
            onClick={onAddressSearch}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            주소검색
          </button>
        </div>

        {/* 기본 주소 */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="address"
            value={formData.address}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="주소 검색 버튼을 클릭해주세요"
            readOnly
          />
        </div>
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}

        {/* 상세 주소 */}
        <input
          type="text"
          id="detailAddress"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans"
          placeholder="상세주소를 입력하세요 (선택사항)"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-700'
          } text-white`}
        >
          {isLoading ? "처리 중..." : "다음"}
        </button>
      </div>
    </form>
  )
}

export default SignupForm
