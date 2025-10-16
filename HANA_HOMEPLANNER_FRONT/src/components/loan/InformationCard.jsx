import React from 'react';
import { Info } from 'lucide-react';

const InformationCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-blue-500" />
        안내사항
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex items-start">
          <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>
            시뮬레이션 결과는 참고용이며, 실제 대출 조건과 다를 수
            있습니다.
          </span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>
            정확한 대출 조건은 상담을 통해 확인하시기 바랍니다.
          </span>
        </li>
        <li className="flex items-start">
          <span className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>
            대출 승인 여부는 신용평가 결과에 따라 달라질 수 있습니다.
          </span>
        </li>
      </ul>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors">
          대출 상담 신청하기
        </button>
      </div>
    </div>
  );
};

export default InformationCard;
