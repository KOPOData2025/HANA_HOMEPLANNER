import { 
  Home, 
  Heart, 
  DollarSign, 
  Target, 
  CheckCircle 
} from "lucide-react"

// 적금 상품 타입
export const savingsProducts = [
  {
    id: "home",
    title: "내 집 마련 적금",
    description: "주택 구매를 위한 목돈 마련 적금",
    icon: Home,
    color: "from-teal-500 to-teal-600",
    hoverColor: "hover:from-teal-600 hover:to-teal-700",
    features: ["최대 월 100만원", "최고 연 4.5%", "주택청약 연계", "세제혜택"],
    targetAmount: "5천만원 ~ 2억원",
    period: "24 ~ 60개월",
    interestRate: "연 4.5%",
    minAmount: "10만원",
    maxAmount: "100만원",
    periods: ["24개월", "36개월", "48개월", "60개월"],
    conditions: [
      "만 19세 이상 내국인",
      "월 소득 500만원 이하",
      "신용등급 6등급 이상",
      "하나은행 계좌 보유"
    ]
  },
  {
    id: "couple",
    title: "신혼 공동 적금",
    description: "신혼부부를 위한 공동명의 적금",
    icon: Heart,
    color: "from-pink-500 to-pink-600",
    hoverColor: "hover:from-pink-600 hover:to-pink-700",
    features: ["최대 월 50만원", "최고 연 4.2%", "공동명의", "결혼축하금"],
    targetAmount: "2천만원 ~ 1억원",
    period: "12 ~ 36개월",
    interestRate: "연 4.2%",
    minAmount: "5만원",
    maxAmount: "50만원",
    periods: ["12개월", "24개월", "36개월"],
    conditions: [
      "만 19세 이상 내국인",
      "신혼부부 공동명의",
      "신용등급 7등급 이상",
      "하나은행 계좌 보유"
    ]
  }
]

// 금리 정보
export const interestRateInfo = [
  {
    type: "기본금리",
    description: "모든 고객에게 동일하게 적용되는 기본 이자율",
    rate: "2.5%",
    icon: DollarSign,
    color: "bg-blue-50 border-blue-200 text-blue-800"
  },
  {
    type: "우대금리",
    description: "특정 조건 충족 시 추가로 받는 이자율",
    rate: "+1.0%",
    icon: Target,
    color: "bg-green-50 border-green-200 text-green-800"
  },
  {
    type: "추가금리",
    description: "자동이체, 급여이체 등 부가 조건 시 추가 이자율",
    rate: "+0.7%",
    icon: CheckCircle,
    color: "bg-teal-50 border-teal-200 text-teal-800"
  }
]

// 최대 금리 정보
export const maxInterestRateInfo = {
  maxRate: "4.00%",
  maxRateLabel: "최대 연 4.00% (세전)",
  components: [
    {
      type: "기본금리",
      rate: "연 3.00%",
      description: "적립식 적금 목적 금리혜택",
      icon: "🏆",
      color: "bg-yellow-100"
    },
    {
      type: "우대금리",
      rate: "연 0.20%",
      description: "1회차 가입혜택",
      icon: "🪙",
      color: "bg-yellow-100"
    },
    {
      type: "추가금리",
      rate: "연 0.20%",
      description: "급여 적금 우대금리 최고혜택(최대 4개)",
      icon: "🎯",
      color: "bg-red-100"
    }
  ],
  additionalInfo: {
    label: "지급액 사용료변화, 해지료변화 등 불리함!",
    description: "연간 적립 시 해당 연도 우대 적립액 0.1%(연 4개 3.00%)"
  }
}

// 유틸리티 함수들
export const getSavingsProductById = (id) => {
  return savingsProducts.find(product => product.id === id) || savingsProducts[0]
}

export const getInterestRateInfo = () => {
  return interestRateInfo
}

export const getMaxInterestRateInfo = () => {
  return maxInterestRateInfo
}
