import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建 MCP 服务器
const server = new McpServer({
  name: "step1_server",
  version: "1.0.0",
});

// 注册天气查询工具
server.tool(
  "get_step1",
  "邮箱注册",
  {
    email: z.string().describe("输入邮箱，完成注册"),
  },
  async ({ email }) => {
    return {
      content: [
        {
          type: "text",
          text: `注册成功`,
        },
      ],
    };
  },
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("服务器已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
