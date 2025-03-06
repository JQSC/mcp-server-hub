/**
 * MCP Client 示例
 *
 * 这个示例展示了如何使用MCP Client与MCP服务器进行交互，
 * 包括连接服务器、列出资源、读取资源和调用工具等操作。
 */

import {
  McpClient,
  StdioTransport,
  HttpSseTransport,
  createMcpClient,
} from "./index";

/**
 * 标准输入输出示例
 *
 * 这个示例展示了如何使用标准输入输出与MCP服务器进行通信。
 * 适用于与子进程通信的场景。
 */
async function stdioExample() {
  console.log("启动标准输入输出MCP客户端示例...");

  // 创建传输层
  const transport = new StdioTransport();

  // 创建客户端
  const client = new McpClient(
    { name: "js-mcp-client-example", version: "1.0.0" },
    { roots: true, sampling: false },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 监听初始化事件
    client.on("initialized", (response) => {
      console.log("客户端已初始化:", response);
    });

    // 列出可用资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 如果有资源，读取第一个资源
    if (resources.resources && resources.resources.length > 0) {
      const firstResource = resources.resources[0];
      console.log(`读取资源: ${firstResource.name}`);

      // 假设资源URI模板是简单的，不需要参数
      const resourceUri = firstResource.uriTemplate.replace(/\{.*?\}/g, "");
      const resourceContent = await client.readResource({ uri: resourceUri });
      console.log("资源内容:", resourceContent);
    }

    // 列出可用工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 如果有工具，调用第一个工具
    if (tools.tools && tools.tools.length > 0) {
      const firstTool = tools.tools[0];
      console.log(`调用工具: ${firstTool.name}`);

      // 假设工具不需要参数
      const toolResult = await client.callTool({
        name: firstTool.name,
        parameters: {},
      });
      console.log("工具执行结果:", toolResult);
    }

    // 关闭客户端
    await client.closeGracefully();
    console.log("客户端已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * HTTP SSE示例
 *
 * 这个示例展示了如何使用HTTP SSE与MCP服务器进行通信。
 * 适用于与远程服务器通信的场景。
 */
async function httpSseExample() {
  console.log("启动HTTP SSE MCP客户端示例...");

  // 创建传输层
  const transport = new HttpSseTransport("http://localhost:8080/mcp");

  // 创建客户端
  const client = new McpClient(
    { name: "js-mcp-client-example", version: "1.0.0" },
    { roots: true, sampling: false },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 监听初始化事件
    client.on("initialized", (response) => {
      console.log("客户端已初始化:", response);
    });

    // 列出可用资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 如果有资源，读取第一个资源
    if (resources.resources && resources.resources.length > 0) {
      const firstResource = resources.resources[0];
      console.log(`读取资源: ${firstResource.name}`);

      // 假设资源URI模板是简单的，不需要参数
      const resourceUri = firstResource.uriTemplate.replace(/\{.*?\}/g, "");
      const resourceContent = await client.readResource({ uri: resourceUri });
      console.log("资源内容:", resourceContent);
    }

    // 列出可用工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 如果有工具，调用第一个工具
    if (tools.tools && tools.tools.length > 0) {
      const firstTool = tools.tools[0];
      console.log(`调用工具: ${firstTool.name}`);

      // 假设工具不需要参数
      const toolResult = await client.callTool({
        name: firstTool.name,
        parameters: {},
      });
      console.log("工具执行结果:", toolResult);
    }

    // 关闭客户端
    await client.closeGracefully();
    console.log("客户端已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * 简化API示例
 *
 * 这个示例展示了如何使用简化的API创建和使用MCP客户端。
 */
async function simplifiedExample() {
  console.log("启动简化API MCP客户端示例...");

  // 创建传输层
  const transport = new StdioTransport();

  // 使用简化API创建客户端
  const client = createMcpClient(
    transport,
    { name: "js-mcp-client-example", version: "1.0.0" },
    { roots: true },
  );

  try {
    // 监听初始化事件
    client.on("initialized", (response) => {
      console.log("客户端已初始化:", response);
    });

    // 等待客户端初始化完成
    await new Promise<void>((resolve) => {
      if (client["initialized"]) {
        resolve();
      } else {
        client.once("initialized", () => resolve());
      }
    });

    // 列出可用资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 关闭客户端
    await client.closeGracefully();
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
  const example = args[0] || "stdio";

  switch (example) {
    case "stdio":
      await stdioExample();
      break;
    case "http":
      await httpSseExample();
      break;
    case "simple":
      await simplifiedExample();
      break;
    default:
      console.error("未知示例:", example);
      console.log("可用示例: stdio, http, simple");
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { stdioExample, httpSseExample, simplifiedExample };
