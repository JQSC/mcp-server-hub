import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

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

// 无状态模式
// const transport = new StreamableHTTPServerTransport({
//   // 生成会话 ID 的函数。在无状态模式下设置为 undefined 。
//   sessionIdGenerator: undefined,
//   // 如果为真，则返回 JSON 响应而不是 SSE 流。默认为 false。
//   enableJsonResponse: true,
//   // 会话初始化事件的可选回调。
//   // onsessioninitialized: (sessionId)=> void
//   // 用于事件持久化和可恢复性支持的可选存储。
//   // eventStore
// });

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

// Create Express application
const app = express();
app.use(express.json());

// Store transports by session ID
const transports: Record<
  string,
  StreamableHTTPServerTransport | SSEServerTransport
> = {};

// Handle all MCP Streamable HTTP requests (GET, POST, DELETE) on a single endpoint
app.all("/mcp", async (req: Request, res: Response) => {
  console.log(`Received ${req.method} request to /mcp`);

  try {
    let transport: StreamableHTTPServerTransport;

    if (req.method) {
      transport = new StreamableHTTPServerTransport({
        // 生成会话 ID 的函数。在无状态模式下设置为 undefined 。
        sessionIdGenerator: undefined,
        // 如果为真，则返回 JSON 响应而不是 SSE 流。默认为 false。
        enableJsonResponse: true,
        // 会话初始化事件的可选回调。
        // onsessioninitialized: (sessionId)=> void
        // 用于事件持久化和可恢复性支持的可选存储。
        // eventStore
      });

      // Connect the transport to the MCP server
      await server.connect(transport);

      const clientCapabilities = server.getClientCapabilities();
      console.log("clientCapabilities", clientCapabilities);
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    // Handle the request with the transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backwards compatible MCP server listening on port ${PORT}`);
  console.log(`
==============================================
SUPPORTED TRANSPORT OPTIONS:

1. Streamable Http(Protocol version: 2025-03-26)
   Endpoint: /mcp
   Methods: GET, POST, DELETE
   Usage: 
     - Initialize with POST to /mcp
     - Establish SSE stream with GET to /mcp
     - Send requests with POST to /mcp
     - Terminate session with DELETE to /mcp

==============================================
`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  await server.close();
  console.log("Server shutdown complete");
  process.exit(0);
});
