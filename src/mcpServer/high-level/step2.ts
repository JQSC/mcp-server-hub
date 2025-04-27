import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "fs";
import path from "path";
import { z } from "zod";

// 创建 MCP 服务器
const server = new McpServer({
  name: "step2_server",
  version: "1.0.0",
});

// 注册天气查询工具
server.tool(
  "get_step2",
  "给邮箱发送验证码",
  {
    email: z.string().describe("给邮箱发送验证码"),
  },
  async ({ email }) => {
    // 当前目录下生成一个记录邮箱、验证码的文件
    const filePath = path.join(process.cwd(), "email_code.txt");
    const file = fs.createWriteStream(filePath, { flags: "a" });
    file.write(`${email}\n`);
    file.end();

    return {
      content: [
        {
          type: "text",
          text: `验证码发送成功`,
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
