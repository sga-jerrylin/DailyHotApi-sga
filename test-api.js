// 简单的API测试脚本
const testAPI = async () => {
  try {
    console.log('🔍 测试API连接...')
    
    // 测试基础API
    const response = await fetch('http://localhost:6688/all')
    const data = await response.json()
    
    console.log('✅ API连接成功!')
    console.log(`📊 总共 ${data.count} 个数据源`)
    console.log(`🔗 可用路由: ${data.routes.slice(0, 5).map(r => r.name).join(', ')}...`)
    
    // 测试聚合API
    console.log('\n🔍 测试聚合API...')
    const aggResponse = await fetch('http://localhost:6688/aggregate?category=tech&per=3')
    const aggData = await aggResponse.json()
    
    if (aggData.categories && aggData.categories.length > 0) {
      console.log('✅ 聚合API工作正常!')
      console.log(`📈 科技分类数据: ${aggData.categories[0].total} 条`)
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message)
  }
}

testAPI()
