/**
 * MCP Client 高级示例
 *
 * 这个示例展示了如何使用MCP Client与MCP服务器进行更复杂的交互，
 * 包括资源订阅、参数化工具调用、错误处理和事件监听等高级功能。
 */

import { McpClient, StdioTransport, HttpSseTransport } from "./index";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";

/**
 * 与子进程MCP服务器交互示例
 *
 * 这个示例展示了如何启动一个MCP服务器子进程，并与之交互。
 * 适用于需要在同一应用中同时运行客户端和服务器的场景。
 */
async function childProcessExample() {
  console.log("启动子进程MCP服务器示例...");

  // 启动MCP服务器子进程
  // 注意：这里假设有一个名为mcp-server的可执行文件或脚本
  const serverProcess = spawn("node", ["./path/to/mcp-server.js"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // 创建传输层
  const transport = new StdioTransport();

  // 重定向标准输入输出
  process.stdin.pipe(serverProcess.stdin);
  serverProcess.stdout.pipe(process.stdout);

  // 创建客户端
  const client = new McpClient(
    { name: "js-mcp-advanced-client", version: "1.0.0" },
    { roots: true, sampling: true },
  );

  // 设置错误处理
  serverProcess.on("error", (error) => {
    console.error("服务器进程错误:", error);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error("服务器错误输出:", data.toString());
  });

  serverProcess.on("close", (code) => {
    console.log(`服务器进程退出，退出码: ${code}`);
  });

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 监听初始化事件
    client.on("initialized", (response) => {
      console.log("客户端已初始化:", response);
    });

    // 监听资源变更通知
    client.on("resourcesChanged", (params) => {
      console.log("资源列表已变更:", params);
    });

    // 监听工具变更通知
    client.on("toolsChanged", (params) => {
      console.log("工具列表已变更:", params);
    });

    // 列出可用资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 处理文件资源
    const fileResources = resources.resources.filter((r) => r.name === "file");
    if (fileResources.length > 0) {
      const fileResource = fileResources[0];
      console.log(`读取文件资源: ${fileResource.name}`);

      // 读取示例文件
      const filePath = "/example.txt";
      const resourceContent = await client.readResource({
        uri: `file://${filePath}`,
      });
      console.log(`文件 ${filePath} 内容:`, resourceContent);
    }

    // 列出可用工具
    const tools = await client.listTools();
    console.log("可用工具:", tools);

    // 查找并调用计算器工具
    const calculatorTools = tools.tools.filter((t) => t.name === "calculator");
    if (calculatorTools.length > 0) {
      const calculatorTool = calculatorTools[0];
      console.log(`调用计算器工具: ${calculatorTool.name}`);

      // 调用加法操作
      const addResult = await client.callTool({
        name: calculatorTool.name,
        parameters: {
          operation: "add",
          a: 5,
          b: 3,
        },
      });
      console.log("加法结果:", addResult);

      // 调用乘法操作
      const multiplyResult = await client.callTool({
        name: calculatorTool.name,
        parameters: {
          operation: "multiply",
          a: 4,
          b: 7,
        },
      });
      console.log("乘法结果:", multiplyResult);
    }

    // 错误处理示例 - 调用不存在的工具
    try {
      await client.callTool({
        name: "non_existent_tool",
        parameters: {},
      });
    } catch (error: any) {
      console.error("预期的错误 - 工具不存在:", error.message);
    }

    // 关闭客户端和服务器
    await client.closeGracefully();
    serverProcess.kill();
    console.log("客户端和服务器已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
    serverProcess.kill();
  }
}

/**
 * 文件系统资源示例
 *
 * 这个示例展示了如何使用MCP Client访问文件系统资源。
 */
async function fileSystemResourceExample() {
  console.log("启动文件系统资源示例...");

  // 创建传输层
  const transport = new HttpSseTransport("http://localhost:8080/mcp");

  // 创建客户端
  const client = new McpClient(
    { name: "js-mcp-fs-client", version: "1.0.0" },
    { roots: true },
  );

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 列出可用资源
    const resources = await client.listResources();
    console.log("可用资源:", resources);

    // 查找文件系统资源
    const fsResources = resources.resources.filter(
      (r) => r.name === "file" || r.name === "directory",
    );

    if (fsResources.length > 0) {
      // 添加根目录
      const rootDir = "/path/to/project";
      if ("addRoot" in client) {
        await (client as any).addRoot({
          uri: `file://${rootDir}`,
          description: "项目根目录",
        });
      } else {
        console.log("客户端不支持addRoot方法");
      }
      console.log(`已添加根目录: ${rootDir}`);

      // 读取目录内容
      const dirContent = await client.readResource({
        uri: `file://${rootDir}`,
      });
      console.log("目录内容:", dirContent);

      // 读取特定文件
      const filePath = path.join(rootDir, "example.txt");
      if (fs.existsSync(filePath)) {
        const fileContent = await client.readResource({
          uri: `file://${filePath}`,
        });
        console.log(`文件 ${filePath} 内容:`, fileContent);
      }

      // 移除根目录
      if ("removeRoot" in client) {
        await (client as any).removeRoot(`file://${rootDir}`);
      } else {
        console.log("客户端不支持removeRoot方法");
      }
      console.log(`已移除根目录: ${rootDir}`);
    } else {
      console.log("未找到文件系统资源");
    }

    // 关闭客户端
    await client.closeGracefully();
    console.log("客户端已关闭");
  } catch (error) {
    console.error("MCP客户端错误:", error);
  }
}

/**
 * 工具执行示例
 *
 * 这个示例展示了如何使用MCP Client执行各种工具。
 */
async function toolExecutionExample() {
  console.log("启动工具执行示例...");

  // 创建传输层
  const transport = new HttpSseTransport("http://localhost:8080/mcp");

  // 创建客户端
  const client = new McpClient({
    name: "js-mcp-tool-client",
    version: "1.0.0",
  });

  try {
    // 连接到服务器
    await client.connect(transport);
    console.log("已连接到MCP服务器");

    // 列出可用工具
    const tools = await client.listTools();
    console.log(
      "可用工具:",
      tools.tools.map((t) => t.name),
    );

    // 执行搜索工具
    const searchTools = tools.tools.filter((t) => t.name === "search");
    if (searchTools.length > 0) {
      console.log("执行搜索工具...");
      const searchResult = await client.callTool({
        name: "search",
        parameters: {
          query: "example",
          maxResults: 5,
        },
      });
      console.log("搜索结果:", searchResult);
    }

    // 执行翻译工具
    const translateTools = tools.tools.filter((t) => t.name === "translate");
    if (translateTools.length > 0) {
      console.log("执行翻译工具...");
      const translateResult = await client.callTool({
        name: "translate",
        parameters: {
          text: "Hello, world!",
          targetLanguage: "zh-CN",
        },
      });
      console.log("翻译结果:", translateResult);
    }

    // 执行数据库查询工具
    const dbTools = tools.tools.filter((t) => t.name === "database");
    if (dbTools.length > 0) {
      console.log("执行数据库查询工具...");
      const queryResult = await client.callTool({
        name: "database",
        parameters: {
          query: "SELECT * FROM users LIMIT 3",
        },
      });
      console.log("查询结果:", queryResult);
    }

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
  const example = args[0] || "child-process";

  switch (example) {
    case "child-process":
      await childProcessExample();
      break;
    case "fs-resource":
      await fileSystemResourceExample();
      break;
    case "tool-execution":
      await toolExecutionExample();
      break;
    default:
      console.error("未知示例:", example);
      console.log("可用示例: child-process, fs-resource, tool-execution");
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

export { childProcessExample, fileSystemResourceExample, toolExecutionExample };
