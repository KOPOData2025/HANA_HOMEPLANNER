import { Home, Heart } from "lucide-react"

export const savingsTypes = [
  {
    id: "home",
    title: "내 집 마련 적금",
    description: "주택 구매를 위한 목돈 마련",
    icon: Home,
    color: "from-teal-500 to-teal-600"
  },
  {
    id: "couple", 
    title: "신혼 공동 적금",
    description: "신혼부부를 위한 공동명의 적금",
    icon: Heart,
    color: "from-pink-500 to-pink-600"
  }
]

export const getSavingsTypeById = (id) => {
  return savingsTypes.find(type => type.id === id) || savingsTypes[0]
}
