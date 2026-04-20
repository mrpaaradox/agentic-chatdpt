import { ChatGroq } from "@langchain/groq";
import { context, createAgent } from "langchain";
import { TavilySearch } from "@langchain/tavily";

async function main() {
  const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
  });

  const Search = new TavilySearch({
    maxResults: 3,
    topic: "general",
  });

  const agent = createAgent({
    model: model,
    tools: [Search],
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "What is current weather in Mumbai?" }],
  });

  console.log(
    "Assistant: ",
    result.messages[result.messages.length - 1].content,
  );
}

main();
