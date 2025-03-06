/**
 * 官方SDK MCP客户端示例
 *
 * 这个示例展示了如何使用@modelcontextprotocol/sdk提供的官方Client类
 * 与MCP服务器进行交互，包括连接服务器、列出资源、读取资源和调用工具等操作。
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import * as path from "path";

/**
 * 基本用法示例
 *
 * 这个示例展示了如何使用官方SDK的Client类与MCP服务器进行基本交互。
 */
async function basicExample() {
  console.log("启动官方SDK MCP客户端基本示例...");

  // 创建传输层
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"],
  });

  // 创建客户端
  const client = new Client(
    {
      name: "example-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 列出提示模板
    const prompts = await client.listPrompts();
    console.log("可用提示模板:", prompts);

    // 如果有提示模板，获取第一个
    if (prompts.prompts && prompts.prompts.length > 0) {
      const promptName = prompts.prompts[0].name;
      const prompt = await client.getPrompt({
        name: promptName,
        arguments: {
          arg1: "value",
        },
      });
      console.log(`提示模板 ${promptName}:`, prompt);
    }

    // 列出资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 读取资源
    const resource = await client.readResource({
      uri: "file:///example.txt",
    });
    console.log("资源内容:", resource);

    // 列出工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 调用工具
    const result = await client.callTool({
      name: "example-tool",
      arguments: {
        arg1: "value",
      },
    });
    console.log("工具执行结果:", result);

    // 关闭客户端
    await client.close();
    console.log("客户端已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * 子进程服务器示例
 *
 * 这个示例展示了如何启动一个MCP服务器子进程，并使用官方SDK的Client与之交互。
 */
async function childProcessExample() {
  console.log("启动官方SDK MCP客户端子进程示例...");

  // 启动MCP服务器子进程
  const serverProcess = spawn("node", [path.join(__dirname, "server.js")], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // 设置错误处理
  serverProcess.on("error", (error) => {
    console.error("服务器进程错误:", error);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error("服务器错误输出:", data.toString());
  });

  // 创建传输层
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(__dirname, "server.js")],
  });

  // 创建客户端
  const client = new Client(
    {
      name: "child-process-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 列出资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 列出工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 如果服务器支持提示模板功能
    try {
      const prompts = await client.listPrompts();
      console.log("可用提示模板:", prompts);

      // 使用第一个提示模板
      if (prompts.prompts && prompts.prompts.length > 0) {
        const promptName = prompts.prompts[0].name;
        const prompt = await client.getPrompt({
          name: promptName,
          arguments: {
            context: "MCP客户端示例",
          },
        });
        console.log(`提示模板 ${promptName} 结果:`, prompt);
      }
    } catch (error: any) {
      console.error("提示模板功能不可用:", error.message);
    }

    // 根资源管理功能在官方SDK中可能有不同的API
    // 这里我们注释掉这部分代码，因为它可能不适用于官方SDK
    /*
    try {
      // 添加根目录
      await client.addRoot({
        uri: "file:///path/to/project",
        description: "项目根目录"
      });
      console.log("已添加根目录");

      // 列出根目录
      const roots = await client.listRoots();
      console.log("根目录:", roots);

      // 移除根目录
      await client.removeRoot("file:///path/to/project");
      console.log("已移除根目录");
    } catch (error) {
      console.error("根资源管理功能不可用:", error.message);
    }
    */

    // 关闭客户端和服务器
    await client.close();
    serverProcess.kill();
    console.log("客户端和服务器已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
    serverProcess.kill();
  }
}

/**
 * HTTP SSE传输示例
 *
 * 这个示例展示了如何使用HTTP SSE传输与远程MCP服务器交互。
 */
async function httpSseExample() {
  console.log("启动官方SDK MCP客户端HTTP SSE示例...");

  try {
    // 注意：由于模块导入问题，这里我们使用一个模拟的HTTP SSE传输示例
    console.log("注意：这是一个模拟的HTTP SSE传输示例");
    console.log("在实际使用中，您需要安装并导入官方SDK的HTTP SSE传输模块");

    // 创建一个基本的客户端，不实际连接
    const client = new Client(
      {
        name: "http-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      },
    );

    console.log("HTTP SSE传输示例说明:");
    console.log(
      '1. 导入HTTP SSE传输: import { HttpSseClientTransport } from "@modelcontextprotocol/sdk/client/http-sse.js"',
    );
    console.log(
      '2. 创建传输层: const transport = new HttpSseClientTransport({ url: "http://localhost:8080/mcp" })',
    );
    console.log("3. 创建客户端并连接: await client.connect(transport)");
    console.log("4. 使用客户端API访问资源和调用工具");
    console.log("5. 关闭客户端: await client.close()");

    console.log("HTTP SSE传输示例结束");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * 完整功能示例
 *
 * 这个示例展示了如何使用官方SDK的Client类的所有主要功能。
 */
async function fullFeaturedExample() {
  console.log("启动官方SDK MCP客户端完整功能示例...");

  // 创建传输层
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"],
  });

  // 创建客户端
  const client = new Client(
    {
      name: "full-featured-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
        sampling: {},
      },
    },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 设置采样处理器（如果支持）
    // 注意：官方SDK可能有不同的API，这里仅作示例
    if ("setSamplingHandler" in client) {
      (client as any).setSamplingHandler(async (request: any) => {
        console.log("收到采样请求:", request);
        // 这里应该调用实际的LLM API
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: "这是一个采样响应示例",
              },
            },
          ],
        };
      });
    }

    // 列出资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 读取资源
    if (resources.resources && resources.resources.length > 0) {
      const resourceUri = "file:///example.txt";
      try {
        const resource = await client.readResource({
          uri: resourceUri,
        });
        console.log(`资源 ${resourceUri} 内容:`, resource);
      } catch (error: any) {
        console.error(`读取资源 ${resourceUri} 失败:`, error.message);
      }
    }

    // 列出工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 调用工具
    if (tools.tools && tools.tools.length > 0) {
      const toolName = tools.tools[0].name;
      try {
        const result = await client.callTool({
          name: toolName,
          arguments: { arg1: "value" },
        });
        console.log(`工具 ${toolName} 执行结果:`, result);
      } catch (error: any) {
        console.error(`调用工具 ${toolName} 失败:`, error.message);
      }
    }

    // 列出提示模板
    try {
      const prompts = await client.listPrompts();
      console.log("可用提示模板:", prompts);

      // 使用提示模板
      if (prompts.prompts && prompts.prompts.length > 0) {
        const promptName = prompts.prompts[0].name;
        const prompt = await client.getPrompt({
          name: promptName,
          arguments: {
            context: "完整功能示例",
          },
        });
        console.log(`提示模板 ${promptName} 结果:`, prompt);
      }
    } catch (error: any) {
      console.error("提示模板功能不可用:", error.message);
    }

    // 根资源管理功能在官方SDK中可能有不同的API
    // 这里我们注释掉这部分代码，因为它可能不适用于官方SDK
    /*
    try {
      // 添加根目录
      await client.addRoot({
        uri: "file:///path/to/project",
        description: "项目根目录"
      });
      console.log("已添加根目录");

      // 列出根目录
      const roots = await client.listRoots();
      console.log("根目录:", roots);

      // 移除根目录
      await client.removeRoot("file:///path/to/project");
      console.log("已移除根目录");
    } catch (error) {
      console.error("根资源管理功能不可用:", error.message);
    }
    */

    // 关闭客户端
    await client.close();
    console.log("客户端已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * 主函数
 */
async function main() {
  // 根据命令行参数选择示例
  const args = process.argv.slice(2);
  const example = args[0] || "basic";

  switch (example) {
    case "basic":
      await basicExample();
      break;
    case "child-process":
      await childProcessExample();
      break;
    case "http-sse":
      await httpSseExample();
      break;
    case "full":
      await fullFeaturedExample();
      break;
    default:
      console.error("未知示例:", example);
      console.log("可用示例: basic, child-process, http-sse, full");
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicExample,
  childProcessExample,
  httpSseExample,
  fullFeaturedExample,
};
