import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  ErrorCode,
  LoggingMessageNotificationSchema,
  NotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

// 处理错误 ，catch 内已捕获
// client.onerror = (error) => {
//   console.error("\nClient error:", error, "\n");
// };

// // 处理通知
// client.setNotificationHandler(NotificationSchema, (notification) => {
//   // Process notification
//   console.log(notification.params);
// });

let notificationCount = 0;
client.setNotificationHandler(
  LoggingMessageNotificationSchema,
  (notification) => {
    notificationCount++;
    console.log(
      `\nNotification #${notificationCount}: ${notification.params.level} - ${notification.params.data}`,
    );
    // Re-display the prompt
    process.stdout.write("> ");
  },
);

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp"),
  {
    sessionId: undefined,
    requestInit: {
      headers: {
        "X-Custom-Header": "value",
      },
    },
    reconnectionOptions: {
      maxRetries: 5,
      initialReconnectionDelay: 1000,
      maxReconnectionDelay: 10000,
      reconnectionDelayGrowFactor: 1.5,
    },
  },
);

async function main() {
  await client.connect(transport);

  const serverCapabilities = client.getServerCapabilities();
  console.log("Server capabilities:", serverCapabilities);
  console.log("Server version:", client.getServerVersion());

  try {
    // 发起请求
    const result = await client.listTools();
    console.log(result);
  } catch (error: any) {
    if (error && error.code === ErrorCode.RequestTimeout) {
      console.error("Request timed out");
    } else if (error && error.code === ErrorCode.InvalidRequest) {
      console.log("Request was cancelled");
    } else {
      console.error("Error:", error);
    }
  }
}

main();
