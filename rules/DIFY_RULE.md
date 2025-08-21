# DIFY 对话型应用 API 使用说明

## 基础信息

- **基础 URL**: `http://192.144.232.60/v1`
- **鉴权**: 所有 API 请求需在 HTTP Header 中添加
  ```
  Authorization: Bearer {API_KEY}
  ```
  强烈建议仅在后端存储和使用 API-Key，避免泄露。

---

## 对话型应用简介

对话应用支持会话持久化，可将之前的聊天记录作为上下文进行回答，适用于聊天/客服 AI 等场景。

---

## 1. 发送对话消息

### POST `/chat-messages`

**功能**：发送用户消息，支持会话持久化和多模态（图片）输入。

#### 请求参数（JSON）

| 字段                | 类型           | 说明                                                                                  |
|---------------------|----------------|---------------------------------------------------------------------------------------|
| query               | string         | 用户输入/提问内容                                                                     |
| inputs              | object         | 允许传入 App 定义的各变量值，包含多组键值对，默认 `{}`                                 |
| response_mode       | string         | `streaming`（推荐，流式SSE）或 `blocking`（阻塞，完整返回）。Agent模式下不允许blocking。|
| user                | string         | 用户唯一标识，需保证在应用内唯一，便于检索、统计                                       |
| conversation_id     | string         | （选填）会话ID，继续历史会话需传，基于之前聊天记录继续对话                             |
| files               | array[object]  | 上传的文件，见下表                                                                    |
| auto_generate_name  | bool           | （选填）自动生成标题，默认 true。为 false 时可异步生成标题                            |
| trace_id            | string         | （选填）链路追踪ID。优先级：Header > Query > Body。未指定时系统自动生成               |

**files 子对象说明**：

| 字段            | 类型    | 说明                                   |
|-----------------|---------|----------------------------------------|
| type            | string  | 支持类型：图片 image（目前仅支持图片）  |
| transfer_method | string  | `remote_url`（图片地址）或 `local_file`（上传文件）|
| url             | string  | 图片地址（仅当 transfer_method=remote_url 时）|
| upload_file_id  | string  | 上传文件ID（仅当 transfer_method=local_file 时）|

#### 请求示例

```bash
curl -X POST 'http://192.144.232.60/v1/chat-messages' \
  --header 'Authorization: Bearer {api_key}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "inputs": {},
    "query": "What are the specs of the iPhone 13 Pro Max?",
    "response_mode": "streaming",
    "conversation_id": "",
    "user": "abc-123",
    "files": [
      {
        "type": "image",
        "transfer_method": "remote_url",
        "url": "https://cloud.dify.ai/logo/logo-site.png"
      }
    ]
  }'
```

#### 响应

- `blocking` 模式：返回完整 JSON（ChatCompletionResponse）
- `streaming` 模式：返回 SSE 流（ChunkChatCompletionResponse）

##### ChatCompletionResponse 字段

| 字段                  | 类型      | 说明                       |
|-----------------------|-----------|----------------------------|
| event                 | string    | 事件类型，固定为 message   |
| task_id               | string    | 任务 ID                    |
| id                    | string    | 唯一ID                     |
| message_id            | string    | 消息唯一 ID                |
| conversation_id       | string    | 会话 ID                    |
| mode                  | string    | App 模式，固定为 chat      |
| answer                | string    | 完整回复内容               |
| metadata              | object    | 元数据                     |
| usage                 | object    | 模型用量信息               |
| retriever_resources   | array     | 引用和归属分段列表         |
| created_at            | int       | 消息创建时间戳             |

##### ChunkChatCompletionResponse 事件类型

- `message`：LLM 文本块
- `agent_message`：Agent模式文本块
- `agent_thought`：Agent思考/工具调用
- `message_file`：新文件（如图片）
- `message_end`：消息结束
- `tts_message`/`tts_message_end`：TTS 音频流
- `message_replace`：内容替换（如命中审查）
- `error`：异常
- `ping`：心跳

