#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

import express from "express";

const server = new Server(
  {
    name: "my-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        list: true,
        call: true,
      },
      prompts: {},
      logging: {},
    },
    instructions: "Server usage instructions",
  },
);

const mcp_demo_tool = {
  name: "mcp_demo_tool",
  description: "mcp demo tool",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "query",
      },
    },
    required: ["query"],
  },
};

const handleMcpDemoTool = async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("未提供调用参数");
  }

  const { query } = args;

  return {
    content: [{ type: "text", text: `收到工具调用请求: ${query}` }],
    isError: false,
  };
};

server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [mcp_demo_tool],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const startTime = Date.now();
  const { name, arguments: args } = request.params;
  // 记录请求日志
  server.sendLoggingMessage({
    level: "info",
    data: `[${new Date().toISOString()}] 收到工具调用请求: ${name}`,
  });
  try {
    switch (name) {
      case "mcp_demo_tool":
        return handleMcpDemoTool(request);
      default:
        return {
          content: [{ type: "text", text: `未知工具: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // 记录错误日志
    server.sendLoggingMessage({
      level: "error",
      data: {
        message: `请求失败: ${error instanceof Error ? error.message : String(error)}`,
        tool: name,
        arguments: args,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    });
    return {
      content: [
        {
          type: "text",
          text: `错误: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  } finally {
    // 记录请求完成日志
    server.sendLoggingMessage({
      level: "info",
      data: `请求处理完成，耗时 ${Date.now() - startTime}ms`,
    });
  }
});

// 启动服务器
async function runServer() {
  try {
    console.error("正在初始化 demo 服务...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // 发送服务器启动成功日志
    server.sendLoggingMessage({
      level: "info",
      data: "服务初始化成功",
    });

    const clientCapabilities = await server.getClientCapabilities();

    console.error(
      "clientCapabilities",
      clientCapabilities,
      server.getClientVersion(),
    );

    console.error("demo 服务已启动，正在运行中...");
  } catch (error) {
    console.error("服务器启动失败:", error);
    process.exit(1);
  }
}
runServer().catch((error) => {
  console.error("服务器运行出错:", error);
  process.exit(1);
});
