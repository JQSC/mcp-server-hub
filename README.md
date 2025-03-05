# MCP 服务工具

这是一个 MCP（Model Context Protocol）服务工具集合，用于调用各种 AI 服务 API。

## 功能特点

### Hugging Face MCP 服务

- 支持文本生成、分类、问答、摘要等 NLP 任务
- 支持图像分类、分割、图像到文本等 CV 任务
- 支持语音识别等语音处理任务
- 支持零样本学习分类任务

### Dify MCP 服务 (新增)

- 支持对话型应用 API 调用
- 支持文本生成型应用 API 调用
- 支持对话历史管理
- 支持对话列表查询和管理

## 安装

首先，安装必要的依赖：

```bash
npm install
```

## 配置

在项目根目录创建 `.env` 文件，并添加以下配置：

```
# Hugging Face API 密钥（如果使用 Hugging Face 服务）
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Dify API 配置（如果使用 Dify 服务）
DIFY_API_KEY=your_dify_api_key
DIFY_BASE_URL=your_dify_base_url
```

## 使用方法

### 启动 Dify MCP 服务

```bash
npm run start:dify
```

### Hugging Face MCP 服务

```typescript
import { createHuggingFaceMcpTool } from './src/hf_mcp';

// 创建工具实例
const hfTool = createHuggingFaceMcpTool('your_huggingface_api_key');

// 使用工具调用模型
async function example() {
  const result = await hfTool.textGeneration(
    'gpt2',
    '人工智能正在改变世界，',
    { max_new_tokens: 50 }
  );
  console.log(result);
}

example();
```

### Dify MCP 服务功能

Dify MCP 服务提供以下工具：

1. **chat_with_dify**：向 Dify 发送聊天消息并获取回复
   - 参数：
     - `base_url`：Dify API 基础 URL
     - `api_key`：Dify API 密钥
     - `query`：用户查询内容
     - `inputs`：输入参数（可选）
     - `conversation_id`：对话 ID（可选，用于继续对话）
     - `user`：用户标识（可选）

2. **generate_with_dify**：使用 Dify 生成文本内容
   - 参数：
     - `base_url`：Dify API 基础 URL
     - `api_key`：Dify API 密钥
     - `inputs`：输入参数
     - `user`：用户标识（可选）

3. **get_conversation_history**：获取 Dify 对话历史记录
   - 参数：
     - `base_url`：Dify API 基础 URL
     - `api_key`：Dify API 密钥
     - `conversation_id`：对话 ID
     - `user`：用户标识（可选）

4. **list_conversations**：获取 Dify 对话列表
   - 参数：
     - `base_url`：Dify API 基础 URL
     - `api_key`：Dify API 密钥
     - `user`：用户标识（可选）
     - `first`：返回结果数量（可选，默认 20）

5. **rename_conversation**：重命名 Dify 对话
   - 参数：
     - `base_url`：Dify API 基础 URL
     - `api_key`：Dify API 密钥
     - `conversation_id`：对话 ID
     - `name`：新对话名称
     - `user`：用户标识（可选）

## Dify API 使用示例

### 使用 Dify 聊天功能

```javascript
// 向 Dify 发送聊天消息
const response = await difyClient.chatMessage(
  "你好，请介绍一下自己", // 查询内容
  {}, // 输入参数
  "conversation_id_123", // 对话 ID（可选）
  "user_123" // 用户标识（可选）
);

console.log(response.answer); // 输出 Dify 的回复
```

### 使用 Dify 文本生成功能

```javascript
// 使用 Dify 生成文本
const response = await difyClient.completionMessage(
  { prompt: "写一篇关于人工智能的短文" }, // 输入参数
  "user_123" // 用户标识（可选）
);

console.log(response.answer); // 输出生成的文本
```

## Hugging Face 支持的功能

1. **文本生成**
   ```typescript
   await hfTool.textGeneration('gpt2', '输入文本', { max_new_tokens: 50 });
   ```

2. **文本分类**
   ```typescript
   await hfTool.textClassification('distilbert-base-uncased-finetuned-sst-2-english', '这是一段文本');
   ```

3. **问答**
   ```typescript
   await hfTool.questionAnswering('deepset/roberta-base-squad2', {
     question: '问题?',
     context: '包含答案的上下文'
   });
   ```

4. **填充遮罩**
   ```typescript
   await hfTool.fillMask('bert-base-uncased', 'Paris is the [MASK] of France.');
   ```

5. **摘要生成**
   ```typescript
   await hfTool.summarization('facebook/bart-large-cnn', '长文本内容');
   ```

6. **文本翻译**
   ```typescript
   await hfTool.translation('t5-base', '要翻译的文本');
   ```

7. **图像分类**
   ```typescript
   await hfTool.imageClassification('google/vit-base-patch16-224', imageBlob);
   ```

8. **图像分割**
   ```typescript
   await hfTool.imageSegmentation('facebook/detr-resnet-50-panoptic', imageBlob);
   ```

9. **图像到文本**
   ```typescript
   await hfTool.imageToText('nlpconnect/vit-gpt2-image-captioning', imageBlob);
   ```

10. **零样本图像分类**
    ```typescript
    await hfTool.zeroShotImageClassification(
      'openai/clip-vit-base-patch32',
      imageBlob,
      ['猫', '狗', '鸟']
    );
    ```

11. **零样本文本分类**
    ```typescript
    await hfTool.zeroShotClassification(
      'facebook/bart-large-mnli',
      '这是一段文本',
      ['类别1', '类别2', '类别3'],
      false
    );
    ```

12. **语音识别**
    ```typescript
    await hfTool.automaticSpeechRecognition('facebook/wav2vec2-base-960h', audioBlob);
    ```

## 注意事项

- 使用前需要先获取相应的 API 密钥
- 请注意 API 调用限制和费用
- Dify API 的具体参数和返回值可能因应用配置不同而有所差异

## 许可证

MIT 