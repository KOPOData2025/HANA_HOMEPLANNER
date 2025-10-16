import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 대출 신청 서비스
 * 사용자의 대출 신청 정보를 조회하고 관리하는 기능을 제공합니다.
 */
export const loanApplicationService = {
  /**
   * 사용자의 대출 신청 목록 조회
   * @returns {Promise<Object>} 대출 신청 목록 응답
   */
  async getMyLoanApplications() {
    try {
      console.log('🏦 내 대출 신청 목록 조회 요청 시작');
      
      const response = await apiClient.get(`${API_BASE_URL}/api/users/my-loan-applications`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '대출 신청 목록 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 내 대출 신청 목록 조회 성공:', data);
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '대출 신청 목록 조회 성공'
      };
    } catch (error) {
      console.error('❌ 내 대출 신청 목록 조회 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '대출 신청 목록 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 대출 신청 상태별 필터링
   * @param {Array} applications - 대출 신청 목록
   * @param {string} status - 신청 상태 (PENDING, APPROVED, REJECTED 등)
   * @returns {Array} 필터링된 대출 신청 목록
   */
  filterApplicationsByStatus(applications, status) {
    return applications.filter(application => application.status === status);
  },

  /**
   * 대출 신청 통계 계산
   * @param {Array} applications - 대출 신청 목록
   * @returns {Object} 대출 신청 통계
   */
  calculateApplicationStats(applications) {
    const stats = {
      total: applications.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalRequestAmount: 0,
      approvedAmount: 0,
      pendingAmount: 0,
      rejectedAmount: 0
    };

    applications.forEach(application => {
      const amount = application.requestAmount || 0;
      stats.totalRequestAmount += amount;

      switch (application.status) {
        case 'PENDING':
          stats.pending++;
          stats.pendingAmount += amount;
          break;
        case 'APPROVED':
          stats.approved++;
          stats.approvedAmount += amount;
          break;
        case 'REJECTED':
          stats.rejected++;
          stats.rejectedAmount += amount;
          break;
      }
    });

    return stats;
  },

  /**
   * 대출 신청 정보 포맷팅
   * @param {Object} application - 대출 신청 정보
   * @returns {Object} 포맷팅된 대출 신청 정보
   */
  formatApplicationInfo(application) {
    return {
      ...application,
      formattedRequestAmount: this.formatCurrency(application.requestAmount),
      formattedRequestTerm: this.formatTerm(application.requestTerm),
      formattedSubmittedAt: this.formatDate(application.submittedAt),
      formattedReviewedAt: this.formatDate(application.reviewedAt)
    };
  },

  /**
   * 통화 포맷팅
   * @param {number} amount - 금액
   * @returns {string} 포맷팅된 금액
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * 대출 기간 포맷팅
   * @param {number} term - 대출 기간 (일 단위)
   * @returns {string} 포맷팅된 대출 기간
   */
  formatTerm(term) {
    if (!term) return '';
    
    const years = Math.floor(term / 365);
    const months = Math.floor((term % 365) / 30);
    
    if (years > 0 && months > 0) {
      return `${years}년 ${months}개월`;
    } else if (years > 0) {
      return `${years}년`;
    } else if (months > 0) {
      return `${months}개월`;
    } else {
      return `${term}일`;
    }
  },

  /**
   * 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷팅된 날짜
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  },

  /**
   * 대출 신청 상태별 색상 반환
   * @param {string} status - 대출 신청 상태
   * @returns {string} 색상 클래스명
   */
  getStatusBadgeColor(status) {
    const colorMap = {
      'PENDING': 'bg-orange-100 text-orange-800 border-orange-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'CANCELLED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  /**
   * 대출 신청 상태별 아이콘 반환
   * @param {string} status - 대출 신청 상태
   * @returns {string} 아이콘 클래스명
   */
  getStatusIcon(status) {
    const iconMap = {
      'PENDING': 'Clock',
      'APPROVED': 'CheckCircle',
      'REJECTED': 'XCircle',
      'CANCELLED': 'Ban'
    };
    
    return iconMap[status] || 'Clock';
  },

  /**
   * 대출 신청 생성
   * @param {Object} applicationData - 대출 신청 데이터
   * @returns {Promise<Object>} 대출 신청 생성 응답
   */
  async createLoanApplication(applicationData) {
    try {
      console.log('🏦 대출 신청 생성 요청 시작:', applicationData);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/loans/applications`, applicationData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '대출 신청 생성에 실패했습니다.');
      }

      const data = await response.json();
      console.log('✅ 대출 신청 생성 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '대출 신청 생성 성공'
      };
    } catch (error) {
      console.error('❌ 대출 신청 생성 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '대출 신청 생성 중 오류가 발생했습니다.'
      };
    }
  },

/**
 * 대출 신청 데이터 유효성 검사
 * @param {Object} data - 검사할 데이터
   * @returns {Object} 유효성 검사 결과
   */
  validateLoanApplicationData(data) {
    const errors = [];
    
    if (!data.productId) {
      errors.push('상품 ID는 필수입니다.');
    }
    
    if (!data.requestAmount || data.requestAmount <= 0) {
      errors.push('신청 금액은 0보다 커야 합니다.');
    }
    
    if (!data.requestTerm || data.requestTerm <= 0) {
      errors.push('대출 기간은 0보다 커야 합니다.');
    }
    
    if (!data.disburseAccountNumber || data.disburseAccountNumber.trim() === '') {
      errors.push('지급 계좌번호는 필수입니다.');
    }

    // disburseDate 검증
    if (!data.disburseDate || data.disburseDate.trim() === '') {
      errors.push('상환날짜는 필수입니다.');
    } else {
      // 날짜 형식 검증 (YYYY-MM-DD)
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(data.disburseDate)) {
        errors.push('상환날짜는 YYYY-MM-DD 형식이어야 합니다.');
      } else {
        // 유효한 날짜인지 확인
        const date = new Date(data.disburseDate);
        if (isNaN(date.getTime())) {
          errors.push('유효하지 않은 상환날짜입니다.');
        }
      }
    }

    // isJoint 필드 검증 (Y 또는 N만 허용)
    if (data.isJoint && data.isJoint !== 'Y' && data.isJoint !== 'N') {
      errors.push('공동 차주 여부는 Y 또는 N만 허용됩니다.');
    }

    // 공동 대출인 경우 배우자 정보 필수 검증
    if (data.isJoint === 'Y') {
      if (!data.jointName || data.jointName.trim() === '') {
        errors.push('공동 차주 이름은 필수입니다.');
      }
      
      if (!data.jointPhone || data.jointPhone.trim() === '') {
        errors.push('공동 차주 핸드폰번호는 필수입니다.');
      } else {
        // 핸드폰번호 형식 검증 (기본적인 패턴)
        const phonePattern = /^01[0-9]-\d{3,4}-\d{4}$/;
        if (!phonePattern.test(data.jointPhone)) {
          errors.push('공동 차주 핸드폰번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// 유틸리티 함수들 export
export const loanApplicationUtils = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },
  
  formatTerm: (term) => {
    if (!term) return '';
    
    const years = Math.floor(term / 365);
    const months = Math.floor((term % 365) / 30);
    
    if (years > 0 && months > 0) {
      return `${years}년 ${months}개월`;
    } else if (years > 0) {
      return `${years}년`;
    } else if (months > 0) {
      return `${months}개월`;
    } else {
      return `${term}일`;
    }
  },

  /**
   * 금액 문자열을 숫자로 변환
   * @param {string|number} amount - 금액 (문자열 또는 숫자)
   * @returns {number} 변환된 금액 (원 단위)
   */
  parseAmount: (amount) => {
    if (!amount) return 0;
    
    // 이미 숫자인 경우
    if (typeof amount === 'number') {
      return amount;
    }
    
    const amountStr = String(amount);
    
    // 억/천 패턴 처리
    const billionMatch = amountStr.match(/(\d+(?:\.\d+)?)\s*억/);
    const thousandMatch = amountStr.match(/(\d+(?:\.\d+)?)\s*천/);
    
    const billion = billionMatch ? parseFloat(billionMatch[1]) : 0;
    const thousand = thousandMatch ? parseFloat(thousandMatch[1]) : 0;
    
    let wonFromKorean = 0;
    if (billion > 0 || thousand > 0) {
      // 1억 = 100,000,000원, 1천 = 10,000,000원
      wonFromKorean = Math.round(billion * 100_000_000 + thousand * 10_000_000);
    }
    
    // 숫자만 있는 경우 (콤마/원/만원 등 제거)
    const digits = amountStr.replace(/[^\d]/g, '');
    const wonFromDigits = digits ? parseInt(digits, 10) : 0;
    
    // 두 방식 중 더 그럴싸한 값을 채택
    if (billion > 0 || thousand > 0) return wonFromKorean;
    return wonFromDigits;
  },

  /**
   * 년을 개월로 변환
   * @param {number} years - 년 수
   * @returns {number} 개월 수
   */
  convertYearsToMonths: (years) => {
    if (years === null || years === undefined || years === '') return 0;
    
    const numYears = Number(years);
    if (isNaN(numYears) || numYears <= 0) return 0;
    
    return Math.round(numYears * 12);
  }
};

export default loanApplicationService;