import { TrendingPlatforms } from "@/components/trending-platforms"
import { HeroSection } from "@/components/hero-section"
import { StatsOverview } from "@/components/stats-overview"
import { AIAnalysisPanel } from "@/components/ai-analysis-panel"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50" />

      <div className="relative">
        <HeroSection />
        <StatsOverview />
        <AIAnalysisPanel />
        <TrendingPlatforms />
      </div>
    </div>
  )
}
