import { writeFileSync } from "node:fs";
import readline from "node:readline/promises";
import { ChatGroq } from "@langchain/groq";
import { context, createAgent, tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod/v4";

async function main() {
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
  });

  const search = new TavilySearch({
    maxResults: 3,
    topic: "general",
  });

  const calendarEvents = tool(
    async ({ query }) => {
      return JSON.stringify([
        {
          title: "Meeting with Friend",
          time: "2PM",
          location: "GMEET",
        },
      ]);
    },
    {
      name: "get-calendar-events",
      description: "Call to get calendar events",
      schema: z.object({
        query: z.string().describe("The query to use in calendar event search"),
      }),
    },
  );

  const checkpointer = new MemorySaver();

  const agent = createAgent({
    model: model,
    tools: [search, calendarEvents],
    checkpointer: checkpointer,
  });

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
