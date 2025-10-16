import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Building2,
  CreditCard,
  TrendingUp,
  Shield,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useInviteSignup } from '@/hooks/useInviteSignup';
import { getCiFromLocal } from '@/utils/ciUtils';
import { useMyData } from '@/hooks/useMyData';
import { INSTITUTION_TYPE_COLORS, INSTITUTION_TYPE_BG_COLORS } from '@/utils/financialInstitutionUtils';

const FinancialConnectionForm = ({ 
  initialData, 
  onComplete, 
  onBack 
}) => {
  const { processInviteSignup, isLoading: isSignupLoading } = useInviteSignup();
  const { fetchMyData, myData, isLoading: isMyDataLoading, error: myDataError } = useMyData();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [currentConnecting, setCurrentConnecting] = useState('');
  const [selectedFinancialItems, setSelectedFinancialItems] = useState({
    bankAccounts: [],
    cards: [],
    bankLoans: [],
    cardLoans: [],
    installmentLoans: [],
    insuranceLoans: []
  });

  // 컴포넌트 마운트 시 마이데이터 조회
  useEffect(() => {
    const ci = getCiFromLocal();
    if (ci) {
      console.log('🔍 CI 값으로 마이데이터 조회 시작:', ci);
      fetchMyData(ci);
    } else {
      console.log('⚠️ CI 값이 없어서 마이데이터 조회를 건너뜁니다.');
    }
  }, [fetchMyData]);

  // 섹션 확장/축소 토글
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 계좌번호 마스킹
  const maskAccountNumber = (accountNum) => {
    if (!accountNum) return '';
    if (accountNum.length <= 8) return accountNum;
    return accountNum.substring(0, 4) + '****' + accountNum.substring(accountNum.length - 4);
  };

  // 카드번호 마스킹
  const maskCardNumber = (cardNum) => {
    if (!cardNum) return '';
    return cardNum.replace(/\d{4}(?=\d{4})/g, '****');
  };

  // 금융 아이템 선택/해제
  const toggleFinancialItem = (category, itemId) => {
    setSelectedFinancialItems(prev => ({
      ...prev,
      [category]: prev[category].includes(itemId)
        ? prev[category].filter(id => id !== itemId)
        : [...prev[category], itemId]
    }));
  };

  // 카테고리별 전체 선택/해제
  const toggleCategorySelection = (category, items) => {
    const allIds = items.map(item => item.accountId || item.cardId || item.loanId || item.cardLoanId || item.instLoanId || item.insLoanId);
    const isAllSelected = allIds.every(id => selectedFinancialItems[category].includes(id));
    
    setSelectedFinancialItems(prev => ({
      ...prev,
      [category]: isAllSelected ? [] : allIds
    }));
  };

  // 선택된 총 아이템 수 계산
  const getTotalSelectedItems = () => {
    return Object.values(selectedFinancialItems).flat().length;
  };

  // 전체 선택/해제
  const toggleAllFinancialItems = () => {
    if (!myData) return;

    const allItems = [
      ...(myData.bankAccounts || []),
      ...(myData.cards || []),
      ...(myData.bankLoans || []),
      ...(myData.cardLoans || []),
      ...(myData.installmentLoans || []),
      ...(myData.insuranceLoans || [])
    ];

    const totalItems = allItems.length;
    const currentSelected = getTotalSelectedItems();
    
    // 현재 모든 아이템이 선택되어 있으면 전체 해제, 아니면 전체 선택
    const isAllSelected = currentSelected === totalItems;
    
    if (isAllSelected) {
      // 전체 해제
      setSelectedFinancialItems({
        bankAccounts: [],
        cards: [],
        bankLoans: [],
        cardLoans: [],
        installmentLoans: [],
        insuranceLoans: []
      });
    } else {
      // 전체 선택
      const newSelection = {};
      Object.keys(selectedFinancialItems).forEach(category => {
        const items = myData[category] || [];
        newSelection[category] = items.map(item => 
          item.accountId || item.cardId || item.loanId || item.cardLoanId || item.instLoanId || item.insLoanId
        );
      });
      setSelectedFinancialItems(newSelection);
    }
  };

  // 금융 아이템 카드 렌더링
  const renderFinancialItemCard = (item, category, type) => {
    const itemId = item.accountId || item.cardId || item.loanId || item.cardLoanId || item.instLoanId || item.insLoanId;
    const isSelected = selectedFinancialItems[category].includes(itemId);
    
    return (
      <div
        key={itemId}
        onClick={() => toggleFinancialItem(category, itemId)}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-teal-500 bg-teal-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {item.institution.logo.startsWith('/') ? (
                <img 
                  src={item.institution.logo} 
                  alt={item.institution.name} 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span 
                className={`text-xs font-bold text-gray-600 ${item.institution.logo.startsWith('/') ? 'hidden' : 'block'}`}
                style={{ display: item.institution.logo.startsWith('/') ? 'none' : 'block' }}
              >
                {item.institution.logo}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {item.accountName || item.cardName || item.loanType || item.productName}
              </div>
              <div className="text-sm text-gray-600">{item.institution.name}</div>
              <div className="text-xs text-gray-500">
                {item.accountNum ? maskAccountNumber(item.accountNum) : 
                 item.cardNum ? maskCardNumber(item.cardNum) : 
                 item.accountType || item.cardType || ''}
              </div>
            </div>
          </div>
          <div className="text-right">
            {item.balanceAmt !== undefined && (
              <div className={`font-semibold ${
                category.includes('Loan') ? 'text-red-700' : 'text-gray-800'
              }`}>
                {formatAmount(item.balanceAmt)}
              </div>
            )}
            {item.intRate && (
              <div className="text-xs text-gray-500">{item.intRate}%</div>
            )}
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-teal-600 mt-1" />
            )}
          </div>
        </div>
      </div>
    );
  };

  // 금융 카테고리 섹션 렌더링
  const renderFinancialCategory = (title, items, category, icon, emptyMessage) => {
    if (!items || items.length === 0) return null;

    const allIds = items.map(item => item.accountId || item.cardId || item.loanId || item.cardLoanId || item.instLoanId || item.insLoanId);
    const isAllSelected = allIds.every(id => selectedFinancialItems[category].includes(id));
    const selectedCount = selectedFinancialItems[category].length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <span className="text-sm text-gray-500">
              ({selectedCount}/{items.length}개 선택)
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => toggleCategorySelection(category, items)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isAllSelected
                ? 'bg-gray-500 hover:bg-gray-600 text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isAllSelected ? '전체 해제' : '모두 선택'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => renderFinancialItemCard(item, category, title))}
        </div>
      </div>
    );
  };

  const handleConnect = async () => {
    if (!myData) {
      toast.error('마이데이터 조회가 완료되지 않았습니다.');
      return;
    }

    setIsConnecting(true);
    setConnectionProgress(0);
    setCurrentConnecting('마이데이터 연동중...');

    try {
      // 1단계: 마이데이터 연동 애니메이션 (2초)
      const duration = 2000;
      const interval = 50;
      let elapsed = 0;

      const progressTimer = setInterval(async () => {
        elapsed += interval;
        const progress = (elapsed / duration) * 50; // 50%까지만 (마이데이터 연동)
        setConnectionProgress(Math.min(progress, 50));
        
        if (elapsed >= duration) {
          clearInterval(progressTimer);
          
          try {
            // 2단계: 실제 회원가입 API 호출
            setCurrentConnecting('회원가입 처리중...');
            setConnectionProgress(60);
            
            // 선택된 금융 아이템 정보 추출
            const getSelectedFinancialItems = () => {
              const selectedItems = {};
              
              Object.keys(selectedFinancialItems).forEach(category => {
                const selectedIds = selectedFinancialItems[category];
                if (selectedIds.length > 0) {
                  selectedItems[category] = myData[category]?.filter(item => {
                    const itemId = item.accountId || item.cardId || item.loanId || item.cardLoanId || item.instLoanId || item.insLoanId;
                    return selectedIds.includes(itemId);
                  }) || [];
                }
              });
              
              return selectedItems;
            };

            // 회원가입 데이터 준비 (선택된 금융 아이템 정보 포함)
            const signupData = {
              ...initialData,
              myData: myData, // 마이데이터 전체 정보 포함
              selectedFinancialItems: getSelectedFinancialItems(), // 선택된 금융 아이템만 포함
              totalSelectedItems: getTotalSelectedItems(),
              connectionDate: new Date().toISOString(),
              // 필요한 추가 필드들
              phnNum: initialData.phnNum || '010-0000-0000',
              resNum: '123456-1234567', // 주민번호는 실제로는 마이데이터에서 받아야 함
              ci: initialData.ci || getCiFromLocal() // CI 값 포함
            };

            console.log('최종 회원가입 데이터 (마이데이터 포함):', signupData);
            
            setConnectionProgress(80);
            
            // 초대 토큰이 있으면 초대 회원가입, 없으면 일반 회원가입
            if (signupData.inviteToken) {
              setCurrentConnecting('커플 연결 처리중...');
              await processInviteSignup(signupData);
            } else {
              // 일반 회원가입의 경우 기존 로직 유지
              setConnectionProgress(100);
              setCurrentConnecting('회원가입 완료!');
              
              setTimeout(() => {
                onComplete(signupData);
              }, 500);
            }
            
          } catch (apiError) {
            console.error('회원가입 API 오류:', apiError);
            toast.error('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsConnecting(false);
            setConnectionProgress(0);
            setCurrentConnecting('');
          }
        }
      }, interval);

    } catch (error) {
      console.error('연동 과정 오류:', error);
      toast.error('마이데이터 연동 중 오류가 발생했습니다.');
      setIsConnecting(false);
      setConnectionProgress(0);
      setCurrentConnecting('');
    }
  };


  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 mx-auto text-teal-600 animate-spin" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              금융기관 연결 중
            </h2>
            
            <p className="text-gray-600 mb-6">{currentConnecting}</p>
            
            {/* 프로그레스 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${connectionProgress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">
              {Math.round(connectionProgress)}% 완료
            </p>
            
            <div className="mt-6 text-xs text-gray-400">
              💡 안전한 암호화 통신으로 데이터를 보호하고 있습니다
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto max-w-4xl px-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button 
              onClick={onBack}
              className="absolute left-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로
            </button>
            <h1 className="text-3xl font-bold text-gray-800">금융기관 연결</h1>
          </div>
          <p className="text-gray-600">마이데이터 서비스 이용을 위해 금융기관을 연결해주세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-8">
            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">안전한 데이터 연결</h4>
                  <p className="text-sm text-blue-700">
                    금융위원회 인증을 받은 안전한 마이데이터 서비스입니다. 
                    선택하신 금융기관의 데이터만 수집되며, 언제든지 연결을 해제할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 마이데이터 조회 결과 */}
            {isMyDataLoading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                  <span className="text-gray-700">마이데이터 조회 중...</span>
                </div>
              </div>
            )}

            {myDataError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">마이데이터 조회 실패</h4>
                    <p className="text-sm text-red-700">{myDataError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 조회된 사용자의 금융 정보 헤더 */}
            {myData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800">조회된 사용자의 금융 정보</h4>
                      <p className="text-sm text-green-700">
                        총 {myData.summary?.totalAccountCount || 0}개 계좌, {myData.summary?.totalCardCount || 0}개 카드, {myData.summary?.totalLoanCount || 0}개 대출이 확인되었습니다.
                      </p>
                    </div>
                  </div>
                  
                  {/* 전체 선택/해제 버튼 */}
                  <button
                    type="button"
                    onClick={toggleAllFinancialItems}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      getTotalSelectedItems() === 0
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : getTotalSelectedItems() === (myData.summary?.totalAccountCount || 0) + (myData.summary?.totalCardCount || 0) + (myData.summary?.totalLoanCount || 0)
                        ? 'bg-gray-500 hover:bg-gray-600 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {getTotalSelectedItems() === 0
                      ? '모두 선택'
                      : getTotalSelectedItems() === (myData.summary?.totalAccountCount || 0) + (myData.summary?.totalCardCount || 0) + (myData.summary?.totalLoanCount || 0)
                      ? '전체 해제'
                      : '모두 선택'
                    }
                  </button>
                </div>
              </div>
            )}

            {/* 은행 계좌 섹션 */}
            {myData && myData.bankAccounts && myData.bankAccounts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '은행 계좌',
                  myData.bankAccounts,
                  'bankAccounts',
                  <Building2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
            )}

            {/* 카드 섹션 */}
            {myData && myData.cards && myData.cards.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '카드',
                  myData.cards,
                  'cards',
                  <CreditCard className="w-5 h-5 text-purple-600" />
                )}
              </div>
            )}

            {/* 은행 대출 섹션 */}
            {myData && myData.bankLoans && myData.bankLoans.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '은행 대출',
                  myData.bankLoans,
                  'bankLoans',
                  <Building2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
            )}

            {/* 카드 대출 섹션 */}
            {myData && myData.cardLoans && myData.cardLoans.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '카드 대출',
                  myData.cardLoans,
                  'cardLoans',
                  <CreditCard className="w-5 h-5 text-purple-600" />
                )}
              </div>
            )}

            {/* 할부 대출 섹션 */}
            {myData && myData.installmentLoans && myData.installmentLoans.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '할부 대출',
                  myData.installmentLoans,
                  'installmentLoans',
                  <TrendingUp className="w-5 h-5 text-green-600" />
                )}
              </div>
            )}

            {/* 보험 대출 섹션 */}
            {myData && myData.insuranceLoans && myData.insuranceLoans.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {renderFinancialCategory(
                  '보험 대출',
                  myData.insuranceLoans,
                  'insuranceLoans',
                  <Shield className="w-5 h-5 text-orange-600" />
                )}
              </div>
            )}



            {/* 연결 버튼 */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="text-gray-600">
                  {myData ? (
                    <>
                      총 <span className="font-semibold text-teal-600">{getTotalSelectedItems()}개</span> 금융 상품 선택됨
                    </>
                  ) : (
                    <span className="font-semibold text-gray-500">마이데이터 조회 중...</span>
                  )}
                </div>
                {myData && getTotalSelectedItems() > 0 && (
                  <div className="text-sm text-gray-500">
                    선택된 금융 상품 정보가 회원가입에 포함됩니다
                  </div>
                )}
              </div>
              
              {isConnecting ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                      <span className="text-gray-700 font-medium">{currentConnecting}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${connectionProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {Math.round(connectionProgress)}% 완료
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={!myData || isMyDataLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      !myData || isMyDataLoading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {isMyDataLoading 
                      ? '마이데이터 조회 중...' 
                      : !myData 
                        ? '마이데이터 조회를 기다리는 중...'
                        : getTotalSelectedItems() === 0
                          ? '금융 상품 없이 회원가입 완료하기'
                          : `${getTotalSelectedItems()}개 금융 상품으로 회원가입 완료하기`
                    }
                  </button>
                  
                  {myData && getTotalSelectedItems() > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      선택된 금융 상품 정보가 회원가입에 포함됩니다
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialConnectionForm;
