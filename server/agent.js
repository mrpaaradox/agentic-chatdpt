import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod/v4";

let _agent = null;

export function getAgent() {
  if (_agent) return _agent;

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

  _agent = createReactAgent({
    llm: model,
    tools: [search, calendarEvents],
    checkpointer,
  });

  return _agent;
}

export async function invokeAgent(message, sessionId) {
  const agent = getAgent();
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "system",
          content: `You are a personal assistant. Use provided tools to get the information if you don't have it. Current date and time: ${new Date().toUTCString()}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    },
    { configurable: { thread_id: sessionId } },
  );
  return result.messages[result.messages.length - 1].content;
}

export async function* streamAgent(message, sessionId) {
  const agent = getAgent();
  const eventStream = await agent.streamEvents(
    {
      messages: [
        {
          role: "system",
          content: `You are a personal assistant. Use provided tools to get the information if you don't have it. Current date and time: ${new Date().toUTCString()}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    },
    { configurable: { thread_id: sessionId }, version: "v2" },
  );

  for await (const event of eventStream) {
    if (event.event === "on_chat_model_stream") {
      const token = event.data?.chunk?.content;
      if (token) yield token;
    }
  }
}
