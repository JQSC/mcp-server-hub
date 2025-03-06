import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { z } from "zod";

const server = new McpServer({
  name: "resource-server",
  version: "1.0.0",
});

// 列出所有资源
server.tool(
  "available-files",
  `一个可用文件和资源的列表。
  如果用户请求类似‘有哪些组件’或‘文档’的内容，使用这个工具来确定所指的资源。
  这个工具会以 Markdown 表格的形式返回: 资源 URI、名称、大小、最后修改时间以及MIME 类型`,
  {
    query: z.string().describe("要查询的文件内容"),
  },
  async ({ query }) => {
    return {
      content: [
        {
          type: "text",
          text: "可用资源列表",
        },
      ],
    };
  },
);

// Static resource
server.resource(
  "file",
  "file:///logs/app.log",
  {
    mimeType: "text/plain",
    description: "记录了应用的日志",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: "App configuration here",
        mimeType: "text/plain",
        description: "App configuration",
      },
    ],
  }),
);

// Dynamic resource with parameters
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Profile data for user ${userId}`,
      },
    ],
  }),
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("资源服务器已在 stdio 上运行");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
