import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["../mcpServer/high-level/retrieve_component.js"],
  });

  const client = new Client({
    name: "example-client",
    version: "1.0.0",
  });

  await client.connect(transport);

  // Call a tool
  const result = await client.listTools();
  console.log(result);
}

main();
