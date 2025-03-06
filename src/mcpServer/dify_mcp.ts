import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import axios from "axios";

// 加载环境变量
dotenv.config();

/**
 * Dify API 响应类型
 * @typedef {Object} DifyResponse
 * @property {string} answer - 回答文本
 * @property {string} conversation_id - 对话ID
 * @property {Array} metadata - 元数据
 */
interface DifyResponse {
  answer?: string;
  conversation_id?: string;
  id?: string;
  created_at?: string;
  metadata?: any;
  [key: string]: any;
}

/**
 * Dify API 客户端
 * @class DifyClient
 */
class DifyClient {
  private baseUrl: string;
  private apiKey: string;

  /**
   * 构造函数
   * @param {string} baseUrl - Dify API 基础URL
   * @param {string} apiKey - Dify API 密钥
   */
  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * 获取请求头
   * @returns {Object} 请求头对象
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * 发送聊天消息
   * @param {string} query - 用户查询
   * @param {Object} inputs - 输入参数
   * @param {string} [conversationId] - 对话ID（可选）
   * @param {string} [user] - 用户标识（可选）
   * @param {string} [responseMode="blocking"] - 响应模式，可选值：blocking（阻塞）或 streaming（流式）
   * @returns {Promise<DifyResponse>} 响应结果
   */
  async chatMessage(
    query: string,
    inputs: Record<string, any> = {},
    conversationId?: string,
    user?: string,
    responseMode: "blocking" | "streaming" = "blocking",
  ): Promise<DifyResponse> {
    const url = `${this.baseUrl}/v1/chat-messages`;

    const data: Record<string, any> = {
      inputs,
      query,
      response_mode: responseMode,
    };

    if (conversationId) {
      data.conversation_id = conversationId;
    }

    if (user) {
      data.user = user;
    }

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Dify API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 发送文本生成请求
   * @param {Object} inputs - 输入参数
   * @param {string} [user] - 用户标识（可选）
   * @param {string} [responseMode="blocking"] - 响应模式，可选值：blocking（阻塞）或 streaming（流式）
   * @returns {Promise<DifyResponse>} 响应结果
   */
  async completionMessage(
    inputs: Record<string, any> = {},
    user?: string,
    responseMode: "blocking" | "streaming" = "blocking",
  ): Promise<DifyResponse> {
    const url = `${this.baseUrl}/v1/completion-messages`;

    const data: Record<string, any> = {
      inputs,
      response_mode: responseMode,
    };

    if (user) {
      data.user = user;
    }

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Dify API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取对话历史
   * @param {string} conversationId - 对话ID
   * @param {string} [user] - 用户标识（可选）
   * @returns {Promise<any>} 对话历史
   */
  async getConversationMessages(
    conversationId: string,
    user?: string,
  ): Promise<any> {
    const url = `${this.baseUrl}/v1/messages`;

    const params: Record<string, any> = {
      conversation_id: conversationId,
    };

    if (user) {
      params.user = user;
    }

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Dify API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 获取对话列表
   * @param {string} [user] - 用户标识（可选）
   * @param {number} [first=20] - 返回结果数量
   * @returns {Promise<any>} 对话列表
   */
  async getConversations(user?: string, first: number = 20): Promise<any> {
    const url = `${this.baseUrl}/v1/conversations`;

    const params: Record<string, any> = {
      first,
    };

    if (user) {
      params.user = user;
    }

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Dify API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * 重命名对话
   * @param {string} conversationId - 对话ID
   * @param {string} name - 新名称
   * @param {string} [user] - 用户标识（可选）
   * @returns {Promise<any>} 响应结果
   */
  async renameConversation(
    conversationId: string,
    name: string,
    user?: string,
  ): Promise<any> {
    const url = `${this.baseUrl}/v1/conversations/${conversationId}/name`;

    const data: Record<string, any> = {
      name,
    };

    if (user) {
      data.user = user;
    }

    try {
      const response = await axios.post(url, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Dify API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }
}

// 创建服务器实例
const server = new McpServer({
  name: "dify_service",
  version: "1.0.0",
  description: "提供 Dify API 调用服务的 MCP 服务",
});

// 注册聊天消息工具
server.tool(
  "create_business_component",
  "检索组件信息",
  {
    base_url: z.string().describe("Dify API 基础 URL"),
    api_key: z.string().describe("Dify API 密钥"),
    query: z.string().describe("用户查询内容"),
    inputs: z.record(z.any()).optional().describe("输入参数（可选）"),
    conversation_id: z
      .string()
      .optional()
      .describe("对话ID（可选，用于继续对话）"),
    user: z.string().optional().describe("用户标识（可选）"),
  },
  async ({ base_url, api_key, query, inputs = {}, conversation_id, user }) => {
    try {
      const difyClient = new DifyClient(base_url, api_key);
      const response = await difyClient.chatMessage(
        query,
        inputs,
        conversation_id,
        user,
      );

      return {
        content: [
          {
            type: "text",
            text: response.answer || "无回复内容",
          },
        ],
        metadata: {
          conversation_id: response.conversation_id,
          response_data: response,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `调用 Dify API 时出错: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// 注册文本生成工具
server.tool(
  "generate_with_dify",
  "使用 Dify 生成文本内容",
  {
    base_url: z.string().describe("Dify API 基础 URL"),
    api_key: z.string().describe("Dify API 密钥"),
    inputs: z.record(z.any()).describe("输入参数"),
    user: z.string().optional().describe("用户标识（可选）"),
  },
  async ({ base_url, api_key, inputs, user }) => {
    try {
      const difyClient = new DifyClient(base_url, api_key);
      const response = await difyClient.completionMessage(inputs, user);

      return {
        content: [
          {
            type: "text",
            text: response.answer || "无生成内容",
          },
        ],
        metadata: {
          response_data: response,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `调用 Dify API 时出错: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// 注册获取对话历史工具
server.tool(
  "get_conversation_history",
  "获取 Dify 对话历史记录",
  {
    base_url: z.string().describe("Dify API 基础 URL"),
    api_key: z.string().describe("Dify API 密钥"),
    conversation_id: z.string().describe("对话ID"),
    user: z.string().optional().describe("用户标识（可选）"),
  },
  async ({ base_url, api_key, conversation_id, user }) => {
    try {
      const difyClient = new DifyClient(base_url, api_key);
      const response = await difyClient.getConversationMessages(
        conversation_id,
        user,
      );

      // 格式化对话历史
      let formattedHistory = "";
      if (response.data && Array.isArray(response.data)) {
        formattedHistory = response.data
          .map((msg: any) => {
            const role = msg.role === "user" ? "用户" : "助手";
            return `${role}: ${msg.content}`;
          })
          .join("\n\n");
      }

      return {
        content: [
          {
            type: "text",
            text: formattedHistory || "无对话历史",
          },
        ],
        metadata: {
          response_data: response,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `获取对话历史时出错: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// 注册获取对话列表工具
server.tool(
  "list_conversations",
  "获取 Dify 对话列表",
  {
    base_url: z.string().describe("Dify API 基础 URL"),
    api_key: z.string().describe("Dify API 密钥"),
    user: z.string().optional().describe("用户标识（可选）"),
    first: z.number().optional().describe("返回结果数量（可选，默认20）"),
  },
  async ({ base_url, api_key, user, first }) => {
    try {
      const difyClient = new DifyClient(base_url, api_key);
      const response = await difyClient.getConversations(user, first);

      // 格式化对话列表
      let formattedList = "";
      if (response.data && Array.isArray(response.data)) {
        formattedList = response.data
          .map((conv: any) => {
            return `ID: ${conv.id}\n标题: ${conv.name || "无标题"}\n创建时间: ${conv.created_at || "未知"}`;
          })
          .join("\n\n");
      }

      return {
        content: [
          {
            type: "text",
            text: formattedList || "无对话列表",
          },
        ],
        metadata: {
          response_data: response,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `获取对话列表时出错: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// 注册重命名对话工具
server.tool(
  "rename_conversation",
  "重命名 Dify 对话",
  {
    base_url: z.string().describe("Dify API 基础 URL"),
    api_key: z.string().describe("Dify API 密钥"),
    conversation_id: z.string().describe("对话ID"),
    name: z.string().describe("新对话名称"),
    user: z.string().optional().describe("用户标识（可选）"),
  },
  async ({ base_url, api_key, conversation_id, name, user }) => {
    try {
      const difyClient = new DifyClient(base_url, api_key);
      const response = await difyClient.renameConversation(
        conversation_id,
        name,
        user,
      );

      return {
        content: [
          {
            type: "text",
            text: `对话重命名成功: ${name}`,
          },
        ],
        metadata: {
          response_data: response,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `重命名对话时出错: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dify MCP 服务器已在 stdio 上运行");
}

main().catch((error) => {
  console.error("主函数中发生致命错误:", error);
  process.exit(1);
});
