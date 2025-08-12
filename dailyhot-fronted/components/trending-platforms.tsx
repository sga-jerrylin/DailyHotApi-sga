"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


// 分类映射 - 根据API返回的categories数据结构调整
const categoryMap = {
  tech: {
    name: "科技",
    icon: "🚀",
    color: "from-blue-500 to-cyan-500",
    key: "tech"
  },
  newmedia: {
    name: "新媒体",
    icon: "📱",
    color: "from-pink-500 to-purple-500",
    key: "media"  // API返回的是 "media"
  },
  news: {
    name: "实时新闻",
    icon: "📰",
    color: "from-red-500 to-orange-500",
    key: "news"
  },
  finance: {
    name: "财经",
    icon: "💰",
    color: "from-green-500 to-teal-500",
    key: "finance"
  }
}

// 格式化热度数字
function formatHeat(heat: any) {
  if (typeof heat === 'string') return heat;
  if (typeof heat === 'number') {
    if (heat >= 1000000) return `${(heat / 1000000).toFixed(1)}M`;
    if (heat >= 1000) return `${(heat / 1000).toFixed(1)}K`;
    return heat.toString();
  }
  return '';
}

export function TrendingPlatforms() {
  const [selectedCategory, setSelectedCategory] = useState("tech")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 获取数据 - 使用group=source模式获取按数据源分组的数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 在开发模式下使用后端服务器地址，生产模式下使用相对路径
        const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:6688' : window.location.origin
        const response = await fetch(`${apiBase}/aggregate?group=source&per=8`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // 每30秒刷新一次数据
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // 根据分类过滤数据源 - 使用后端提供的按数据源分组的数据
  const getFilteredSources = (category: string) => {
    if (!data?.groups || !Array.isArray(data.groups)) return []

    const categoryInfo = categoryMap[category as keyof typeof categoryMap]
    if (!categoryInfo) return []

    // 从CATEGORY_ROUTES配置中获取该分类的数据源列表
    const categoryRoutes = {
      tech: ["36kr", "ithome", "ithome-xijiayi", "csdn", "juejin", "geekpark", "ifanr", "hellogithub", "nodeseek", "linuxdo", "github", "producthunt"],
      media: ["weibo", "zhihu", "zhihu-daily", "douyin", "kuaishou", "bilibili", "acfun", "tieba", "v2ex", "smzdm", "coolapk", "douban-group", "douban-movie", "weread", "yystv", "hupu"],
      news: ["qq-news", "sina-news", "sina", "netease-news", "thepaper", "nytimes", "baidu", "weatheralarm", "earthquake"],
      finance: ["36kr", "thepaper", "huxiu"]
    }

    const routes = categoryRoutes[categoryInfo.key as keyof typeof categoryRoutes] || []

    // 过滤出属于当前分类的数据源
    return data.groups.filter((group: any) => routes.includes(group.route)).map((group: any) => ({
      route: group.route,
      name: group.title,
      title: group.title,
      items: group.data || [],
      total: group.total || 0
    }))
  }



  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">35个数据源 · 四大分类聚合</h2>
          <p className="text-gray-400">科技、新媒体、实时新闻、财经 - 全方位热点追踪</p>
        </div>
        <div className="text-center text-gray-400 py-12">
          <div className="animate-pulse">正在加载热点数据...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">35个数据源 · 四大分类聚合</h2>
        <p className="text-gray-400">科技、新媒体、实时新闻、财经 - 全方位热点追踪</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-gray-800">
          {Object.entries(categoryMap).map(([key, category]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 text-white"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categoryMap).map(([categoryKey, category]) => {
          const filteredSources = getFilteredSources(categoryKey)

          return (
            <TabsContent key={categoryKey} value={categoryKey} className="mt-8">
              {filteredSources.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  暂无{category.name}分类数据
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSources.map((sourceGroup: any, index: number) => (
                      <Card
                        key={index}
                        className="bg-black/20 border-gray-800 backdrop-blur-sm hover:bg-black/30 transition-all duration-300"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent text-base font-semibold`}>
                                {sourceGroup.name}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs"
                            >
                              {sourceGroup.items?.length || 0} 条
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {sourceGroup.items?.slice(0, 10).map((item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                className="group cursor-pointer hover:bg-black/30 rounded-lg p-2 transition-all duration-200 border border-transparent hover:border-gray-700"
                                onClick={() => window.open(item.url, '_blank')}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-gray-400 text-sm font-mono min-w-[20px] mt-0.5">
                                    {itemIndex + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm line-clamp-2 leading-relaxed group-hover:text-blue-400 transition-colors">
                                      {item.title}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-gray-500">{item.time}</span>
                                      {item.hot && (
                                        <span className="text-xs text-gray-500">热度: {formatHeat(item.hot)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 查看更多 */}
                          {sourceGroup.items?.length > 10 && (
                            <div className="mt-4 pt-3 border-t border-gray-700">
                              <button className="w-full text-center text-sm text-gray-400 hover:text-gray-300 transition-colors">
                                查看更多 ({sourceGroup.items.length - 10} 条)
                              </button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-4 bg-black/20 border border-gray-800 rounded-lg px-6 py-3 backdrop-blur-sm">
                      <span className="text-gray-400">
                        {category.name}分类 · {filteredSources.length} 个数据源 ·
                        {filteredSources.reduce((total: number, source: any) => total + (source.items?.length || 0), 0)} 条热点
                      </span>
                      <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                        查看全部
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
