import React from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export const LoginForm = ({
  formData,
  showPassword,
  isLoading,
  error,
  onInputChange,
  onSubmit,
  onTogglePassword,
  onForgotId,
  onForgotPassword,
  onSignup
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData?.email || ""}
              onChange={onInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData?.password || ""}
              onChange={onInputChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-sans"
              placeholder="비밀번호를 입력하세요"
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          onClick={(e) => {
            console.log('🔥 로그인 버튼 클릭됨!');
            console.log('🔥 이벤트:', e);
            console.log('🔥 onSubmit 함수:', onSubmit);
          }}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-teal-600 hover:bg-teal-700"
          } text-white`}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>

        {/* Links */}
        <div className="flex justify-between text-sm">
          <button 
            type="button" 
            className="text-gray-600 hover:text-teal-600"
            onClick={onForgotId}
          >
            아이디 찾기
          </button>
          <button 
            type="button" 
            className="text-gray-600 hover:text-teal-600"
            onClick={onForgotPassword}
          >
            비밀번호 찾기
          </button>
          <button 
            type="button" 
            onClick={onSignup}
            className="text-gray-600 hover:text-teal-600"
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
};
