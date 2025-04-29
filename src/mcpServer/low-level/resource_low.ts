#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * @description 模拟资源数据
 * @type {Record<string, {name: string, content: string, mimeType: string}>}
 */
const resourceData: Record<
  string,
  { name: string; content: string; mimeType: string }
> = {
  "docs/api-reference.md": {
    name: "API 参考文档",
    content: `# API 参考文档

## 用户 API
- GET /api/users - 获取所有用户
- GET /api/users/:id - 获取指定用户
- POST /api/users - 创建新用户
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户

## 产品 API
- GET /api/products - 获取所有产品
- GET /api/products/:id - 获取指定产品
- POST /api/products - 创建新产品
- PUT /api/products/:id - 更新产品
- DELETE /api/products/:id - 删除产品
`,
    mimeType: "text/markdown",
  },
  "docs/getting-started.md": {
    name: "入门指南",
    content: `# 入门指南

## 安装
\`\`\`bash
npm install my-awesome-package
\`\`\`

## 基本用法
\`\`\`javascript
import { createApp } from 'my-awesome-package';

const app = createApp({
  // 配置选项
});

app.start();
\`\`\`

## 配置选项
- \`port\`: 服务器端口号 (默认: 3000)
- \`database\`: 数据库连接字符串
- \`logLevel\`: 日志级别 ('debug', 'info', 'warn', 'error')
`,
    mimeType: "text/markdown",
  },
  "logs/app.log": {
    name: "应用日志",
    content: `[2023-10-01 08:00:15] [INFO] 服务器启动在端口 3000
[2023-10-01 08:01:23] [INFO] 用户 user123 登录成功
[2023-10-01 08:05:47] [ERROR] 数据库连接失败: 连接超时
[2023-10-01 08:06:12] [INFO] 数据库连接恢复
[2023-10-01 08:10:45] [WARN] 高内存使用率: 85%
[2023-10-01 08:15:30] [INFO] 执行定时任务: 清理临时文件
[2023-10-01 08:20:11] [ERROR] API 请求失败: /api/users/456 - 用户不存在
[2023-10-01 08:25:40] [INFO] 系统备份完成
`,
    mimeType: "text/plain",
  },
};

/**
 * @description 读取日志文件内容
 * @returns {Promise<string>} 日志文件内容
 */
async function readLogFile(): Promise<string> {
  // 这里模拟从文件读取日志，实际项目中可以替换为真实的文件读取逻辑
  return resourceData["logs/app.log"].content;
}

const server = new Server(
  {
    name: "resource-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        list: true,
        call: true,
      },
    },
  },
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // 可连接数据库，获取资源列表
  return {
    resources: [
      {
        uri: "file:///logs/app.log",
        name: "日志数据",
        mimeType: "text/plain",
        description: "日志数据",
      },
      {
        uri: "file:///docs/api-reference.md",
        name: "API 参考文档",
        mimeType: "text/markdown",
        description: "组件API 参考文档",
      },
      {
        uri: "file:///docs/getting-started.md",
        name: "入门指南",
        mimeType: "text/markdown",
        description: "组件入门指南",
      },
    ],
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  // if (uri === "file:///logs/app.log") {
  // }
  const logContents = await readLogFile();
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: logContents,
      },
    ],
  };

  throw new Error("Resource not found");
});

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    const capabilities = await server.getClientCapabilities();
    console.log("--> capabilities", capabilities);
    console.error("Resource MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.error("SIGINT received, shutting down...");
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
