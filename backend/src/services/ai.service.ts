import { genAI } from "../config/gemini";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const generateContentStream = async function* (prompt: string): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const stream = await model.generateContentStream(prompt);
  for await (const chunk of stream.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
};

export const generateContent = async (prompt: string, retries = 2): Promise<string> => {
  let last: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      last = error;
      const msg = String(error?.message || '');
      if (/503|overload|high demand|429/i.test(msg) && i < retries) {
        await sleep(2000 * (i + 1));
        continue;
      }
      break;
    }
  }
  console.error("Error calling Gemini API:", last);
  throw new Error(last?.message || "Failed to generate content");
};
