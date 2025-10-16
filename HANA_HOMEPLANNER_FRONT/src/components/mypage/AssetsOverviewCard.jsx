import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AssetsOverviewCard = ({
  assetsData,
  isLoading,
  error,
  onRefresh,
  getSummary,
  getAnalysis,
  formatCurrency,
}) => {
  const summary = getSummary();
  const analysis = getAnalysis();

  // ===============================
  //  건전성 점수 계산
  // ===============================
  const calculateHealthScore = () => {
    if (!summary) return 0;
    const totalAssets = summary.totalAssets || 0;
    const totalLiabilities = Math.abs(summary.totalLiabilities || 0);
    const netWorth = summary.netWorth || 0;
    if (totalAssets === 0) return totalLiabilities > 0 ? 0 : 50;
    if (totalLiabilities === 0) return 100;

    const debtRatio = totalLiabilities / totalAssets;
    const netWorthRatio = netWorth / totalAssets;
    let score = 0;

    if (debtRatio <= 0.3) score += 40;
    else if (debtRatio <= 0.5) score += 30;
    else if (debtRatio <= 0.7) score += 20;
    else score += 10;

    if (netWorthRatio >= 0.7) score += 60;
    else if (netWorthRatio >= 0.5) score += 50;
    else if (netWorthRatio >= 0.3) score += 40;
    else if (netWorthRatio >= 0) score += 30;
    else score += Math.max(0, 20 + netWorthRatio * 20);

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const healthScore = calculateHealthScore();

  // ===============================
  //  차트 데이터
  // ===============================
  const getChartData = () => {
    if (!summary) {
      return {
        labels: ["자산 없음"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#E5E7EB"],
            borderColor: ["#D1D5DB"],
            borderWidth: 1,
          },
        ],
      };
    }

    const totalAssets = summary.totalAssets || 0;
    const totalLiabilities = Math.abs(summary.totalLiabilities || 0);

    if (totalAssets === 0 && totalLiabilities === 0) {
      return {
        labels: ["자산 없음"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#E5E7EB"],
            borderColor: ["#D1D5DB"],
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      labels: ["자산", "부채"],
      datasets: [
        {
          data: [totalAssets, totalLiabilities],
          backgroundColor: ["#10B981", "#EF4444"],
          borderColor: ["#059669", "#DC2626"],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(context.parsed)}`,
        },
      },
    },
    cutout: "50%",
  };

  // ===============================
  //  로딩 및 에러 처리
  // ===============================
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center h-[430px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">자산 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !assetsData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[430px]">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <TrendingDown className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">자산 정보 없음</h3>
        <p className="text-gray-500 text-xs mb-4">자산 정보를 등록해주세요</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // ===============================
  //  메인 카드 레이아웃
  // ===============================
  return (
    <div className="bg-white rounded-3xl px-6 py-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 h-[430px] flex flex-col justify-between">
      {/* 헤더 */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md">
            <DollarSign className="w-5 h-5 text-green-800" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">자산 현황</h3>
            <p className="text-xs text-emerald-600 font-medium">
              마이데이터 자산 현황을 한눈에
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 중간 영역 */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 도넛 차트 */}
          <div className="flex items-center justify-center h-50">
            <div className="relative w-full h-full">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white/90 rounded-full px-3 py-2 shadow-sm">
                  <p className="text-sm font-bold text-black">
                    {formatCurrency(summary?.netWorth || 0)}
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    순자산
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 자산 정보 */}
          <div className="space-y-2">
            {[
              {
                label: "총 자산",
                value: summary?.totalAssets || 0,
                color: "emerald",
                icon: <TrendingUp className="w-4 h-4 text-white" />,
              },
              {
                label: "총 부채",
                value: summary?.totalLiabilities || 0,
                color: "red",
                icon: <TrendingDown className="w-4 h-4 text-white" />,
              },
              {
                label: "순자산",
                value: summary?.netWorth || 0,
                color: (summary?.netWorth || 0) >= 0 ? "blue" : "red",
                icon: <DollarSign className="w-4 h-4 text-white" />,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 bg-${item.color}-50 rounded-xl border border-${item.color}-100`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 bg-${item.color}-500 rounded-lg flex items-center justify-center`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      {item.label}
                    </p>
                    <p
                      className={`text-sm font-bold text-${item.color}-600 truncate`}
                    >
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 분석 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gray-600 rounded-md flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">분석</span>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-500">건전성 점수</p>
          <div className="flex items-center space-x-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                healthScore >= 70
                  ? "bg-green-500"
                  : healthScore >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <p
              className={`text-sm font-bold ${
                healthScore >= 70
                  ? "text-green-600"
                  : healthScore >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {healthScore}점
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsOverviewCard;
