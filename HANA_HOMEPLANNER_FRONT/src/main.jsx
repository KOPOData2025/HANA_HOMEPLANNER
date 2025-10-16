import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './globals.css'

// 프로덕션 환경에서 콘솔 로그 제거
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
}

// 폰트 로딩 상태 확인 (개발 환경에서만)
if (import.meta.env.DEV) {
  document.fonts.ready.then(() => {
    console.log('폰트 로딩 완료:', document.fonts);
    console.log('Pretendard 폰트 상태:', document.fonts.check('16px Pretendard'));
    console.log('Noto Sans KR 폰트 상태:', document.fonts.check('16px Noto Sans KR'));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
) 