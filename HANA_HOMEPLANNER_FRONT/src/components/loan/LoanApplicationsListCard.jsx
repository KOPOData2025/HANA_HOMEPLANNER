import React, { useState } from 'react';
import { 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban,
  Calendar,
  DollarSign,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * 대출 신청 목록 카드 컴포넌트
 * 대출 신청 목록을 표시하고 필터링, 정렬 기능을 제공합니다.
 */
const LoanApplicationsListCard = ({ 
  applications, 
  isLoading, 
  formatCurrency,
  formatDate,
  formatTerm,
  getStatusBadgeColor,
  getStatusIcon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetails, setShowDetails] = useState({});

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">대출 신청 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">대출 신청 내역이 없습니다</h3>
          <p className="text-gray-600">아직 대출 신청 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 필터링 및 정렬
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.productId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submittedAt' || sortBy === 'reviewedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const toggleDetails = (appId) => {
    setShowDetails(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const getStatusIconComponent = (status) => {
    const iconMap = {
      'PENDING': Clock,
      'APPROVED': CheckCircle,
      'REJECTED': XCircle,
      'CANCELLED': Ban
    };
    return iconMap[status] || Clock;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">대출 신청 목록</h3>
            <p className="text-sm text-gray-500">총 {filteredApplications.length}건의 신청</p>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 검색 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="신청 ID 또는 상품 ID로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* 상태 필터 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterStatus === 'ALL' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterStatus === 'PENDING' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            심사중
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterStatus === 'APPROVED' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            승인
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filterStatus === 'REJECTED' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            거절
          </button>
        </div>
      </div>

      {/* 대출 신청 목록 */}
      <div className="space-y-3">
        {filteredApplications.map((application) => {
          const StatusIcon = getStatusIconComponent(application.status);
          const isExpanded = showDetails[application.appId];

          return (
            <div 
              key={application.appId}
              className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
            >
              {/* 기본 정보 */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-800">
                          대출 신청 #{application.appId.slice(-8)}
                        </h4>
                        <StatusIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500">
                        상품 ID: {application.productId}
                      </p>
                      <p className="text-xs text-gray-400">
                        신청일: {formatDate(application.submittedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(application.requestAmount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTerm(application.requestTerm)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(application.status)}`}>
                      {application.statusDescription}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상세 정보 (확장 가능) */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => toggleDetails(application.appId)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>상세 정보 보기</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">신청 정보</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>신청 ID: {application.appId}</p>
                          <p>상품 ID: {application.productId}</p>
                          <p>신청일: {formatDate(application.submittedAt)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">대출 조건</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>신청 금액: {formatCurrency(application.requestAmount)}</p>
                          <p>대출 기간: {formatTerm(application.requestTerm)}</p>
                          <p>지급 계좌: {application.disburseAccountId}</p>
                        </div>
                      </div>
                    </div>
                    
                    {application.reviewedAt && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">심사 정보</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>심사일: {formatDate(application.reviewedAt)}</p>
                          <p>심사자: {application.reviewerId || 'N/A'}</p>
                          {application.remarks && (
                            <p>비고: {application.remarks}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoanApplicationsListCard;
