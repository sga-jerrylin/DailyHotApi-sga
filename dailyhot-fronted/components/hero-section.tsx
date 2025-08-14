"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function HeroSection() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative px-6 pt-8 lg:px-8 overflow-hidden min-h-[80vh]">
      {/* 星辰大海背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 星空背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-900/80 to-slate-900">
          {/* 大星星 */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}

          {/* 小星星 */}
          {[...Array(100)].map((_, i) => (
            <div
              key={`small-star-${i}`}
              className="absolute bg-white/60 rounded-full animate-twinkle-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '1px',
                height: '1px',
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* 流星效果 */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={`meteor-${i}`}
              className="absolute w-1 h-20 bg-gradient-to-b from-white via-cyan-300 to-transparent opacity-70 animate-meteor"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 30}%`,
                transform: 'rotate(45deg)',
                animationDelay: `${i * 8}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>

        {/* 星云效果 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-32 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute bottom-32 left-32 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-float-slow" />
        </div>

        {/* 银河系旋转效果 */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0 bg-gradient-conic from-transparent via-purple-500/20 to-transparent animate-galaxy-rotate"
            style={{
              background: `conic-gradient(from 0deg, transparent, rgba(147, 51, 234, 0.1), transparent, rgba(6, 182, 212, 0.1), transparent)`
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl py-16 sm:py-20">
        <div className="text-center space-y-8">
          {/* Logo和公司信息 */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Image
                src="/sga-logo.png"
                alt="SGA Logo"
                width={90}
                height={90}
                className="rounded-full border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/30 animate-float"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 to-cyan-400/30 animate-pulse" />
              <div className="absolute -inset-2 rounded-full border border-white/20 animate-spin-slow" />
            </div>

            <div className="text-base text-gray-300 font-mono tracking-wider leading-relaxed">
              Powered by{" "}
              <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-bold text-lg">
                SGA
              </span>{" "}
              • Solo Genius AI
            </div>
          </div>

          <div className="flex justify-center">
            <Badge variant="outline" className="border-cyan-500/50 bg-cyan-500/10 text-cyan-300 px-6 py-3 backdrop-blur-sm text-sm">
              <span className="animate-pulse mr-3 text-cyan-400">●</span>
              实时更新 {currentTime.toLocaleTimeString("zh-CN")}
            </Badge>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl leading-tight">
              <span className="block bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                AI驱动的中国热点
              </span>
              <span className="block text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mt-4">
                智能监控平台
              </span>
            </h1>

            <p className="text-xl leading-10 text-gray-300 max-w-3xl mx-auto backdrop-blur-sm">
              基于SGA AI技术，聚合78个数据源，
              <br className="hidden sm:block" />
              覆盖科技、新媒体、新闻、财经、社区、娱乐等六大分类，智能分析热点趋势，为您提供最具洞察力的中文互联网热点资讯。
            </p>
          </div>

          <div className="flex items-center justify-center gap-x-8 pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-10 py-4 text-lg shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 border border-cyan-400/30"
            >
              开始探索
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-500 text-gray-300 hover:bg-gray-800/50 px-10 py-4 text-lg bg-transparent backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300"
            >
              AI分析报告
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
