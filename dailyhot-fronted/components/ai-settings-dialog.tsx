"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, TestTube, Eye, EyeOff } from "lucide-react"

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

interface AISettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (settings: AISettings) => void
  currentSettings: AISettings
}

export function AISettingsDialog({ isOpen, onClose, onSave, currentSettings }: AISettingsDialogProps) {
  const [settings, setSettings] = useState<AISettings>(currentSettings)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    setSettings(currentSettings)
  }, [currentSettings])

  const handleSave = () => {
    // 保存到localStorage
    localStorage.setItem('ai-settings', JSON.stringify(settings))
    onSave(settings)
    onClose()
  }

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      if (settings.provider === 'deepseek') {
        // 测试DeepSeek连接
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.deepseek.apiKey}`,
          },
          body: JSON.stringify({
            model: settings.deepseek.model,
            messages: [
              { role: 'user', content: '测试连接' }
            ],
            max_tokens: 10,
          }),
        })

        if (response.ok) {
          setTestResult({ success: true, message: 'DeepSeek API 连接成功！' })
        } else {
          const error = await response.text()
          setTestResult({ success: false, message: `DeepSeek API 连接失败: ${error}` })
        }
      } else if (settings.provider === 'dify') {
        // 测试Dify连接
        const response = await fetch(`${settings.dify.baseUrl}/chat-messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.dify.apiKey}`,
          },
          body: JSON.stringify({
            inputs: {},
            query: '测试连接',
            response_mode: 'blocking',
            user: 'test-user',
          }),
        })

        if (response.ok) {
          setTestResult({ success: true, message: 'Dify API 连接成功！' })
        } else {
          const error = await response.text()
          setTestResult({ success: false, message: `Dify API 连接失败: ${error}` })
        }
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}` 
      })
    } finally {
      setTesting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-800/90 to-purple-900/20 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">AI 分析设置</CardTitle>
                <p className="text-gray-400 text-sm">配置您自己的大模型API参数</p>
                <div className="mt-2 p-2 rounded bg-yellow-900/20 border border-yellow-500/30">
                  <p className="text-yellow-300 text-xs">
                    🔒 您的API密钥仅存储在本地浏览器中，不会上传到服务器
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
            >
              关闭
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 提供商选择 */}
          <div className="space-y-3">
            <label className="text-white text-sm font-medium">AI 提供商</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={settings.provider === 'deepseek' ? 'default' : 'outline'}
                onClick={() => setSettings(prev => ({ ...prev, provider: 'deepseek' }))}
                className={settings.provider === 'deepseek' 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                }
              >
                DeepSeek
              </Button>
              <Button
                variant={settings.provider === 'dify' ? 'default' : 'outline'}
                onClick={() => setSettings(prev => ({ ...prev, provider: 'dify' }))}
                className={settings.provider === 'dify' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                }
              >
                Dify
              </Button>
            </div>
          </div>

          {/* DeepSeek 设置 */}
          {settings.provider === 'deepseek' && (
            <div className="space-y-4 p-4 rounded-lg bg-slate-900/30 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-300">
                  DeepSeek 配置
                </Badge>
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  获取API Key
                </a>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white text-sm font-medium block mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.deepseek.apiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        deepseek: { ...prev.deepseek, apiKey: e.target.value }
                      }))}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 pr-10 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium block mb-2">模型</label>
                  <select
                    value={settings.deepseek.model}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      deepseek: { ...prev.deepseek, model: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="deepseek-chat">deepseek-chat</option>
                    <option value="deepseek-reasoner">deepseek-reasoner</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dify 设置 */}
          {settings.provider === 'dify' && (
            <div className="space-y-4 p-4 rounded-lg bg-slate-900/30 border border-green-500/20">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-300">
                  Dify 配置
                </Badge>
                <a
                  href="https://docs.dify.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 underline"
                >
                  查看文档
                </a>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white text-sm font-medium block mb-2">Base URL</label>
                  <input
                    type="text"
                    value={settings.dify.baseUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      dify: { ...prev.dify, baseUrl: e.target.value }
                    }))}
                    placeholder="https://your-dify-instance.com/v1"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium block mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.dify.apiKey}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        dify: { ...prev.dify, apiKey: e.target.value }
                      }))}
                      placeholder="app-..."
                      className="w-full px-3 py-2 pr-10 bg-slate-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 测试结果 */}
          {testResult && (
            <div className={`p-3 rounded-lg border ${
              testResult.success 
                ? 'bg-green-900/20 border-green-500/30 text-green-300' 
                : 'bg-red-900/20 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${testResult.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{testResult.message}</span>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={testConnection}
              disabled={testing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
            >
              {testing ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  测试连接
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
