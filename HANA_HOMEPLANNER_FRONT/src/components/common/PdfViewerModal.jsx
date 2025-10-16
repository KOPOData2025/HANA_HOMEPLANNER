import React from 'react';
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';

/**
 * PDF 뷰어 모달 컴포넌트
 */
const PdfViewerModal = ({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  isLoading, 
  error, 
  houseManageNo 
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${houseManageNo}_document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-end pr-[580px] pt-24 pb-8">
      <div className="bg-white rounded-lg shadow-xl max-w-[45vw] w-full h-[93vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">모집 공고</h3>
              <p className="text-sm text-gray-500">
                {houseManageNo ? `주택번호: ${houseManageNo}` : '모집 공고서'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {pdfUrl && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="모집 공고 다운로드"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 p-4 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">모집 공고를 불러오는 중...</p>
                <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">모집 공고를 불러올 수 없습니다</h4>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex space-x-3">
                  {error.includes('로그인') && (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      로그인하기
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="모집 공고서"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">모집 공고서가 없습니다</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
