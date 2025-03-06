/**
 * MCP Client Implementation
 *
 * 这是一个基于JavaScript/TypeScript的MCP Client实现，
 * 用于与MCP服务器进行通信，访问资源和调用工具。
 *
 * 参考:
 * - Java SDK: https://modelcontextprotocol.io/sdk/java/mcp-client
 * - TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
 */

import { EventEmitter } from "events";

/**
 * MCP客户端实现信息
 */
interface Implementation {
  /** 客户端名称 */
  name: string;
  /** 客户端版本 */
  version: string;
}

/**
 * MCP客户端能力配置
 */
interface ClientCapabilities {
  /** 是否支持根资源管理 */
  roots?: boolean;
  /** 是否支持采样 */
  sampling?: boolean;
}

/**
 * MCP传输接口
 */
interface McpTransport {
  /** 发送消息到服务器 */
  send(message: any): Promise<void>;
  /** 关闭传输连接 */
  close(): Promise<void>;
  /** 设置消息处理器 */
  setMessageHandler(handler: (message: any) => void): void;
}

/**
 * 读取资源请求
 */
interface ReadResourceRequest {
  /** 资源URI */
  uri: string;
}

/**
 * 读取资源结果
 */
interface ReadResourceResult {
  /** 资源内容列表 */
  contents: Array<{
    /** 资源URI */
    uri: string;
    /** 资源文本内容 */
    text: string;
  }>;
}

/**
 * 列出资源结果
 */
interface ListResourcesResult {
  /** 资源列表 */
  resources: Array<{
    /** 资源名称 */
    name: string;
    /** 资源URI模板 */
    uriTemplate: string;
  }>;
}

/**
 * 调用工具请求
 */
interface CallToolRequest {
  /** 工具名称 */
  name: string;
  /** 工具参数 */
  parameters: Record<string, any>;
}

/**
 * 调用工具结果
 */
interface CallToolResult {
  /** 工具执行结果内容 */
  content: Array<{
    /** 内容类型 */
    type: string;
    /** 文本内容 */
    text: string;
  }>;
}

/**
 * 列出工具结果
 */
interface ListToolsResult {
  /** 工具列表 */
  tools: Array<{
    /** 工具名称 */
    name: string;
    /** 工具描述 */
    description?: string;
    /** 工具参数模式 */
    parameterSchema?: any;
  }>;
}

/**
 * 根资源
 */
interface Root {
  /** 根资源URI */
  uri: string;
  /** 根资源描述 */
  description: string;
}

/**
 * 添加根资源请求
 */
interface AddRootRequest extends Root {}

/**
 * 移除根资源请求
 */
interface RemoveRootRequest {
  /** 根资源URI */
  uri: string;
}

/**
 * MCP客户端类
 */
export class McpClient extends EventEmitter {
  private transport: McpTransport | null = null;
  private clientInfo: Implementation;
  private capabilities: ClientCapabilities;
  private initialized: boolean = false;
  private requestId: number = 0;
  private pendingRequests: Map<
    number,
    { resolve: Function; reject: Function }
  > = new Map();
  private serverCapabilities: any = {};

  /**
   * 创建MCP客户端实例
   *
   * @param clientInfo - 客户端实现信息
   * @param capabilities - 客户端能力配置
   */
  constructor(
    clientInfo: Implementation,
    capabilities: ClientCapabilities = {},
  ) {
    super();
    this.clientInfo = clientInfo;
    this.capabilities = capabilities;
  }

  /**
   * 连接到MCP服务器
   *
   * @param transport - MCP传输实例
   */
  async connect(transport: McpTransport): Promise<void> {
    this.transport = transport;
    this.transport.setMessageHandler(this.handleMessage.bind(this));
    await this.initialize();
  }

  /**
   * 初始化MCP连接
   */
  private async initialize(): Promise<void> {
    if (!this.transport) {
      throw new Error("Transport not connected");
    }

    const response = await this.sendRequest("initialize", {
      clientInfo: this.clientInfo,
      capabilities: this.capabilities,
      protocolVersion: "0.1.0",
    });

    this.serverCapabilities = response.capabilities || {};
    this.initialized = true;
    this.emit("initialized", response);
    return response;
  }

