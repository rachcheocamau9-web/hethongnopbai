import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Assistant endpoint
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { task, prompt, content, targetLanguage, tone } = req.body;

    if (!task) {
      return res.status(400).json({ success: false, error: "Thiếu tham số 'task'" });
    }

    const ai = getAiClient();
    const model = "gemini-3.6-flash";

    let systemInstruction = "Bạn là trợ lý AI biên tập tài liệu chuyên nghiệp tiếng Việt. Hãy trả lời chính xác, mạch lạc, đúng chuẩn mực văn phong và cấu trúc Markdown đẹp mắt.";
    if (tone) {
      systemInstruction += ` Văn phong yêu cầu: ${tone} (trang trọng, rõ ràng, giàu tính thuyết phục).`;
    }

    let contentsPrompt = "";

    switch (task) {
      case "draft":
        contentsPrompt = `Hãy viết một bài văn bản/tài liệu hoàn chỉnh với định dạng Markdown chuyên nghiệp dựa trên yêu cầu sau:\n\n"${prompt}"\n\nTài liệu nên có tiêu đề (# H1), các mục rõ ràng (## H2), danh sách gạch đầu dòng, các điểm quan trọng được in đậm và định dạng đẹp mắt.`;
        break;

      case "summarize":
        contentsPrompt = `Hãy đọc đoạn tài liệu sau và thực hiện:\n1. Tóm tắt ngắn gọn 3-5 câu cốt lõi.\n2. Liệt kê 3-5 điểm quan trọng nhất (Key Takeaways).\n3. Rút ra các công việc cần làm nếu có.\n\nNội dung tài liệu:\n"""\n${content}\n"""`;
        break;

      case "polish":
        contentsPrompt = `Hãy sửa lỗi chính tả, tối ưu hóa ngữ pháp, câu từ và làm cho đoạn văn bản sau đây trở nên mượt mà, chuyên nghiệp hơn mà vẫn giữ nguyên ý nghĩa ban đầu. Trả về phiên bản đã cải tiến dưới định dạng Markdown:\n\n"""\n${content}\n"""`;
        break;

      case "translate":
        const lang = targetLanguage || "Tiếng Anh";
        contentsPrompt = `Hãy dịch chính xác và mượt mà văn bản sau đây sang ${lang}, giữ nguyên cấu trúc Markdown (tiêu đề, danh sách, in đậm, bảng):\n\n"""\n${content}\n"""`;
        break;

      case "expand":
        contentsPrompt = `Dựa trên ý tưởng/đoạn văn bản ngắn sau, hãy viết tiếp và mở rộng thêm thông tin chi tiết, lập luận thuyết phục và các gạch đầu dòng minh họa:\n\n"${prompt || content}"`;
        break;

      case "extract_tasks":
        contentsPrompt = `Hãy trích xuất tất cả các nhiệm vụ, công việc cần làm (Action items) từ tài liệu dưới đây dưới dạng danh sách việc cần làm (Checklist Markdown: - [ ] Task name):\n\n"""\n${content}\n"""`;
        break;

      case "chat":
        contentsPrompt = `Dựa vào ngữ cảnh tài liệu dưới đây:\n"""\n${content}\n"""\n\nHãy trả lời câu hỏi sau của người dùng một cách chính xác, lịch sự và hữu ích:\n\n"${prompt}"`;
        break;

      default:
        contentsPrompt = prompt || content || "Hãy hỗ trợ tối ưu hóa tài liệu này.";
        break;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contentsPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const resultText = response.text || "Không nhận được phản hồi từ AI.";

    res.json({
      success: true,
      result: resultText,
    });
  } catch (error: any) {
    console.error("Lỗi API Gemini Assistant:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi khi gọi Trợ lý AI.",
    });
  }
});

async function startServer() {
  // Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server SmartDoc running on http://localhost:${PORT}`);
  });
}

startServer();
