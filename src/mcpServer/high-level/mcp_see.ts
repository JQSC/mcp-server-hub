import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "see_server",
  version: "1.0.0",
});

const app = express();

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  console.log("--> SSE connection....", transport.sessionId);
  await server.connect(transport);

  const _onMsg = transport.onmessage; // original hook
  const _onClose = transport.onclose;
  const _onErr = transport.onerror;

  transport.onmessage = (msg) => {
    console.log("--> Received message (onmessage)", transport.sessionId, msg);
    _onMsg?.(msg);
  };

  transport.onclose = () => {
    console.log("--> SSE connection closed", transport.sessionId);
    _onClose?.();
  };

  transport.onerror = (err) => {
    console.log("--> SSE connection error", transport.sessionId, err);
    _onErr?.(err);
  };
});

app.post("/messages", async (req, res) => {
  console.log("--> Received message (post)", transport?.sessionId);
  await transport?.handlePostMessage(req, res);
  console.log("<--", res.statusCode, res.statusMessage);
});

// 处理异常
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  transport?.close();
});

app.listen(3000);
