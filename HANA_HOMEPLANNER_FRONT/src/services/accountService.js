import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 계좌 서비스
 * 사용자의 계좌 정보를 조회하고 관리하는 기능을 제공합니다.
 */
export const accountService = {
  /**
   * 사용자의 모든 계좌 조회
   * @returns {Promise<Object>} 계좌 목록 응답
   */
  async getMyAccounts() {
    try {
      console.log('🏦 내 계좌 조회 요청 시작');
      
      const response = await apiClient.get(`${API_BASE_URL}/api/users/my-accounts`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '계좌 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 내 계좌 조회 성공:', data);
      
      return {
        success: true,
        data: data.data || [],
        message: data.message || '계좌 조회 성공'
      };
    } catch (error) {
      console.error('❌ 내 계좌 조회 오류:', error);
      return {
        success: false,
        data: [],
        message: error.message || '계좌 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 계좌 상세 정보 조회
   * @param {string} accountId - 계좌 ID
   * @returns {Promise<Object>} 계좌 상세 정보 응답
   */
  async getAccountDetail(accountId) {
    try {
      console.log('🏦 계좌 상세 정보 조회 요청 시작:', accountId);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/users/account-detail/${accountId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '계좌 상세 정보 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 계좌 상세 정보 조회 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '계좌 상세 정보 조회 성공'
      };
    } catch (error) {
      console.error('❌ 계좌 상세 정보 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '계좌 상세 정보 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 대출 계좌 상세 정보 조회 (상환 일정 및 거래 내역 포함)
   * @param {string} accountId - 대출 계좌 ID
   * @returns {Promise<Object>} 대출 계좌 상세 정보 응답
   */
  async getLoanAccountDetail(accountId) {
    try {
      console.log('🏦 대출 계좌 상세 정보 조회 요청 시작:', accountId);
      
      const response = await apiClient.get(`${API_BASE_URL}/api/users/loan-account-detail/${accountId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '대출 계좌 상세 정보 조회에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 대출 계좌 상세 정보 조회 성공:', data);
      
      return {
        success: true,
        data: data.data,
        message: data.message || '대출 계좌 상세 정보 조회 성공'
      };
    } catch (error) {
      console.error('❌ 대출 계좌 상세 정보 조회 오류:', error);
      return {
        success: false,
        data: null,
        message: error.message || '대출 계좌 상세 정보 조회 중 오류가 발생했습니다.'
      };
    }
  },

  /**
   * 계좌 타입별 필터링
   * @param {Array} accounts - 계좌 목록
   * @param {string} accountType - 계좌 타입 (DEMAND, SAVING, LOAN 등)
   * @returns {Array} 필터링된 계좌 목록
   */
  filterAccountsByType(accounts, accountType) {
    return accounts.filter(account => account.accountType === accountType);
  },

  /**
   * 계좌 잔액 합계 계산
   * @param {Array} accounts - 계좌 목록
   * @returns {Object} 계좌 타입별 잔액 합계
   */
  calculateAccountBalances(accounts) {
    const balances = {
      total: 0,
      demand: 0,    // 입출금
      saving: 0,    // 적금
      loan: 0,      // 대출
      other: 0      // 기타
    };

    accounts.forEach(account => {
      const balance = account.balance || 0;
      balances.total += balance;
      
      switch (account.accountType) {
        case 'DEMAND':
          balances.demand += balance;
          break;
        case 'SAVING':
          balances.saving += balance;
          break;
        case 'LOAN':
          balances.loan += balance;
          break;
        default:
          balances.other += balance;
          break;
      }
    });

    return balances;
  },

  /**
   * 계좌 상태별 분류
   * @param {Array} accounts - 계좌 목록
   * @returns {Object} 상태별 계좌 분류
   */
  categorizeAccountsByStatus(accounts) {
    return {
      active: accounts.filter(account => account.status === 'ACTIVE'),
      inactive: accounts.filter(account => account.status === 'INACTIVE'),
      suspended: accounts.filter(account => account.status === 'SUSPENDED')
    };
  },

  /**
   * 계좌 정보 포맷팅
   * @param {Object} account - 계좌 정보
   * @returns {Object} 포맷팅된 계좌 정보
   */
  formatAccountInfo(account) {
    return {
      ...account,
      formattedBalance: this.formatCurrency(account.balance),
      formattedAccountNum: this.formatAccountNumber(account.accountNum),
      formattedCreatedAt: this.formatDate(account.createdAt),
      formattedUpdatedAt: this.formatDate(account.updatedAt)
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
   * 계좌번호 포맷팅
   * @param {string} accountNum - 계좌번호
   * @returns {string} 포맷팅된 계좌번호
   */
  formatAccountNumber(accountNum) {
    if (!accountNum) return '';
    
    // 계좌번호가 13자리인 경우 (예: 0018170903960)
    if (accountNum.length === 13) {
      return `${accountNum.slice(0, 3)}-${accountNum.slice(3, 6)}-${accountNum.slice(6, 9)}-${accountNum.slice(9)}`;
    }
    
    // 이미 하이픈이 포함된 경우 (예: 110-123-111211)
    if (accountNum.includes('-')) {
      return accountNum;
    }
    
    // 기타 경우는 그대로 반환
    return accountNum;
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
        day: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return dateString;
    }
  },

  /**
   * 계좌 타입별 아이콘 반환
   * @param {string} accountType - 계좌 타입
   * @returns {string} 아이콘 클래스명
   */
  getAccountTypeIcon(accountType) {
    const iconMap = {
      'DEMAND': 'CreditCard',
      'SAVING': 'PiggyBank', 
      'LOAN': 'TrendingDown',
      'JOINT_LOAN': 'TrendingDown',
      'INVESTMENT': 'TrendingUp',
      'OTHER': 'Wallet'
    };
    
    return iconMap[accountType] || 'Wallet';
  },

  /**
   * 계좌 타입별 색상 반환
   * @param {string} accountType - 계좌 타입
   * @returns {string} 색상 클래스명
   */
  getAccountTypeColor(accountType) {
    const colorMap = {
      'DEMAND': 'text-blue-600 bg-blue-100',
      'SAVING': 'text-green-600 bg-green-100',
      'LOAN': 'text-red-600 bg-red-100',
      'JOINT_LOAN': 'text-orange-600 bg-orange-100', // 공동 대출은 구분되는 색상 사용
      'INVESTMENT': 'text-purple-600 bg-purple-100',
      'OTHER': 'text-gray-600 bg-gray-100'
    };
    
    return colorMap[accountType] || 'text-gray-600 bg-gray-100';
  }
};

export default accountService;
