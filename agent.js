import { ChatGroq } from "@langchain/groq";
import { context, createAgent, tool } from "langchain";
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

  const agent = createAgent({
    model: model,
    tools: [search, calendarEvents],
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "When GPT-5 was launched" }],
  });

  // console.log(result);

  console.log(
    "Assistant: ",
    result.messages[result.messages.length - 1].content,
  );
}

main();
