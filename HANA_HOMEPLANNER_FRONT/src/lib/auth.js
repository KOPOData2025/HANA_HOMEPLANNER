// JWT 토큰 관리 유틸리티 함수들

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// 인증 상태 변경 이벤트 트리거
const triggerAuthChange = () => {
  window.dispatchEvent(new CustomEvent('authStateChanged'))
}

// 토큰 저장
export const setAuthTokens = (tokenData) => {
  localStorage.setItem("accessToken", tokenData.accessToken)
  localStorage.setItem("refreshToken", tokenData.refreshToken)
  localStorage.setItem("tokenType", tokenData.tokenType)
  localStorage.setItem("expiresIn", tokenData.expiresIn.toString())
  localStorage.setItem("user", JSON.stringify(tokenData.user))
  localStorage.setItem("tokenTimestamp", Date.now().toString())
  
  // 인증 상태 변경 이벤트 트리거
  triggerAuthChange()
}

// 토큰 가져오기
export const getAccessToken = () => {
  return localStorage.getItem("accessToken")
}

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken")
}

export const getTokenType = () => {
  return localStorage.getItem("tokenType") || "Bearer"
}

// 사용자 정보 가져오기
export const getUser = () => {
  const userStr = localStorage.getItem("user")
  if (!userStr || userStr === "undefined" || userStr === "null") {
    return null
  }
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error("사용자 정보 파싱 오류:", error)
    return null
  }
}

// 로그인 상태 확인
export const isLoggedIn = () => {
  const token = getAccessToken()
  const user = getUser()
  return !!(token && user)
}

// 로그아웃 (토큰 및 사용자 정보 삭제)
export const logout = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("tokenType")
  localStorage.removeItem("expiresIn")
  localStorage.removeItem("user")
  localStorage.removeItem("tokenTimestamp")
  
  // 인증 상태 변경 이벤트 트리거
  triggerAuthChange()
  
  // 로그인 페이지로 리다이렉트
  redirectToLogin()
}

// 잘못된 localStorage 값 정리
export const cleanupInvalidStorage = () => {
  const keys = ["accessToken", "refreshToken", "tokenType", "user", "expiresIn", "tokenTimestamp"]
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value === "undefined" || value === "null") {
      localStorage.removeItem(key)
    }
  })
}

// 인증 헤더 생성 (API 호출 시 사용)
export const getAuthHeaders = () => {
  const token = getAccessToken()
  const tokenType = getTokenType()
  
  console.log('🔐 getAuthHeaders 호출됨:', { token: token ? '존재' : '없음', tokenType })
  
  if (!token) {
    console.warn('⚠️ Access Token이 없습니다. 로그인이 필요합니다.')
    return {}
  }
  
  const authHeader = {
    "Authorization": `${tokenType} ${token}`
  }
  
  console.log('🔐 Authorization 헤더 생성됨:', authHeader)
  return authHeader
}

// 토큰 만료 확인 (선택사항 - JWT 디코딩 없이 간단 체크)
export const isTokenExpired = () => {
  const expiresIn = localStorage.getItem("expiresIn")
  if (!expiresIn) return true
  
  // 실제로는 JWT 토큰을 디코딩해서 만료 시간을 확인해야 하지만
  // 간단하게 localStorage에 저장된 시간으로 체크
  const tokenTime = localStorage.getItem("tokenTimestamp")
  if (!tokenTime) return true
  
  const now = Date.now()
  const tokenAge = now - parseInt(tokenTime)
  const expirationTime = parseInt(expiresIn) * 1000 // 초를 밀리초로 변환
  
  return tokenAge >= expirationTime
}

// 인증이 필요한 API 호출 헬퍼
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAccessToken()
  
  console.log('🔍 authenticatedFetch 시작:', { 
    hasToken: !!token, 
    tokenPreview: token ? token.substring(0, 20) + '...' : '없음',
    url 
  })
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    console.warn('⚠️ Access Token이 없습니다. 로그인이 필요합니다.')
    // redirectToLogin() // 임시로 주석 처리
    throw new Error('로그인이 필요합니다.')
  }
  
  const authHeaders = getAuthHeaders()
  console.log('🔍 authHeaders 결과:', authHeaders)
  
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...authHeaders,
    ...(options.headers || {})
  }
  
  const finalOptions = {
    ...options,
    headers: mergedHeaders
  }
  
  console.log('🌐 최종 헤더:', { 
    url, 
    headers: finalOptions.headers,
    hasAuthorization: !!finalOptions.headers.Authorization,
    authorizationValue: finalOptions.headers.Authorization
  })
  
  console.log('🚀 실제 fetch 호출:', { url, options: finalOptions })
  
  return fetch(url, finalOptions)
}

// 토큰 만료 알림 표시
export const showTokenExpiredNotification = () => {
  // 커스텀 이벤트를 발생시켜 앱 전체에서 토큰 만료 알림을 표시
  window.dispatchEvent(new CustomEvent('tokenExpired', {
    detail: {
      message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      type: 'warning'
    }
  }))
}

// 로그인 페이지로 리다이렉트
export const redirectToLogin = () => {
  // 토큰 만료 알림 표시
  showTokenExpiredNotification()
  
  // 현재 경로를 저장하여 로그인 후 복귀할 수 있도록 함
  const currentPath = window.location.pathname + window.location.search
  if (currentPath !== '/login' && currentPath !== '/mypage') {
    sessionStorage.setItem('returnUrl', currentPath)
  }
  
  // 로그인 페이지로 이동
  window.location.href = '/login'
}

// Refresh Token으로 Access Token 갱신
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    console.warn('Refresh token이 없습니다. 로그인 페이지로 이동합니다.')
    redirectToLogin()
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    })

    const data = await response.json()
    
    // Refresh Token이 만료된 경우
    if (!response.ok && data.data?.code === 'TOKEN_EXPIRED') {
      console.warn('Refresh Token이 만료되었습니다. 로그인 페이지로 이동합니다.')
      logout()
      redirectToLogin()
      return null
    }

    if (!response.ok) {
      throw new Error(data.message || '토큰 갱신에 실패했습니다.')
    }
    
    if (data.success && data.data) {
      // 새로운 토큰 정보 저장
      setAuthTokens(data.data)
      return data.data.accessToken
    } else {
      throw new Error(data.message || '토큰 갱신에 실패했습니다.')
    }
  } catch (error) {
    console.error('토큰 갱신 오류:', error)
    
    // 네트워크 오류나 기타 오류의 경우에도 로그아웃 후 로그인 페이지로 이동
    logout()
    redirectToLogin()
    return null
  }
}

// 토큰 만료 응답 감지 및 자동 갱신
export const handleTokenExpiration = async (response) => {
  if (response.status === 401) {
    try {
      const responseData = await response.json()
      if (responseData.data?.code === 'TOKEN_EXPIRED') {
        // 토큰 갱신 시도
        const newToken = await refreshAccessToken()
        return newToken !== null // 갱신 성공 여부
      }
    } catch (error) {
      console.error('토큰 만료 응답 파싱 오류:', error)
    }
  }
  return false // 갱신 실패 또는 토큰 만료가 아님
}

// 인증이 필요한 API 호출 헬퍼 (자동 토큰 갱신 포함)
export const authenticatedFetchWithRefresh = async (url, options = {}) => {
  let response = await authenticatedFetch(url, options)
  
  // 토큰 만료 시 자동 갱신 시도
  if (response.status === 401) {
    const refreshed = await handleTokenExpiration(response)
    if (refreshed) {
      // 토큰 갱신 후 재시도
      response = await authenticatedFetch(url, options)
    }
  }
  
  return response
}