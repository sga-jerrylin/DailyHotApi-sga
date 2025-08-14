"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function StatsOverview() {
  const [stats, setStats] = useState([
    { label: "科技", value: 0, target: 100, color: "from-blue-500 to-cyan-500", key: "tech" },
    { label: "新媒体", value: 0, target: 100, color: "from-pink-500 to-purple-500", key: "media" },
    { label: "实时新闻", value: 0, target: 100, color: "from-red-500 to-orange-500", key: "news" },
    { label: "财经", value: 0, target: 100, color: "from-green-500 to-teal-500", key: "finance" },
    { label: "社区论坛", value: 0, target: 100, color: "from-yellow-500 to-amber-500", key: "community" },
    { label: "娱乐游戏", value: 0, target: 100, color: "from-indigo-500 to-violet-500", key: "entertainment" },
  ])

  useEffect(() => {
    // 获取真实数据
    async function fetchStats() {
      try {
        // 在开发模式下使用后端服务器地址，生产模式下使用相对路径
        const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:6688' : window.location.origin
        const response = await fetch(`${apiBase}/aggregate?group=source&per=10`)
        const data = await response.json()

        if (data.groups) {
          setStats(prev => prev.map(stat => {
            // 统计每个分类的数据源数量
            const categoryGroups = data.groups.filter((group: any) => group.category === stat.key)
            const totalItems = categoryGroups.reduce((sum: number, group: any) => sum + (group.data?.length || 0), 0)
            return {
              ...stat,
              value: categoryGroups.length, // 数据源数量
              target: Math.max(categoryGroups.length, 10) // 目标值
            }
          }))
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // 如果API失败，使用动画效果显示默认值
        const interval = setInterval(() => {
          setStats((prev) =>
            prev.map((stat) => ({
              ...stat,
              value: Math.min(stat.value + Math.random() * 3, stat.target),
            })),
          )
        }, 100)

        setTimeout(() => clearInterval(interval), 3000)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-black/20 border-gray-800 backdrop-blur-sm p-6 text-center">
            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {Math.floor(stat.value)}
            </div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            <div className="mt-3 bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-300`}
                style={{ width: `${(stat.value / stat.target) * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
