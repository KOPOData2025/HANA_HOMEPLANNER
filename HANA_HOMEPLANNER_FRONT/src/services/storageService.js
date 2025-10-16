import { apiClient } from '@/lib/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * PDF 파일 조회 서비스
 */
export const storageService = {
  /**
   * PDF 파일 URL 조회
   * @param {string} houseManageNo - 주택 관리 번호
   * @returns {Promise<{success: boolean, data: Blob|null, message: string}>}
   */
  async getPdfUrl(houseManageNo) {
    try {
      console.log('📄 PDF 조회 요청 시작:', { houseManageNo });
      
      const response = await apiClient.get(`${API_BASE_URL}/api/storage/pdf/url/${houseManageNo}`, {
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/pdf'
        },
        responseType: 'blob' // PDF 파일을 Blob으로 받기 위해
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF 조회 실패: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const pdfBlob = await response.blob();
      console.log('✅ PDF 조회 성공:', { 
        size: pdfBlob.size, 
        type: pdfBlob.type,
        houseManageNo 
      });
      
      return {
        success: true,
        data: pdfBlob,
        message: 'PDF 조회 성공'
      };
    } catch (error) {
      console.error('❌ PDF 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'PDF 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * PDF Blob을 URL로 변환
   * @param {Blob} pdfBlob - PDF Blob 객체
   * @returns {string} - PDF URL
   */
  createPdfUrl(pdfBlob) {
    if (!pdfBlob) return null;
    return URL.createObjectURL(pdfBlob);
  },

  /**
   * PDF URL 해제 (메모리 누수 방지)
   * @param {string} pdfUrl - PDF URL
   */
  revokePdfUrl(pdfUrl) {
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
  }
};

export default storageService;
