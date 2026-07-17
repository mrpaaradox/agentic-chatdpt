import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { invokeAgent, streamAgent } from "./agent.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }
  const sid = sessionId || crypto.randomUUID();
  const stream = req.query.stream === "true";

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      for await (const token of streamAgent(message, sid)) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true, sessionId: sid })}\n\n`);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    }
    res.end();
  } else {
    try {
      const response = await invokeAgent(message, sid);
      res.json({ response, sessionId: sid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
