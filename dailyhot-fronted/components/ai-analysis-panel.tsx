"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Brain, Zap, Settings } from "lucide-react"
import { AISettingsDialog } from "./ai-settings-dialog"

interface AISettings {
  provider: 'deepseek' | 'dify'
  deepseek: {
    apiKey: string
    model: string
  }
  dify: {
    baseUrl: string
    apiKey: string
  }
}

export function AIAnalysisPanel() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisText, setAnalysisText] = useState("")
  const [error, setError] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    provider: 'deepseek',
    deepseek: {
      apiKey: '',
      model: 'deepseek-chat'
    },
    dify: {
      baseUrl: '',
      apiKey: ''
    }
  })

  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('ai-settings')
    if (savedSettings) {
      try {
        setAiSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to load AI settings:', error)
      }
    }
  }, [])

  // 获取热点数据并调用AI分析
  const startAnalysis = async (analysisType: string = 'all') => {
    // 检查API配置
    if (aiSettings.provider === 'deepseek' && !aiSettings.deepseek.apiKey) {
      setError("请先在设置中配置DeepSeek API Key")
      return
    }
    if (aiSettings.provider === 'dify' && (!aiSettings.dify.baseUrl || !aiSettings.dify.apiKey)) {
      setError("请先在设置中配置Dify Base URL和API Key")
      return
    }

    setIsAnalyzing(true)
    setAnalysisText("")
    setError("")

    try {
      // 1. 获取热点数据 - 根据分析类型选择不同的API
      const apiBase = process.env.NODE_ENV === 'development' ? 'http://localhost:6688' : window.location.origin
      let apiUrl = `${apiBase}/aggregate?group=source&per=5`

      // 根据分析类型调整API参数
      if (analysisType === 'tech') {
        apiUrl = `${apiBase}/aggregate?group=category&category=tech&per=10`
      } else if (analysisType === 'finance') {
        apiUrl = `${apiBase}/aggregate?group=category&category=finance&per=10`
      } else if (analysisType === 'news') {
        apiUrl = `${apiBase}/aggregate?group=category&category=news&per=10`
      } else if (analysisType === 'media') {
        apiUrl = `${apiBase}/aggregate?group=category&category=media&per=10`
      }

      const response = await fetch(apiUrl)
      const hotData = await response.json()

      if (!hotData.categories || hotData.categories.length === 0) {
        throw new Error("无法获取热点数据")
      }

      // 2. 构建分析提示词
      const prompt = buildAnalysisPromptFromAggregate(hotData.categories, analysisType)

      // 3. 调用AI API进行流式分析
      await callAIAPI(prompt)

    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败")
      setIsAnalyzing(false)
    }
  }

  // 构建分析提示词 - 基于aggregate API数据
  const buildAnalysisPromptFromAggregate = (categories: any[], analysisType: string = 'all') => {
    const analysisTypeMap = {
      'all': '全网热点',
      'tech': '科技新闻',
      'finance': '财经',
      'news': '实时新闻',
      'media': '新媒体'
    }

    const analysisTypeName = analysisTypeMap[analysisType as keyof typeof analysisTypeMap] || '全网热点'

    let prompt = `你是SGA AI热点分析专家。请基于以下中国互联网${analysisTypeName}数据进行深度分析：

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

    // 根据分析类型调整分析要求
    let analysisRequirements = ''
    if (analysisType === 'tech') {
      analysisRequirements = `
🔥 科技热点分析 - 识别当前最热门的科技话题和技术趋势
🚀 技术创新识别 - 发现新兴技术、产品发布、行业变革
📱 产品动态分析 - 分析科技公司产品更新、市场策略
🔬 行业趋势预测 - 基于数据预测科技行业发展方向
💡 投资机会洞察 - 识别科技领域的投资热点和商业机会`
    } else if (analysisType === 'finance') {
      analysisRequirements = `
💰 财经热点分析 - 识别当前最受关注的财经话题
📈 市场趋势分析 - 分析股市、汇市、商品市场动向
🏦 政策影响评估 - 分析财经政策对市场的影响
💼 企业动态追踪 - 关注重要企业的财务表现和战略调整
🔮 经济走势预测 - 基于数据预测经济发展趋势`
    } else if (analysisType === 'news') {
      analysisRequirements = `
📰 实时新闻分析 - 识别当前最重要的新闻事件
🌍 社会热点追踪 - 分析社会关注度高的事件和话题
🔥 舆情趋势分析 - 评估公众对重要事件的反应和情绪
⚡ 突发事件监控 - 识别可能产生重大影响的突发新闻
📊 传播影响评估 - 分析新闻事件的传播范围和社会影响`
    } else if (analysisType === 'media') {
      analysisRequirements = `
📱 新媒体热点分析 - 识别社交媒体和内容平台的热门话题
🎬 内容趋势追踪 - 分析短视频、直播、社区讨论的流行趋势
👥 用户行为洞察 - 分析用户互动模式和兴趣偏好变化
🔥 病毒传播分析 - 识别具有病毒传播潜力的内容和话题
📈 平台生态观察 - 分析不同新媒体平台的内容生态和用户特征`
    } else {
      analysisRequirements = `
🔥 热点共性分析 - 找出跨平台、跨领域的共同话题和趋势
🌱 苗头趋势识别 - 识别正在兴起但还未完全爆发的话题
📊 分类特征分析 - 各分类(科技、新媒体、实时新闻、财经)的独特特征
🔄 传播规律分析 - 不同平台间的话题传播时差和特点
🔮 未来趋势预测 - 基于当前数据预测未来1-3天的热点走向`
    }

    prompt += `## 分析要求
基于以上 ${totalSources} 个数据源的${analysisTypeName}数据，请从以下维度进行深度分析：
${analysisRequirements}

## 输出要求
⚠️ 重要：请严格按照以下格式输出，不要使用markdown语法（如**、##、-等）：

1. 使用丰富的emoji表情符号增强可读性
2. 用简洁的段落和换行组织内容
3. 避免使用任何markdown格式标记
4. 重点关注数据背后的深层含义、社会文化趋势、商业机会和风险、公众情绪变化
5. 语言要生动有趣，适合在聊天界面显示

现在开始你的${analysisTypeName}专业分析：`

    return prompt
  }

  // 调用AI API进行流式分析
  const callAIAPI = async (prompt: string) => {
    try {
      if (aiSettings.provider === 'deepseek') {
        await callDeepSeekAPI(prompt)
      } else if (aiSettings.provider === 'dify') {
        await callDifyAPI(prompt)
      }
    } catch (error) {
      throw error
    }
  }

  // 调用DeepSeek API进行流式分析
  const callDeepSeekAPI = async (prompt: string) => {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.deepseek.apiKey}`,
        },
        body: JSON.stringify({
          model: aiSettings.deepseek.model,
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

      await processStreamResponse(response)
    } catch (err) {
      throw new Error(`DeepSeek API调用失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  // 调用Dify API进行流式分析
  const callDifyAPI = async (prompt: string) => {
    try {
      const response = await fetch(`${aiSettings.dify.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.dify.apiKey}`,
        },
        body: JSON.stringify({
          inputs: {},
          query: prompt,
          response_mode: 'streaming',
          user: 'sga-user',
        }),
      })

      if (!response.ok) {
        throw new Error(`Dify API错误: ${response.status}`)
      }

      await processDifyStreamResponse(response)
    } catch (err) {
      throw new Error(`Dify API调用失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  // 处理DeepSeek流式响应
  const processStreamResponse = async (response: Response) => {
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
          } catch {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    }
  }

  // 处理Dify流式响应
  const processDifyStreamResponse = async (response: Response) => {
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

          try {
            const parsed = JSON.parse(data)
            if (parsed.event === 'message' && parsed.answer) {
              setAnalysisText(prev => prev + parsed.answer)
            } else if (parsed.event === 'message_end') {
              setIsAnalyzing(false)
              return
            }
          } catch {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
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
                  <p className="text-gray-400 text-sm mt-1">实时智能分析78个数据源热点趋势</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-cyan-500/50 bg-cyan-500/10 text-cyan-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI驱动
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800/50 h-8 px-3"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  设置
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                onClick={() => startAnalysis('all')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    全网分析
                  </>
                )}
              </Button>

              <Button
                onClick={() => startAnalysis('tech')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    科技新闻分析
                  </>
                )}
              </Button>

              <Button
                onClick={() => startAnalysis('finance')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    财经分析
                  </>
                )}
              </Button>

              <Button
                onClick={() => startAnalysis('news')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    实时新闻分析
                  </>
                )}
              </Button>

              <Button
                onClick={() => startAnalysis('media')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    新媒体分析
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


          </CardContent>
        </Card>
      </div>

      {/* AI设置对话框 */}
      <AISettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={setAiSettings}
        currentSettings={aiSettings}
      />
    </div>
  )
}
