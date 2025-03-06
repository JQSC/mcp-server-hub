# 使用官方SDK的MCP客户端

这个目录包含了使用`@modelcontextprotocol/sdk`官方SDK的MCP客户端示例，展示了如何与MCP服务器进行交互。

## 目录

- [简介](#简介)
- [安装](#安装)
- [基本用法](#基本用法)
  - [创建客户端](#创建客户端)
  - [连接服务器](#连接服务器)
  - [资源访问](#资源访问)
  - [工具调用](#工具调用)
  - [提示模板](#提示模板)
- [高级功能](#高级功能)
  - [子进程服务器](#子进程服务器)
  - [HTTP SSE传输](#http-sse传输)
  - [采样支持](#采样支持)
- [示例](#示例)
- [参考](#参考)

## 简介

Model Context Protocol (MCP) 是一个开放协议，用于标准化AI模型与外部工具和数据源的交互。官方SDK提供了完整的MCP客户端实现，支持与任何符合MCP协议的服务器进行交互。

## 安装

```bash
npm install @modelcontextprotocol/sdk
```

## 基本用法

### 创建客户端

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 创建传输层
const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});

// 创建客户端
const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  }
);

// 连接到服务器
await client.connect(transport);
```

### 连接服务器

```typescript
// 使用标准输入输出连接
const stdioTransport = new StdioClientTransport({
  command: "node",
  args: ["server.js"]
});
await client.connect(stdioTransport);

// 或使用HTTP SSE连接（需要导入相应模块）
const httpSseTransport = new HttpSseClientTransport({
  url: "http://localhost:8080/mcp"
});
await client.connect(httpSseTransport);
```

### 资源访问

```typescript
// 列出可用资源
const resources = await client.listResources();
console.log('可用资源:', resources);

// 读取资源内容
const resourceContent = await client.readResource({
  uri: 'file:///path/to/file.txt'
});
console.log('资源内容:', resourceContent);
```

### 工具调用

```typescript
// 列出可用工具
const tools = await client.listTools();
console.log('可用工具:', tools);

// 调用工具
const result = await client.callTool({
  name: "calculator",
  arguments: {
    operation: "add",
    a: 5,
    b: 3
  }
});
console.log('工具执行结果:', result);
```

### 提示模板

```typescript
// 列出可用提示模板
const prompts = await client.listPrompts();
console.log('可用提示模板:', prompts);

// 获取提示模板
const prompt = await client.getPrompt({
  name: "example-prompt",
  arguments: {
    context: "示例上下文"
  }
});
console.log('提示模板结果:', prompt);
```

## 高级功能

### 子进程服务器

```typescript
import { spawn } from "child_process";
import * as path from "path";

// 启动MCP服务器子进程
const serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// 设置错误处理
serverProcess.on('error', (error) => {
  console.error('服务器进程错误:', error);
});

// 创建传输层
const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(__dirname, 'server.js')]
});

// 使用客户端...

// 关闭客户端和服务器
await client.close();
serverProcess.kill();
```

### HTTP SSE传输

```typescript
import { HttpSseClientTransport } from "@modelcontextprotocol/sdk/client/http-sse.js";

// 创建传输层
const transport = new HttpSseClientTransport({
  url: "http://localhost:8080/mcp"
});

// 创建客户端
const client = new Client(
  {
    name: "http-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  }
);

// 连接到服务器
await client.connect(transport);

// 使用客户端...

// 关闭客户端
await client.close();
```

### 采样支持

```typescript
// 创建客户端时启用采样支持
const client = new Client(
  {
    name: "sampling-client",
    version: "1.0.0"
  },
  {
    capabilities: {
      sampling: {}
    }
  }
);

// 设置采样处理器（如果支持）
if ("setSamplingHandler" in client) {
  (client as any).setSamplingHandler(async (request: any) => {
    console.log('收到采样请求:', request);
    // 这里应该调用实际的LLM API
    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: "这是一个采样响应示例"
          }
        }
      ]
    };
  });
}
```

## 示例

### 基本示例

请参考 `sdk-example.ts` 文件中的 `basicExample` 函数。

### 子进程服务器示例

请参考 `sdk-example.ts` 文件中的 `childProcessExample` 函数。

### HTTP SSE传输示例

请参考 `sdk-example.ts` 文件中的 `httpSseExample` 函数。

### 完整功能示例

请参考 `sdk-example.ts` 文件中的 `fullFeaturedExample` 函数。

## 参考

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [TypeScript SDK GitHub 仓库](https://github.com/modelcontextprotocol/typescript-sdk)
- [TypeScript SDK NPM 包](https://www.npmjs.com/package/@modelcontextprotocol/sdk) 