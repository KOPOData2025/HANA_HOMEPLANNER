import { Layout } from "@/components/layout/layout"

// 커스텀 훅
import { useSavingsSelection } from "@/hooks/useSavingsSelection"

// 컴포넌트들
import SavingsHero from "@/components/savings/SavingsHero"
import SavingsProductSection from "@/components/savings/SavingsProductSection"
import InterestRateSection from "@/components/savings/InterestRateSection"

export default function SavingsRecommendationPage() {
  // 커스텀 훅 사용
  const {
    selectedSavingsType,
    handleSavingsSelect
  } = useSavingsSelection()

  return (
    <Layout currentPage="savings" backgroundColor="bg-gray-50">
      {/* Hero Section */}
      <SavingsHero />

      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
        {/* 적금 선택 섹션 */}
        <SavingsProductSection
          selectedSavingsType={selectedSavingsType}
          onSavingsSelect={handleSavingsSelect}
        />

        {/* 금리 안내 바 */}
        <InterestRateSection />
      </div>
    </Layout>
  )
}