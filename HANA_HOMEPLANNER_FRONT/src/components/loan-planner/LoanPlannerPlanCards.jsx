/**
 * 대출 플래너 플랜 제안 카드 컴포넌트
 * 보수적, 균형형, 공격적, 부부 통합 플랜 제안
 */

import { 
  Shield, 
  Target, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertTriangle,
  Star
} from "lucide-react";

export const LoanPlannerPlanCards = ({ 
  result, 
  planSuggestions, 
  onSelectPlan,
  selectedPlan 
}) => {
  if (!result || !planSuggestions) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return `${Math.round(amount).toLocaleString()}원`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value.toFixed(1)}%`;
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'conservative': return <Shield className="w-6 h-6" />;
      case 'balanced': return <Target className="w-6 h-6" />;
      case 'aggressive': return <TrendingUp className="w-6 h-6" />;
      case 'couple': return <Users className="w-6 h-6" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'conservative': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        button: 'bg-green-600 hover:bg-green-700'
      };
      case 'balanced': return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
      case 'aggressive': return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
      case 'couple': return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      };
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
    }
  };

  const calculatePlanMetrics = (plan) => {
    const ltv = (plan.loanAmount / result.housePrice) * 100;
    const monthlyPayment = plan.loanAmount * (result.stressRate / 100 / 12) * 
      Math.pow(1 + result.stressRate / 100 / 12, 30 * 12) / 
      (Math.pow(1 + result.stressRate / 100 / 12, 30 * 12) - 1);
    const dsr = (monthlyPayment * 12 / result.annualIncome) * 100;

    return { ltv, monthlyPayment, dsr };
  };

  const getRiskLevel = (planId, metrics) => {
    if (planId === 'conservative') return { level: '낮음', color: 'text-green-600' };
    if (planId === 'balanced') return { level: '보통', color: 'text-blue-600' };
    if (planId === 'aggressive') return { level: '높음', color: 'text-orange-600' };
    if (planId === 'couple') return { level: '중간', color: 'text-purple-600' };
    return { level: '보통', color: 'text-gray-600' };
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">추천 플랜</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planSuggestions.map((plan) => {
          const colors = getPlanColor(plan.id);
          const metrics = calculatePlanMetrics(plan);
          const risk = getRiskLevel(plan.id, metrics);
          const isSelected = selectedPlan === plan.id;

          return (
            <div 
              key={plan.id}
              className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : 'hover:shadow-md'
              }`}
              onClick={() => onSelectPlan(plan.id)}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`${colors.text} mr-2`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <h4 className={`font-semibold ${colors.text}`}>
                    {plan.name}
                  </h4>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* 설명 */}
              <p className={`text-sm ${colors.text} mb-3`}>
                {plan.description}
              </p>

              {/* 대출금액 */}
              <div className="mb-3">
                <div className={`text-lg font-bold ${colors.text}`}>
                  {formatCurrency(plan.loanAmount)}
                </div>
                <div className={`text-xs ${colors.text} opacity-75`}>
                  대출금액
                </div>
              </div>

              {/* 지표 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className={colors.text}>LTV</span>
                  <span className={`font-medium ${colors.text}`}>
                    {formatPercentage(metrics.ltv)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={colors.text}>DSR</span>
                  <span className={`font-medium ${colors.text}`}>
                    {formatPercentage(metrics.dsr)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={colors.text}>월상환액</span>
                  <span className={`font-medium ${colors.text}`}>
                    {formatCurrency(metrics.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={colors.text}>리스크</span>
                  <span className={`font-medium ${risk.color}`}>
                    {risk.level}
                  </span>
                </div>
              </div>

              {/* 특징 */}
              <div className="mb-4">
                <div className={`text-xs font-medium ${colors.text} mb-2`}>
                  주요 특징
                </div>
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      <span className={colors.text}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 선택 버튼 */}
              <button
                className={`w-full py-2 px-3 text-white text-sm font-medium rounded-lg transition-colors ${colors.button}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlan(plan.id);
                }}
              >
                {isSelected ? '선택됨' : '이 플랜 선택'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
