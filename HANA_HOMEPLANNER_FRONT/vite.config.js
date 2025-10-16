// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), "VITE_");


  // 환경 변수 검증
  const requiredVars = ['VITE_KAKAO_MAP_KEY', 'VITE_KAKAO_JS_KEY'];
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (mode === 'production' && missingVars.length > 0) {
    console.error('❌ 필수 환경 변수가 설정되지 않았습니다:', missingVars);
    console.error('💡 .env.production 파일을 생성하고 다음 변수들을 설정하세요:');
    missingVars.forEach(varName => {
      console.error(`   ${varName}=your_${varName.toLowerCase()}_here`);
    });
    // 프로덕션 빌드 시 환경 변수가 없으면 경고만 표시 (빌드 중단하지 않음)
  }
  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        process.env.NODE_ENV === "production"
          ? "http://34.64.169.208:8080"
          : "http://localhost:8080"
      ),
      "import.meta.env.VITE_KAKAO_MAP_KEY": JSON.stringify(
        env.VITE_KAKAO_MAP_KEY
      ),
      "import.meta.env.VITE_KAKAO_JS_KEY": JSON.stringify(
        env.VITE_KAKAO_JS_KEY
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      fs: {
        allow: [".."],
      },
      cors: {
        origin: true,
        credentials: true,
      },
      headers: {
        "Cross-Origin-Embedder-Policy": "unsafe-none",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    },
    publicDir: "public",
  };
});
