import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface TrendingItemProps {
  item: {
    id: number | string
    title: string
    heat: number | string
    trend: "up" | "down" | "stable"
    source: string
    url?: string
  }
  rank: number
  platformColor: string
}

export function TrendingItem({ item, rank, platformColor }: TrendingItemProps) {
  const formatHeat = (heat: number | string) => {
    if (typeof heat === 'string') return heat;
    if (typeof heat === 'number') {
      if (heat >= 1000000) {
        return `${(heat / 1000000).toFixed(1)}M`
      } else if (heat >= 1000) {
        return `${(heat / 1000).toFixed(1)}K`
      }
      return heat.toString()
    }
    return '';
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈"
      case "down":
        return "📉"
      default:
        return "➖"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const handleClick = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card
      className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4 flex items-center gap-4">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${platformColor} flex items-center justify-center text-white font-bold text-sm`}
        >
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-cyan-400 hover:bg-clip-text transition-all">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
              {item.source}
            </Badge>
            {item.heat && <span className="text-gray-400 text-sm">热度: {formatHeat(item.heat)}</span>}
          </div>
        </div>

        <div className={`flex items-center gap-1 ${getTrendColor(item.trend)}`}>
          <span>{getTrendIcon(item.trend)}</span>
          <span className="text-sm font-medium">{item.trend === "up" ? "+" : item.trend === "down" ? "-" : ""}</span>
        </div>
      </div>
    </Card>
  )
}
