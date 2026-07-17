import { writeFileSync } from "node:fs";
import readline from "node:readline/promises";
import { getAgent } from "./agent.js";

async function main() {
  const agent = getAgent();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const userQuery = await rl.question("You: ");

    if (userQuery === "/bye") break;

    const result = await agent.invoke(
      {
        messages: [
          {
            role: "system",
            content: `You are a personal assistant. Use provided tools to get the information if you don't have it. Current date and time: ${new Date().toUTCString()}`,
          },
          {
            role: "user",
            content: userQuery,
          },
        ],
      },
      { configurable: { thread_id: "1" } },
    );
    console.log(
      "Assistant: ",
      result.messages[result.messages.length - 1].content,
    );
  }
  rl.close();

  const drawableGraphGraphState = await agent.getGraphAsync();
  const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
  const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  const filePath = "./graphState.png";
  writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));
}

main();
