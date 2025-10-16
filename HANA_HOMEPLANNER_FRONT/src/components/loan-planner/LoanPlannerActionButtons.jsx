/**
 * 대출 플래너 다음 액션 버튼 컴포넌트
 * 사전한도 조회, 상환 스케줄 캘린더 등록, PDF 보고서 다운로드
 */

import { 
  Search, 
  Calendar, 
  Download, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock
} from "lucide-react";

export const LoanPlannerActionButtons = ({ 
  result, 
  adjustedResult,
  onPreApproval,
  onCalendarExport,
  onPDFDownload 
}) => {
  if (!result) return null;

  const currentResult = adjustedResult || result;

  // 사전한도 조회 가능 여부 확인
  const canPreApproval = () => {
    if (!currentResult) return false;
    
    // DSR 초과 시 비활성화
    if (currentResult.dsrStatus === '초과') return false;
    
    // LTV 초과 시 비활성화
    if (currentResult.ltvStatus === '초과') return false;
    
    // 기본 조건 충족
    return currentResult.maxAllowedLoanAmount > 0;
  };

  // 캘린더 등록 가능 여부 확인
  const canCalendarExport = () => {
    return currentResult && currentResult.totalMonthlyPayment > 0;
  };

  // PDF 다운로드 가능 여부 확인
  const canPDFDownload = () => {
    return currentResult && currentResult.maxAllowedLoanAmount > 0;
  };

  const getButtonStatus = (isEnabled, isWarning = false) => {
    if (!isEnabled) {
      return {
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        icon: <Clock className="w-4 h-4" />,
        disabled: true
      };
    }
    
    if (isWarning) {
      return {
        className: 'bg-orange-600 hover:bg-orange-700 text-white',
        icon: <AlertTriangle className="w-4 h-4" />,
        disabled: false
      };
    }
    
    return {
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: <CheckCircle className="w-4 h-4" />,
      disabled: false
    };
  };

  const preApprovalStatus = getButtonStatus(canPreApproval());
  const calendarStatus = getButtonStatus(canCalendarExport());
  const pdfStatus = getButtonStatus(canPDFDownload());

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">다음 단계</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 사전한도 조회 */}
        <button
          onClick={onPreApproval}
          disabled={preApprovalStatus.disabled}
          className={`flex flex-col items-center p-4 border rounded-lg transition-all ${
            preApprovalStatus.disabled 
              ? preApprovalStatus.className 
              : `${preApprovalStatus.className} hover:shadow-md`
          }`}
        >
          <div className="mb-2">
            {preApprovalStatus.icon}
          </div>
          <h4 className="font-medium mb-1">사전한도 조회</h4>
          <p className="text-xs text-center opacity-75">
            {preApprovalStatus.disabled 
              ? '조건 미충족으로 이용 불가'
              : '실제 대출 한도 확인'
            }
          </p>
          {currentResult.dsrStatus === '초과' && (
            <p className="text-xs text-red-600 mt-1">
              DSR 초과로 이용 불가
            </p>
          )}
          {currentResult.ltvStatus === '초과' && (
            <p className="text-xs text-red-600 mt-1">
              LTV 초과로 이용 불가
            </p>
          )}
        </button>

        {/* 상환 스케줄 캘린더 등록 */}
        <button
          onClick={onCalendarExport}
          disabled={calendarStatus.disabled}
          className={`flex flex-col items-center p-4 border rounded-lg transition-all ${
            calendarStatus.disabled 
              ? calendarStatus.className 
              : `${calendarStatus.className} hover:shadow-md`
          }`}
        >
          <div className="mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="font-medium mb-1">캘린더 등록</h4>
          <p className="text-xs text-center opacity-75">
            {calendarStatus.disabled 
              ? '상환액 정보 없음'
              : 'Google Calendar/iCal 연동'
            }
          </p>
        </button>

        {/* PDF 보고서 다운로드 */}
        <button
          onClick={onPDFDownload}
          disabled={pdfStatus.disabled}
          className={`flex flex-col items-center p-4 border rounded-lg transition-all ${
            pdfStatus.disabled 
              ? pdfStatus.className 
              : `${pdfStatus.className} hover:shadow-md`
          }`}
        >
          <div className="mb-2">
            <Download className="w-4 h-4" />
          </div>
          <h4 className="font-medium mb-1">PDF 보고서</h4>
          <p className="text-xs text-center opacity-75">
            {pdfStatus.disabled 
              ? '계산 결과 없음'
              : '상세 분석 보고서 다운로드'
            }
          </p>
        </button>
      </div>

      {/* 추가 정보 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FileText className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">안내사항</p>
            <ul className="text-xs space-y-1">
              <li>• 사전한도 조회는 실제 대출 승인과 다를 수 있습니다</li>
              <li>• 캘린더 등록 시 상환일 알림을 받을 수 있습니다</li>
              <li>• PDF 보고서에는 상세한 분석 결과가 포함됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
