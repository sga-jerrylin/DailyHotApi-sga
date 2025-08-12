"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Brain, Zap } from "lucide-react"

export function AIAnalysisPanel() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisText, setAnalysisText] = useState("")
  const [error, setError] = useState("")

  // DeepSeek API配置
  const DEEPSEEK_API_KEY = "sk-ea98b5da86954ddcaa2ff10e5bbba2b4"
  const DEEPSEEK_BASE_URL = "https://api.deepseek.com"

  // 获取热点数据并调用DeepSeek分析
  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisText("")
    setError("")

    try {
      // 1. 获取热点数据 - 使用现有的aggregate API
      const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:6688' : window.location.origin
      const response = await fetch(`${apiBase}/aggregate?group=source&per=5`)
      const hotData = await response.json()

      if (!hotData.categories || hotData.categories.length === 0) {
        throw new Error("无法获取热点数据")
      }

      // 2. 构建分析提示词
      const prompt = buildAnalysisPromptFromAggregate(hotData.categories)

      // 3. 调用DeepSeek API进行流式分析
      await callDeepSeekAPI(prompt)

    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败")
      setIsAnalyzing(false)
    }
  }

  // 构建分析提示词 - 基于aggregate API数据
  const buildAnalysisPromptFromAggregate = (categories: any[]) => {
    let prompt = `你是SGA AI热点分析专家。请基于以下中国互联网热点数据进行深度分析：

## 数据源概览
`

    let totalSources = 0
    categories.forEach((category) => {
      totalSources += category.data.length
      prompt += `### ${category.name}分类 (${category.data.length}个数据源)
`
      category.data.forEach((source: any, sourceIndex: number) => {
        prompt += `#### ${sourceIndex + 1}. ${source.title}
`
        if (source.data && Array.isArray(source.data)) {
          source.data.slice(0, 5).forEach((item: any, itemIndex: number) => {
            prompt += `${itemIndex + 1}. ${item.title}${item.hot ? ` (热度: ${item.hot})` : ''}
`
          })
        }
        prompt += `
`
      })
    })

    prompt += `## 分析要求
基于以上 ${totalSources} 个数据源的热点数据，请从以下维度进行深度分析：

1. **🔥 热点共性分析** - 找出跨平台、跨领域的共同话题和趋势
2. **🌱 苗头趋势识别** - 识别正在兴起但还未完全爆发的话题
3. **📊 分类特征分析** - 各分类(科技、新媒体、实时新闻、财经)的独特特征
4. **🔄 传播规律分析** - 不同平台间的话题传播时差和特点
5. **🔮 未来趋势预测** - 基于当前数据预测未来1-3天的热点走向

## 输出格式
请用中文输出，使用emoji和结构化格式，让分析结果易读且有洞察力。重点关注：
- 数据背后的深层含义
- 社会文化趋势
- 商业机会和风险
- 公众情绪和关注点变化

开始你的专业分析：`

    return prompt
  }

  // 调用DeepSeek API进行流式分析
  const callDeepSeekAPI = async (prompt: string) => {
    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是SGA AI热点分析专家，擅长从海量热点数据中发现趋势、识别苗头、预测走向。你的分析深刻、准确、有前瞻性。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API错误: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("无法读取响应流")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsAnalyzing(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                setAnalysisText(prev => prev + content)
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } catch (err) {
      throw new Error(`API调用失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">SGA AI 热点趋势分析</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">实时智能分析35个数据源热点趋势</p>
                </div>
              </div>
              <Badge variant="outline" className="border-cyan-500/50 bg-cyan-500/10 text-cyan-300">
                <Sparkles className="h-3 w-3 mr-1" />
                AI驱动
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    DeepSeek AI 分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    开始 DeepSeek AI 分析
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 text-sm font-semibold">分析错误</span>
                </div>
                <div className="text-red-300 text-sm">{error}</div>
              </div>
            )}

            {analysisText && (
              <div className="bg-slate-900/50 rounded-lg p-6 border border-cyan-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-cyan-400 animate-pulse' : 'bg-green-400'}`}></div>
                  <span className={`text-sm font-mono ${isAnalyzing ? 'text-cyan-400' : 'text-green-400'}`}>
                    {isAnalyzing ? 'DeepSeek AI 正在分析...' : 'DeepSeek AI 分析完成'}
                  </span>
                </div>
                <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {analysisText}
                  {isAnalyzing && <span className="animate-pulse text-cyan-400">▋</span>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-cyan-500/20 backdrop-blur-sm">
                <div className="text-cyan-400 text-sm font-semibold mb-1">DeepSeek 模型</div>
                <div className="text-white text-lg font-bold">deepseek-chat</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/20 backdrop-blur-sm">
                <div className="text-purple-400 text-sm font-semibold mb-1">分析维度</div>
                <div className="text-white text-lg font-bold">5大维度</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-green-500/20 backdrop-blur-sm">
                <div className="text-green-400 text-sm font-semibold mb-1">数据源</div>
                <div className="text-white text-lg font-bold">35+ 平台</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
