# MCP Client for JavaScript/TypeScript

这是一个基于JavaScript/TypeScript的Model Context Protocol (MCP) 客户端实现，用于与MCP服务器进行通信，访问资源和调用工具。

## 目录

- [简介](#简介)
- [安装](#安装)
- [基本用法](#基本用法)
  - [创建客户端](#创建客户端)
  - [连接服务器](#连接服务器)
  - [资源访问](#资源访问)
  - [工具调用](#工具调用)
- [高级功能](#高级功能)
  - [根资源管理](#根资源管理)
  - [事件监听](#事件监听)
  - [错误处理](#错误处理)
- [传输层](#传输层)
  - [标准输入输出传输](#标准输入输出传输)
  - [HTTP SSE传输](#http-sse传输)
- [示例](#示例)
- [参考](#参考)

## 简介

Model Context Protocol (MCP) 是一个开放协议，用于标准化AI模型与外部工具和数据源的交互。MCP Client是协议的客户端实现，负责与MCP服务器建立连接并进行通信。

主要功能包括：

- 协议版本兼容性协商
- 工具发现和执行
- 资源管理和访问
- 根资源管理
- 事件监听和通知处理

## 安装

```bash
npm install mcp-client
```

## 基本用法

### 创建客户端

```typescript
import { McpClient, StdioTransport } from 'mcp-client';

// 创建传输层
const transport = new StdioTransport();

// 创建客户端
const client = new McpClient(
  { name: 'my-mcp-client', version: '1.0.0' },
  { roots: true, sampling: false }
);

// 连接到服务器
await client.connect(transport);
```

### 连接服务器

```typescript
// 使用标准输入输出连接
const stdioTransport = new StdioTransport();
await client.connect(stdioTransport);

// 或使用HTTP SSE连接
const sseTransport = new HttpSseTransport('http://localhost:8080/mcp');
await client.connect(sseTransport);
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
  name: 'calculator',
  parameters: {
    operation: 'add',
    a: 5,
    b: 3
  }
});
console.log('工具执行结果:', result);
```

## 高级功能

### 根资源管理

```typescript
// 添加根资源
await client.addRoot({
  uri: 'file:///path/to/project',
  description: '项目根目录'
});

// 列出根资源
const roots = await client.listRoots();
console.log('根资源:', roots);

// 移除根资源
await client.removeRoot('file:///path/to/project');
```

### 事件监听

```typescript
// 监听初始化事件
client.on('initialized', (response) => {
  console.log('客户端已初始化:', response);
});

// 监听资源变更通知
client.on('resourcesChanged', (params) => {
  console.log('资源列表已变更:', params);
});

// 监听工具变更通知
client.on('toolsChanged', (params) => {
  console.log('工具列表已变更:', params);
});
```

### 错误处理

```typescript
try {
  await client.callTool({
    name: 'non_existent_tool',
    parameters: {}
  });
} catch (error) {
  console.error('工具调用错误:', error.message);
}
```

## 传输层

### 标准输入输出传输

适用于与子进程通信的场景。

```typescript
const transport = new StdioTransport();
await client.connect(transport);
```

### HTTP SSE传输

适用于与远程服务器通信的场景。

```typescript
const transport = new HttpSseTransport('http://localhost:8080/mcp');
await client.connect(transport);
```

## 示例

### 基本示例

```typescript
import { McpClient, StdioTransport } from 'mcp-client';

async function main() {
  // 创建传输层
  const transport = new StdioTransport();

  // 创建客户端
  const client = new McpClient(
    { name: 'example-client', version: '1.0.0' }
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log('已连接到MCP服务器');

    // 列出可用资源
    const resources = await client.listResources();
    console.log('可用资源:', resources);

    // 列出可用工具
    const tools = await client.listTools();
    console.log('可用工具:', tools);

    // 关闭客户端
    await client.closeGracefully();
    console.log('客户端已关闭');
  } catch (error) {
    console.error('MCP客户端错误:', error);
  }
}

main();
```

### 高级示例

请参考 `example.ts` 和 `advanced-example.ts` 文件中的更多示例。

## 参考

- [Model Context Protocol 官方文档](https://modelcontextprotocol.io/)
- [Java SDK 文档](https://modelcontextprotocol.io/sdk/java/mcp-client)
- [TypeScript SDK GitHub 仓库](https://github.com/modelcontextprotocol/typescript-sdk) 