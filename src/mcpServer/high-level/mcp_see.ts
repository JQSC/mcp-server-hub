import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

// 定义天气数据类型
type WeatherInfo = {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
};

const weatherData: Record<string, WeatherInfo> = {
  北京: { temperature: 20, condition: "晴朗", humidity: 45, windSpeed: 8 },
  上海: { temperature: 25, condition: "多云", humidity: 60, windSpeed: 12 },
  广州: { temperature: 28, condition: "小雨", humidity: 75, windSpeed: 6 },
  深圳: { temperature: 27, condition: "阴天", humidity: 70, windSpeed: 10 },
};

const server = new McpServer({
  name: "see_server",
  version: "1.0.0",
});

server.tool(
  "get_weather",
  "获取指定城市的天气信息",
  {
    city: z.string().describe("城市名称（如：北京、上海、广州、深圳）"),
  },
  async ({ city }) => {
    const weather = weatherData[city];
    if (!weather) {
      return {
        content: [
          {
            type: "text",
            text: `未找到城市 ${city} 的天气信息。支持的城市包括：${Object.keys(weatherData).join("、")}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `${city}的天气信息：
温度：${weather.temperature}°C
天气：${weather.condition}
湿度：${weather.humidity}%
风速：${weather.windSpeed}m/s`,
        },
      ],
    };
  },
);

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
