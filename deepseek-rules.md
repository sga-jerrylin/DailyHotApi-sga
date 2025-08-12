# DeepSeek API 使用说明（OpenAI兼容）

DeepSeek API 兼容 OpenAI API 格式，通过配置可直接用 OpenAI SDK 或兼容软件访问。

---

## 1. 基本参数

| 参数名      | 说明/取值                         |
|-------------|-----------------------------------|
| base_url    | https://api.deepseek.com 或 https://api.deepseek.com/v1 |
| api_key     | 需申请 DeepSeek API Key           |

- `base_url` 可用 `/v1` 结尾，v1 与模型版本无关。
- `deepseek-chat` 模型指向 DeepSeek-V3-0324，需指定 `model='deepseek-chat'`。
- `deepseek-reasoner` 模型指向 DeepSeek-R1-0528，需指定 `model='deepseek-reasoner'`。

---

## 2. 对话 API 调用示例

### 2.1 curl 示例

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DeepSeek API Key>" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'
```

- `stream` 可设为 `true` 实现流式输出。

---

### 2.2 Python (OpenAI SDK)

> 需先安装 OpenAI SDK: `pip3 install openai`

```python
from openai import OpenAI

client = OpenAI(api_key="<DeepSeek API Key>", base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
    ],
    stream=False
)

print(response.choices[0].message.content)
```

---

### 2.3 Node.js (OpenAI SDK)

> 需先安装 OpenAI SDK: `npm install openai`

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: '<DeepSeek API Key>'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();
```

---

## 3. 规则说明（DeepSeek Rules）

- 使用 OpenAI 兼容 API 格式，支持主流 OpenAI SDK。
- 支持流式和非流式输出。
- 通过 `model` 参数切换不同 DeepSeek 模型。
- 推荐优先使用官方 API Key，注意保护密钥安全。
- 适用于所有支持 OpenAI API 的工具和平台。

---