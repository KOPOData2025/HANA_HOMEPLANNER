/**
 * 대출 플래너 추천 메시지 및 규제 안내 컴포넌트
 * recommendations, ltvWarnings, regulatoryNotices를 사용자 친화적으로 표시
 */

import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  Heart,
  Shield,
  AlertCircle
} from "lucide-react";

export const LoanPlannerRecommendations = ({ result }) => {
  if (!result) return null;

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const categorizeRecommendation = (recommendation) => {
    if (recommendation.includes('여유가 있습니다') || recommendation.includes('더 많은 대출')) {
      return 'success';
    } else if (recommendation.includes('초과') || recommendation.includes('위험')) {
      return 'error';
    } else if (recommendation.includes('주의') || recommendation.includes('신중')) {
      return 'warning';
    }
    return 'info';
  };

  const getBorrowerTypeIcon = (borrowerType) => {
    if (borrowerType.includes('생애최초')) return <Star className="w-4 h-4" />;
    if (borrowerType.includes('신혼부부')) return <Heart className="w-4 h-4" />;
    if (borrowerType.includes('청년')) return <Shield className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getBorrowerTypeColor = (borrowerType) => {
    if (borrowerType.includes('생애최초')) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    if (borrowerType.includes('신혼부부')) return 'bg-pink-50 border-pink-200 text-pink-800';
    if (borrowerType.includes('청년')) return 'bg-purple-50 border-purple-200 text-purple-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 특례 혜택 안내 */}
      {result.borrowerTypeText && (
        <div className={`border rounded-lg p-4 ${getBorrowerTypeColor(result.borrowerTypeText)}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getBorrowerTypeIcon(result.borrowerTypeText)}
            </div>
            <div>
              <h4 className="font-semibold mb-1">특례 혜택</h4>
              <p className="text-sm">{result.borrowerTypeText}</p>
            </div>
          </div>
        </div>
      )}

      {/* 추천 메시지 */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">추천 사항</h4>
          {result.recommendations.map((recommendation, index) => {
            const type = categorizeRecommendation(recommendation);
            return (
              <div key={index} className={`border rounded-lg p-3 ${getRecommendationColor(type)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    {getRecommendationIcon(type)}
                  </div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LTV 경고 */}
      {result.ltvWarnings && result.ltvWarnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">LTV 규제 안내</h4>
          {result.ltvWarnings.map((warning, index) => (
            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-sm text-orange-800">{warning}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 규제 안내 */}
      {result.regulatoryNotices && result.regulatoryNotices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">규제 안내</h4>
          {result.regulatoryNotices.map((notice, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-blue-800">{notice}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 신용등급 정보 */}
      {result.creditGrade && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center">
            <Shield className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-800">신용등급: </span>
            <span className="text-sm font-bold text-gray-900 ml-1">{result.creditGrade}</span>
          </div>
        </div>
      )}
    </div>
  );
};
