import { useState, useRef, useEffect } from 'react';

// 옵션 데이터는 관리를 위해 밖으로 빼는 것이 좋습니다.
const eventOptions = [
  { value: "SAVINGS", label: "적금" },
  { value: "LOAN", label: "대출" },
  { value: "CARD", label: "카드" },
  { value: "CONSUMPTION", label: "소비" },
  { value: "UTILITY", label: "공과금" },
  { value: "MANAGEMENT_FEE", label: "관리비" },
  { value: "INSURANCE", label: "보험료" },
  { value: "TAX", label: "세금" },
  { value: "SUBSCRIPTION", label: "구독료" },
  { value: "EDUCATION", label: "교육비" },
  { value: "MEDICAL", label: "의료비" },
  { value: "TRANSPORTATION", label: "교통비" },
  { value: "FOOD", label: "식비" },
  { value: "ENTERTAINMENT", label: "오락비" },
  { value: "SHOPPING", label: "쇼핑" },
  { value: "TRAVEL", label: "여행비" },
  { value: "ETC", label: "기타" }
];

function CustomSelect({ value, onChange, options = eventOptions }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* 현재 선택된 값을 보여주는 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none pr-8"
      >
        <span>{selectedOption ? selectedOption.label : '선택하세요'}</span>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* isOpen이 true일 때만 보이는 옵션 목록 */}
      {isOpen && (
        <div 
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <ul>
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
