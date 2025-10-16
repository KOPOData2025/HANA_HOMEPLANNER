import { useState, useCallback, useEffect } from 'react';
import { storageService } from '@/services/storageService';

/**
 * PDF 뷰어 훅
 */
export const usePdfViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * PDF 조회 및 모달 열기
   * @param {string} houseManageNo - 주택 관리 번호
   */
  const openPdfViewer = useCallback(async (houseManageNo) => {
    if (!houseManageNo) {
      setError('주택 관리 번호가 필요합니다.');
      return;
    }

    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('PDF를 보려면 로그인이 필요합니다.');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsModalOpen(true);

    try {
      console.log('📄 PDF 뷰어 열기:', { houseManageNo });
      
      const result = await storageService.getPdfUrl(houseManageNo);
      
      if (result.success && result.data) {
        const url = URL.createObjectURL(result.data);
        setPdfUrl(url);
        console.log('✅ PDF 뷰어 준비 완료:', { houseManageNo, url });
      } else {
        setError(result.message || 'PDF를 불러올 수 없습니다.');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('❌ PDF 뷰어 오류:', err);
      
      // 401 Unauthorized 에러 처리
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      } else {
        setError(err.message || 'PDF 조회 중 오류가 발생했습니다.');
      }
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * PDF 뷰어 모달 닫기
   */
  const closePdfViewer = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
    
    // PDF URL 해제 (메모리 누수 방지)
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  /**
   * 컴포넌트 언마운트 시 PDF URL 해제
   */
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return {
    isLoading,
    error,
    pdfUrl,
    isModalOpen,
    openPdfViewer,
    closePdfViewer
  };
};

export default usePdfViewer;
