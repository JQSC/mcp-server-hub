import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import {
  CallToolResult,
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";

const server = new McpServer(
  {
    name: "backwards-compatible-server",
    version: "1.0.0",
  },
  { capabilities: { logging: {} } },
);

// Register a simple tool that sends notifications over time
server.tool(
  "start-notification-stream",
  "Starts sending periodic notifications for testing resumability",
  {
    interval: z
      .number()
      .describe("Interval in milliseconds between notifications")
      .default(100),
    count: z
      .number()
      .describe("Number of notifications to send (0 for 100)")
      .default(50),
  },
  async (
    { interval, count },
    { sendNotification },
  ): Promise<CallToolResult> => {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    let counter = 0;

    while (count === 0 || counter < count) {
      counter++;
      try {
        await sendNotification({
          method: "notifications/message",
          params: {
            level: "info",
            data: `Periodic notification #${counter} at ${new Date().toISOString()}`,
          },
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
      // Wait for the specified interval
      await sleep(interval);
    }

    return {
      content: [
        {
          type: "text",
          text: `Started sending periodic notifications every ${interval}ms`,
        },
      ],
    };
  },
);

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
