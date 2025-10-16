import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

export const AreaChart = ({ data, areaType, onClose }) => {
  if (!data || data.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md">
          <h3 className="text-xl font-bold mb-4">데이터 없음</h3>
          <p className="text-gray-600 mb-6">해당 주택형에 대한 데이터가 없습니다.</p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  // 차트용 데이터 가공
  const chartData = data.map(item => ({
    floor: item.floor,
    세대수: item.count,
    '분양가(억원)': item.price
  }));

  // 파이차트용 데이터
  const pieData = data.map((item, index) => ({
    name: item.floor,
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`층구분: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === '분양가(억원)' ? '억원' : '세대'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{areaType} 전용면적 분석</h2>
            <p className="text-purple-100 mt-1">층별 세대수 및 분양가격 현황</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
          >
            ×
          </button>
        </div>

        {/* 차트 영역 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* 막대 차트 - 세대수 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">층별 세대수 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="floor" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="세대수" 
                    fill="url(#colorGradient1)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#764ba2" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 파이 차트 - 세대수 비율 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">세대수 비율</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 라인 차트 - 분양가격 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">층별 분양가격 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="floor" 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#374151' }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="분양가(억원)" 
                    stroke="#f093fb"
                    strokeWidth={3}
                    dot={{ fill: '#f093fb', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#f5576c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 통계 요약 */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">통계 요약</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">총 세대수</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.reduce((sum, item) => sum + item.count, 0)}세대
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">평균 분양가</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(data.reduce((sum, item) => sum + item.price, 0) / data.length)}억원
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">최고 분양가</div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...data.map(item => item.price))}억원
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">최저 분양가</div>
                  <div className="text-2xl font-bold text-red-600">
                    {Math.min(...data.map(item => item.price))}억원
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaChart;
