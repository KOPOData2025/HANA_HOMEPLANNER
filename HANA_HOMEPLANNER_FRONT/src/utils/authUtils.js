// 로그인 API 호출 함수
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password })
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || "로그인에 실패했습니다.");
  }

  return responseData;
};

// 폼 유효성 검사 함수
export const validateLoginForm = (email, password) => {
  if (!email || !password) {
    return {
      isValid: false,
      error: "이메일과 비밀번호를 모두 입력해주세요."
    };
  }

  if (!email.includes('@')) {
    return {
      isValid: false,
      error: "올바른 이메일 형식을 입력해주세요."
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: "비밀번호는 최소 6자 이상이어야 합니다."
    };
  }

  return {
    isValid: true,
    error: ""
  };
};

// 에러 메시지 포맷팅 함수
export const formatErrorMessage = (error) => {
  if (error.message) {
    return error.message;
  }
  
  if (error.status === 401) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  
  if (error.status === 500) {
    return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  
  return "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
};
