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
  media: {
    name: "新媒体",
    icon: "📱",
    color: "from-pink-500 to-purple-500",
    key: "media"
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
  },
  community: {
    name: "社区论坛",
    icon: "💬",
    color: "from-yellow-500 to-amber-500",
    key: "community"
  },
  entertainment: {
    name: "娱乐游戏",
    icon: "🎮",
    color: "from-indigo-500 to-violet-500",
    key: "entertainment"
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
  const [categoryData, setCategoryData] = useState<{[key: string]: any}>({})
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set())
  const [loadedSources, setLoadedSources] = useState<{[key: string]: Set<string>}>({})

  // 流式加载所有数据 - 加载一个显示一个
  const fetchAllDataStreaming = async () => {
    const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:6688' : window.location.origin

    try {
      // 标记所有分类为加载中
      setLoadingCategories(new Set(Object.keys(categoryMap)))

      // 并发获取所有分类的数据
      const categoryPromises = Object.keys(categoryMap).map(async (category) => {
        try {
          const response = await fetch(`${apiBase}/aggregate?group=source&category=${category}&per=10`)
          const result = await response.json()

          // 立即更新这个分类的数据（流式显示）
          setCategoryData(prev => ({
            ...prev,
            [category]: result
          }))

          // 标记这个分类加载完成
          setLoadingCategories(prev => {
            const newSet = new Set(prev)
            newSet.delete(category)
            return newSet
          })

          // 记录已加载的数据源
          if (result.groups) {
            setLoadedSources(prev => ({
              ...prev,
              [category]: new Set(result.groups.map((g: any) => g.route))
            }))
          }

          console.log(`✅ [${category}] 分类数据加载完成`)

        } catch (error) {
          console.error(`❌ [${category}] 分类数据加载失败:`, error)
          // 即使失败也要移除加载状态
          setLoadingCategories(prev => {
            const newSet = new Set(prev)
            newSet.delete(category)
            return newSet
          })
        }
      })

      // 等待所有分类加载完成（但不阻塞显示）
      await Promise.allSettled(categoryPromises)
      console.log('🎉 所有分类数据加载完成')

    } catch (error) {
      console.error('❌ 数据加载失败:', error)
      setLoadingCategories(new Set())
    }
  }

  // 初始化时开始流式加载
  useEffect(() => {
    fetchAllDataStreaming()
  }, [])

  // 根据分类获取数据源
  const getFilteredSources = (category: string) => {
    const currentData = categoryData[category]
    if (!currentData?.groups || !Array.isArray(currentData.groups)) return []

    return currentData.groups.map((group: any) => ({
      route: group.route,
      name: group.title,
      title: group.title,
      items: group.data || [],
      total: group.total || 0
    }))
  }

  // 手动刷新所有数据
  const refreshAllData = async () => {
    // 清空现有数据
    setCategoryData({})
    setLoadedSources({})
    // 重新开始流式加载
    await fetchAllDataStreaming()
  }

  // 检查分类是否正在加载
  const isCategoryLoading = (category: string) => {
    return loadingCategories.has(category)
  }

  // 检查分类是否有数据
  const hasCategoryData = (category: string) => {
    return categoryData[category] && getFilteredSources(category).length > 0
  }



  // 获取加载统计信息
  const totalCategories = Object.keys(categoryMap).length
  const loadedCategoriesCount = totalCategories - loadingCategories.size
  const loadingProgress = Math.round((loadedCategoriesCount / totalCategories) * 100)

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-3xl font-bold text-white">78个数据源 · 六大分类聚合</h2>
          <div className="flex items-center gap-3">
            {loadingCategories.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>加载中 {loadingProgress}%</span>
              </div>
            )}
            <Button
              onClick={refreshAllData}
              disabled={loadingCategories.size > 0}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              {loadingCategories.size > 0 ? "🔄 加载中..." : "🔄 刷新全部"}
            </Button>
          </div>
        </div>
        <p className="text-gray-400">科技、新媒体、实时新闻、财经、社区论坛、娱乐游戏 - 全方位热点追踪</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-black/20 border border-gray-800">
          {Object.entries(categoryMap).map(([key, category]) => {
            const isLoading = isCategoryLoading(key)
            const hasData = hasCategoryData(key)

            return (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 text-white relative"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                {isLoading && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
                {hasData && !isLoading && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(categoryMap).map(([categoryKey, category]) => {
          const filteredSources = getFilteredSources(categoryKey)
          const isLoading = isCategoryLoading(categoryKey)
          const hasData = hasCategoryData(categoryKey)

          return (
            <TabsContent key={categoryKey} value={categoryKey} className="mt-8">
              {isLoading && !hasData ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="animate-pulse">正在加载 {category.name} 数据...</div>
                </div>
              ) : hasData ? (
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
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div>暂无 {category.name} 数据</div>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
