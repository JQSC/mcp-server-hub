import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const datasetId = "5065fa82-26d5-4041-932c-0916805d1bc8";
const apiKey = "dataset-RyJmLg4gcqnC4q6dKuHmskS9"; // process.env.DIFY_API_KEY ;
const baseUrl = "http://10.30.36.119"; // process.env.DIFY_BASE_URL;

//获取 datasetId，并返回第一个datasetId
async function getFirstDatasetId() {
  const response = await fetch(`${baseUrl}/v1/datasets?page=1&limit=20`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  // console.log("data", data.data[0]);
  return data.data[0].id;
}

// 获取文档列表
async function getDocumentList(datasetId: string) {
  const response = await fetch(
    `${baseUrl}/v1/datasets/${datasetId}/documents`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  console.log("data", data.data[0]);
  return data.data;
}

/**
 * @description 向 Dify API 发送检索请求
 * @param {string} query - 检索查询内容
 * @returns {Promise<Object|null>} 返回API响应数据或null（出错时）
 */
async function retrieveFromDify(query: string): Promise<any | null> {
  try {
    const response = await fetch(
      `${baseUrl}/v1/datasets/${datasetId}/retrieve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("请求Dify API时出错:", error);
    return null;
  }
}

// const res = retrieveFromDify("table 组件");
// console.log("res", res);

/**
 * @description 格式化检索结果
 * @param {any} result - 检索结果
 * @param {string} query - 检索查询内容
 * @returns {string} 格式化后的结果文本
 */
function formatRetrievalResult(result: any, query: string): string {
  if (!result || !result.records || !Array.isArray(result.records)) {
    return `查询: "${query}"\n\n未找到相关结果`;
  }

  let formattedResult = `查询: "${query}"\n\n检索结果:\n`;

  result.records.forEach((record: any, index: number) => {
    formattedResult += `\n--- 结果 ${index + 1} ---\n`;

    if (record.segment && record.segment.content) {
      // 添加主要内容
      formattedResult += record.segment.content;

      // 添加文档信息
      if (record.segment.document && record.segment.document.name) {
        formattedResult += `\n\n文档: ${record.segment.document.name}`;
      }

      // 添加相关性分数
      if (record.score !== undefined) {
        formattedResult += `\n相关性: ${(record.score * 100).toFixed(2)}%`;
      }
    }

    // 添加子块内容（如果有）
    if (
      record.child_chunks &&
      Array.isArray(record.child_chunks) &&
      record.child_chunks.length > 0
    ) {
      formattedResult += "\n\n相关片段:";
      record.child_chunks.forEach((chunk: any, chunkIndex: number) => {
        if (chunk.content) {
          formattedResult += `\n  ${chunkIndex + 1}. ${chunk.content.substring(0, 100)}${chunk.content.length > 100 ? "..." : ""}`;
        }
      });
    }

    formattedResult += "\n";
  });

  return formattedResult;
}

// 创建服务器实例
const server = new McpServer({
  name: "component_retrieval",
  version: "1.0.0",
});

// 注册组件检索工具
server.tool(
  "retrieve_component",
  "检索组件信息",
  {
    query: z.string().describe("要检索的组件查询内容"),
  },
  async ({ query }) => {
    // const firstDatasetId = ""; // await getFirstDatasetId();
    const result = await retrieveFromDify(query);

    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: "检索组件信息失败，请稍后重试",
          },
        ],
      };
    }

    // 使用新的格式化函数处理结果
    const formattedResult = formatRetrievalResult(result, query);

    return {
      content: [
        {
          type: "text",
          text: formattedResult,
        },
      ],
    };
  },
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("组件检索 MCP 服务器已在 stdio 上运行");
}

main().catch((error) => {
  console.error("主函数中发生致命错误:", error);
  process.exit(1);
});
