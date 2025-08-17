import express from "express";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

app.post("/ask", async (req, res) => {
  const { question, headers, rows } = req.body;

  const tableData = headers.join(", ") + "\n" + rows.map(r => r.join(", ")).join("\n");

  const prompt = `
You are an AI assistant inside a Tableau dashboard.
Here is some data:

${tableData}

User question: ${question}

Answer in plain language, explain insights, and mention relevant trends.
`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ answer: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Error fetching AI response." });
  }
});

app.listen(3000, () => console.log("AI Explainer server running on http://localhost:3000"));
