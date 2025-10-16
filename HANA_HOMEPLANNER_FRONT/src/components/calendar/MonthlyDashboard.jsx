import React, { useMemo, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';
import {
  PiggyBank,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

const COLORS = {
  SAVINGS: '#10b981', // 초록
  LOAN: '#ef4444', // 빨강
  JOINT_LOAN: '#f97316', // 주황
  CONSUMPTION: '#f59e0b', // 노랑
  CARD: '#8b5cf6', // 보라
  ETC: '#6b7280', // 회색
  INCOME: '#059669', // 진한 초록
  EXPENSE: '#dc2626' // 진한 빨강
};

const formatCurrency = (amount) => {
  if (!amount) return '0원';
  
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
};

const MonthlyDashboard = ({ events, currentDate, formatEventCurrency }) => {
  // 이벤트 데이터가 없을 때 기본값 설정
  const safeEvents = events || [];
  
  // 디버깅: 받아온 데이터 확인
  React.useEffect(() => {
    console.log('📊 [MonthlyDashboard] 받아온 이벤트 데이터:', {
      events,
      eventsLength: events?.length || 0,
      currentDate: currentDate.toISOString(),
      sampleEvent: events?.[0]
    });
  }, [events, currentDate]);
  
  // 월별 데이터 계산
  const monthlyData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 해당 월의 이벤트 필터링
    const monthlyEvents = safeEvents.filter(event => {
      const eventDate = new Date(event.eventDate || event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    // 타입별 분류
    const eventsByType = {
      SAVINGS: monthlyEvents.filter(e => e.eventType === 'SAVINGS'),
      LOAN: monthlyEvents.filter(e => e.eventType === 'LOAN' || e.eventType === 'JOINT_LOAN'),
      CONSUMPTION: monthlyEvents.filter(e => e.eventType === 'CONSUMPTION'),
      CARD: monthlyEvents.filter(e => e.eventType === 'CARD'),
      ETC: monthlyEvents.filter(e => e.eventType === 'ETC')
    };

    // 거래 타입별 분류
    const depositEvents = monthlyEvents.filter(e => e.transactionType === 'DEPOSIT');
    const withdrawEvents = monthlyEvents.filter(e => e.transactionType === 'WITHDRAW');

    // 금액 계산
    const totalDeposit = depositEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalWithdraw = withdrawEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netAmount = totalDeposit - totalWithdraw;

    // 타입별 금액
    const amountsByType = {
      SAVINGS: eventsByType.SAVINGS.reduce((sum, e) => sum + (e.amount || 0), 0),
      LOAN: eventsByType.LOAN.reduce((sum, e) => sum + (e.amount || 0), 0),
      CONSUMPTION: eventsByType.CONSUMPTION.reduce((sum, e) => sum + (e.amount || 0), 0),
      CARD: eventsByType.CARD.reduce((sum, e) => sum + (e.amount || 0), 0),
      ETC: eventsByType.ETC.reduce((sum, e) => sum + (e.amount || 0), 0)
    };

    // 상태별 분류
    const scheduledEvents = monthlyEvents.filter(e => e.status === 'SCHEDULED');
    const completedEvents = monthlyEvents.filter(e => e.status === 'COMPLETED');
    const cancelledEvents = monthlyEvents.filter(e => e.status === 'CANCELLED');

    // 예산 대비 분석 (가정: 월 예산 500만원)
    const monthlyBudget = 5000000;
    const spendingRate = Math.min((totalWithdraw / monthlyBudget) * 100, 100);
    const isOverBudget = totalWithdraw > monthlyBudget;

    // 이전 달 대비 변화 계산 (임시로 랜덤 생성)
    const prevMonthSpending = totalWithdraw * (0.8 + Math.random() * 0.4);
    const spendingChange = ((totalWithdraw - prevMonthSpending) / prevMonthSpending) * 100;

    return {
      monthlyEvents,
      eventsByType,
      totalDeposit,
      totalWithdraw,
      netAmount,
      amountsByType,
      scheduledEvents,
      completedEvents,
      cancelledEvents,
      monthlyBudget,
      spendingRate,
      isOverBudget,
      spendingChange
    };
  }, [safeEvents, currentDate]);

  // 유틸리티 함수들
  const getTypeLabel = (type) => {
    const labels = {
      SAVINGS: '적금',
      LOAN: '대출',
      CONSUMPTION: '소비',
      CARD: '카드',
      ETC: '기타'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      SAVINGS: PiggyBank,
      LOAN: TrendingDown,
      CONSUMPTION: ShoppingCart,
      CARD: CreditCard,
      ETC: Clock
    };
    const IconComponent = icons[type] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('금액') ? '만원' : '건'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 파이 차트 데이터
  const pieChartData = useMemo(() => {
    return Object.entries(monthlyData.eventsByType)
      .filter(([_, events]) => events.length > 0)
      .map(([type, events]) => ({
        name: getTypeLabel(type),
        value: events.length,
        amount: monthlyData.amountsByType[type],
        color: COLORS[type]
      }));
  }, [monthlyData]);

  // 막대 차트 데이터
  const barChartData = useMemo(() => {
    return Object.entries(monthlyData.amountsByType)
      .filter(([_, amount]) => amount > 0)
      .map(([type, amount]) => ({
        type: getTypeLabel(type),
        amount: amount / 10000, // 만원 단위
        color: COLORS[type]
      }));
  }, [monthlyData]);

  // 일별 누적 데이터 (간단한 시뮬레이션)
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const data = [];
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      // 해당 일의 이벤트 찾기
      const dayEvents = monthlyData.monthlyEvents.filter(event => {
        const eventDate = new Date(event.eventDate || event.date);
        return eventDate.getDate() === day;
      });

      const dayIncome = dayEvents
        .filter(e => e.transactionType === 'DEPOSIT')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      
      const dayExpense = dayEvents
        .filter(e => e.transactionType === 'WITHDRAW')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      cumulativeIncome += dayIncome;
      cumulativeExpense += dayExpense;

      data.push({
        day,
        income: cumulativeIncome / 10000, // 만원 단위
        expense: cumulativeExpense / 10000, // 만원 단위
        net: (cumulativeIncome - cumulativeExpense) / 10000
      });
    }

    return data;
  }, [monthlyData, currentDate]);

  // 데이터가 없을 때 표시
  if (safeEvents.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-[485px] flex flex-col items-center justify-center">
        <div className="text-center">
          <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {currentDate.getMonth() + 1}월 재정 데이터가 없습니다
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            일정을 추가하여 월별 재정 분석을 시작해보세요
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 시작하기</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 적금 일정 등록하기</li>
              <li>• 대출 상환 일정 추가하기</li>
              <li>• 소비 계획 세우기</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>API 상태:</strong> /api/calendar/events 에서 데이터를 가져오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-[485px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentDate.getMonth() + 1}월 재정 대시보드
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          monthlyData.netAmount >= 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {monthlyData.netAmount >= 0 ? '흑자' : '적자'} {formatCurrency(Math.abs(monthlyData.netAmount))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* 주요 지표 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">총 수입</span>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(monthlyData.totalDeposit)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {monthlyData.eventsByType.SAVINGS.length}건의 적금
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">총 지출</span>
              </div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(monthlyData.totalWithdraw)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {monthlyData.eventsByType.CONSUMPTION.length + monthlyData.eventsByType.CARD.length}건의 소비
              </div>
            </div>
          </div>

          {/* 예산 대비 분석 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">예산 사용률</span>
              </div>
              <div className="flex items-center gap-1">
                {monthlyData.isOverBudget ? (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-sm font-bold ${
                  monthlyData.isOverBudget ? 'text-orange-600' : 'text-blue-700'
                }`}>
                  {monthlyData.spendingRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  monthlyData.isOverBudget ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(monthlyData.spendingRate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {formatCurrency(monthlyData.totalWithdraw)} 사용
              </span>
              <span className="text-gray-600">
                목표 {formatCurrency(monthlyData.monthlyBudget)}
              </span>
            </div>
            {monthlyData.isOverBudget && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                예산을 {formatCurrency(monthlyData.totalWithdraw - monthlyData.monthlyBudget)} 초과했습니다
              </div>
            )}
          </div>

          {/* 전월 대비 변화 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">전월 대비</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${
                monthlyData.spendingChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {monthlyData.spendingChange > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(monthlyData.spendingChange).toFixed(1)}%
              </div>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {monthlyData.spendingChange > 0 
                ? `지출이 ${Math.abs(monthlyData.spendingChange).toFixed(1)}% 증가했습니다`
                : `지출이 ${Math.abs(monthlyData.spendingChange).toFixed(1)}% 감소했습니다`
              }
            </div>
          </div>

          {/* 카테고리별 지출 차트 */}
          {pieChartData.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">카테고리별 지출 분포</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      dataKey="amount"
                      label={({ name, percent }) => percent > 10 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 일정 완료율 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="text-blue-600 font-bold">{monthlyData.scheduledEvents.length}</div>
              <div className="text-blue-700">예정</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="text-green-600 font-bold">{monthlyData.completedEvents.length}</div>
              <div className="text-green-700">완료</div>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center">
              <div className="text-gray-600 font-bold">
                {monthlyData.monthlyEvents.length > 0 
                  ? Math.round((monthlyData.completedEvents.length / monthlyData.monthlyEvents.length) * 100)
                  : 0
                }%
              </div>
              <div className="text-gray-700">달성률</div>
            </div>
          </div>

          {/* 재정 건강도 점수 */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-800">재정 건강도</span>
              <div className="flex items-center gap-1">
                {(() => {
                  const score = Math.max(0, Math.min(100, 
                    50 + // 기본 점수
                    (monthlyData.netAmount > 0 ? 20 : -20) + // 흑자/적자
                    (monthlyData.spendingRate < 80 ? 15 : -15) + // 예산 준수
                    (monthlyData.spendingChange < 0 ? 15 : -10) // 지출 감소
                  ));
                  
                  const getScoreColor = (score) => {
                    if (score >= 80) return 'text-green-600';
                    if (score >= 60) return 'text-yellow-600';
                    return 'text-red-600';
                  };

                  const getScoreLabel = (score) => {
                    if (score >= 80) return '우수';
                    if (score >= 60) return '양호';
                    return '주의';
                  };

                  return (
                    <>
                      <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(0)}점
                      </span>
                      <span className={`text-xs ${getScoreColor(score)}`}>
                        ({getScoreLabel(score)})
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="text-xs text-indigo-600">
              {monthlyData.netAmount > 0 && monthlyData.spendingRate < 80
                ? '훌륭한 재정 관리를 하고 계시네요! 👏'
                : monthlyData.isOverBudget
                ? '예산 관리에 더 신경쓰시길 권장합니다 💪'
                : '꾸준한 관리로 더 나은 결과를 만들어보세요 📈'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDashboard;