  /**
   * 处理接收到的消息
   *
   * @param message - 接收到的消息
   */
  private handleMessage(message: any): void {
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;

      if (message.error) {
        reject(new Error(message.error.message || "Unknown error"));
      } else {
        resolve(message.result);
      }

      this.pendingRequests.delete(message.id);
    } else if (message.method) {
      // 处理服务器发送的通知
      this.emit(message.method, message.params);
    }
  }

  /**
   * 发送请求到服务器
   *
   * @param method - 请求方法
   * @param params - 请求参数
   * @returns 请求结果
   */
  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.transport) {
      throw new Error("Transport not connected");
    }

    if (method !== "initialize" && !this.initialized) {
      throw new Error("Client not initialized");
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.transport!.send(request).catch(reject);
    });
  }

  /**
   * 列出可用资源
   *
   * @returns 资源列表结果
   */
  async listResources(): Promise<ListResourcesResult> {
    return this.sendRequest("listResources", {});
  }

  /**
   * 读取资源内容
   *
   * @param request - 读取资源请求
   * @returns 资源内容结果
   */
  async readResource(
    request: ReadResourceRequest,
  ): Promise<ReadResourceResult> {
    return this.sendRequest("readResource", request);
  }

  /**
   * 列出可用工具
   *
   * @returns 工具列表结果
   */
  async listTools(): Promise<ListToolsResult> {
    return this.sendRequest("listTools", {});
  }

  /**
   * 调用工具
   *
   * @param request - 调用工具请求
   * @returns 工具执行结果
   */
  async callTool(request: CallToolRequest): Promise<CallToolResult> {
    return this.sendRequest("callTool", request);
  }

  /**
   * 添加根资源
   *
   * @param request - 添加根资源请求
   * @returns 添加结果
   */
  async addRoot(request: AddRootRequest): Promise<void> {
    if (!this.capabilities.roots) {
      throw new Error("Client does not support roots capability");
    }

    if (!this.serverCapabilities.roots) {
      throw new Error("Server does not support roots capability");
    }

    return this.sendRequest("addRoot", request);
  }

  /**
   * 移除根资源
   *
   * @param uri - 根资源URI
   * @returns 移除结果
   */
  async removeRoot(uri: string): Promise<void> {
    if (!this.capabilities.roots) {
      throw new Error("Client does not support roots capability");
    }

    if (!this.serverCapabilities.roots) {
      throw new Error("Server does not support roots capability");
    }

    return this.sendRequest("removeRoot", { uri });
  }

  /**
   * 列出根资源
   *
   * @returns 根资源列表
   */
  async listRoots(): Promise<Root[]> {
    if (!this.capabilities.roots) {
      throw new Error("Client does not support roots capability");
    }

    if (!this.serverCapabilities.roots) {
      throw new Error("Server does not support roots capability");
    }

    return this.sendRequest("listRoots", {});
  }

  /**
   * 优雅关闭客户端连接
   */
  async closeGracefully(): Promise<void> {
    if (this.transport && this.initialized) {
      await this.sendRequest("shutdown", {});
      await this.transport.close();
      this.transport = null;
      this.initialized = false;
    }
  }
}

/**
 * 标准输入输出传输实现
 */
export class StdioTransport implements McpTransport {
  private messageHandler: ((message: any) => void) | null = null;
  private buffer: string = "";

  constructor() {
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", this.handleStdinData.bind(this));
  }

  /**
   * 处理标准输入数据
   *
   * @param chunk - 输入数据块
   */
  private handleStdinData(chunk: string): void {
    this.buffer += chunk;

    let newlineIndex;
    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);

      if (line.trim() && this.messageHandler) {
        try {
          const message = JSON.parse(line);
          this.messageHandler(message);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      }
    }
  }

  /**
   * 发送消息到服务器
   *
   * @param message - 要发送的消息
   */
  async send(message: any): Promise<void> {
    const messageStr = JSON.stringify(message);
    process.stdout.write(messageStr + "\n");
  }

  /**
   * 关闭传输连接
   */
  async close(): Promise<void> {
    // 标准输入输出不需要特别关闭
  }

  /**
   * 设置消息处理器
   *
   * @param handler - 消息处理函数
   */
  setMessageHandler(handler: (message: any) => void): void {
    this.messageHandler = handler;
  }
}

/**
 * HTTP SSE传输实现
 */
export class HttpSseTransport implements McpTransport {
  private url: string;
  private eventSource: EventSource | null = null;
  private messageHandler: ((message: any) => void) | null = null;
  private connected: boolean = false;

  /**
   * 创建HTTP SSE传输实例
   *
   * @param url - 服务器URL
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * 连接到服务器
   */
  private connect(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.eventSource = new EventSource(this.url);

      this.eventSource.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.eventSource.onerror = (error) => {
        if (!this.connected) {
          reject(error);
        } else {
          console.error("SSE connection error:", error);
        }
      };

      this.eventSource.onmessage = (event) => {
        if (this.messageHandler) {
          try {
            const message = JSON.parse(event.data);
            this.messageHandler(message);
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        }
      };
    });
  }

  /**
   * 发送消息到服务器
   *
   * @param message - 要发送的消息
   */
  async send(message: any): Promise<void> {
    await this.connect();

    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
  }

  /**
   * 关闭传输连接
   */
  async close(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connected = false;
    }
  }

  /**
   * 设置消息处理器
   *
   * @param handler - 消息处理函数
   */
  setMessageHandler(handler: (message: any) => void): void {
    this.messageHandler = handler;
  }
}

/**
 * 创建同步MCP客户端
 *
 * @param transport - MCP传输实例
 * @param clientInfo - 客户端实现信息
 * @param capabilities - 客户端能力配置
 * @returns MCP客户端实例
 */
export function createMcpClient(
  transport: McpTransport,
  clientInfo: Implementation,
  capabilities: ClientCapabilities = {},
): McpClient {
  const client = new McpClient(clientInfo, capabilities);
  client.connect(transport).catch(console.error);
  return client;
}
