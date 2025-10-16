import { Layout } from "@/components/layout/layout"
import { useNavigate } from "react-router-dom"
import { HeroSlider, VideoScrollSection } from "@/components/home"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Layout currentPage="home" backgroundColor="bg-white">
      {/* Hero Section */}
      <HeroSlider />

      {/* Video Scroll Section */}
      <VideoScrollSection />
    </Layout>
  )
} 