**流式块字段说明**（部分事件）：

- `message`/`agent_message`：task_id, message_id, conversation_id, answer, created_at
- `agent_thought`：id, task_id, message_id, position, thought, observation, tool, tool_input, created_at, message_files, conversation_id
- `message_file`：id, type, belongs_to, url, conversation_id
- `message_end`：task_id, message_id, conversation_id, metadata, usage, retriever_resources

##### 错误码举例

- 404 对话不存在
- 400 invalid_param 参数异常
- 400 app_unavailable App 配置不可用
- 400 provider_not_initialize 无可用模型凭据配置
- 400 provider_quota_exceeded 模型额度不足
- 400 model_currently_not_support 当前模型不可用
- 400 completion_request_error 文本生成失败
- 500 服务内部异常

---

## 2. 上传文件

### POST `/files/upload`

**功能**：上传图片文件，供多模态对话使用。支持 png, jpg, jpeg, webp, gif 格式。

#### 请求参数（multipart/form-data）

| 字段 | 类型 | 说明 |
|------|------|------|
| file | file | 要上传的图片文件（png, jpg, jpeg, webp, gif）|
| user | string | 用户唯一标识，需与发送消息接口一致 |

#### 请求示例

```bash
curl -X POST 'http://192.144.232.60/v1/files/upload' \
  --header 'Authorization: Bearer {api_key}' \
  --form 'file=@localfile;type=image/png' \
  --form 'user=abc-123'
```

#### 响应

```json
{
  "id": "72fa9618-8f89-4a37-9b33-7e1178a24a67",
  "name": "example.png",
  "size": 1024,
  "extension": "png",
  "mime_type": "image/png",
  "created_by": 123,
  "created_at": 1577836800
}
```

**错误码举例**：

- 400 no_file_uploaded 必须提供文件
- 400 too_many_files 只接受一个文件
- 400 unsupported_preview 不支持预览
- 400 unsupported_estimate 不支持估算
- 413 file_too_large 文件太大
- 415 unsupported_file_type 不支持的扩展名
- 503 s3_connection_failed 无法连接到 S3
- 503 s3_permission_denied 无权限上传
- 503 s3_file_too_large 文件超出 S3 限制

---

## 3. 停止响应

### POST `/chat-messages/:task_id/stop`

**功能**：停止流式响应，仅支持流式模式。

#### 请求参数

- Path: `task_id`（任务ID，流式返回中获取）
- Body: `{ "user": "abc-123" }`（用户唯一标识，需与发送消息接口一致）

#### 响应

```json
{ "result": "success" }
```

---

## 4. 消息反馈（点赞/点踩）

### POST `/messages/:message_id/feedbacks`

**功能**：对消息进行点赞、点踩或撤销。

#### 请求参数

- Path: `message_id`
- Body:
  - `rating`: `like`/`dislike`/`null`
  - `user`: 用户唯一标识
  - `content`: 反馈内容

#### 响应

```json
{ "result": "success" }
```

---

## 5. 获取 APP 消息反馈

### GET `/app/feedbacks`

**功能**：分页获取 APP 的消息点赞和反馈。

#### 查询参数

- `page`（默认1）
- `limit`（默认20）

#### 响应

```json
{
  "data": [
    {
      "id": "...",
      "app_id": "...",
      "conversation_id": "...",
      "message_id": "...",
      "rating": "like",
      "content": "...",
      "from_source": "user",
      "from_end_user_id": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

## 其他说明

- 所有接口均需带上 `Authorization` 头部。
- 用户标识 `user` 必须在应用内唯一。
- 推荐使用 `streaming` 流式模式提升响应体验。
- 上传的文件仅供当前终端用户使用。
- trace_id 支持 Header（X-Trace-Id）、Query、Body 三种方式传递，优先级依次为 Header > Query > Body。

---
