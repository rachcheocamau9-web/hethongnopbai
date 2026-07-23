import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Data Persistence Setup
const DATA_DIR = path.join(process.cwd(), "data");
const COMPS_FILE = path.join(DATA_DIR, "competitions.json");
const SUBS_FILE = path.join(DATA_DIR, "submissions.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_SERVER_COMPETITIONS = [
  {
    id: "comp-1",
    title: "Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026",
    description: "Nộp bài thi sáng tạo, đồ án hoặc báo cáo ý tưởng thiết kế dạng PDF hoặc Hình ảnh chất lượng cao.",
    startDate: "2026-07-01T08:00",
    endDate: "2026-12-31T23:59",
    allowedTypes: ["pdf", "image"],
    maxFileSizeMb: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: "comp-2",
    title: "Cuộc Thi Nghiên Cứu Khoa Học Sinh Viên",
    description: "Nộp tóm tắt báo cáo khoa học, sơ đồ minh họa và kết quả nghiên cứu. Yêu cầu định dạng PDF.",
    startDate: "2026-06-15T00:00",
    endDate: "2026-08-30T17:00",
    allowedTypes: ["pdf", "image"],
    maxFileSizeMb: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: "comp-3",
    title: "Hội Thi Nhiếp Ảnh & Truyền Thông Thương Hiệu",
    description: "Nộp tác phẩm dự thi gồm hình ảnh chụp thực tế hoặc poster thiết kế (PNG, JPG, WEBP).",
    startDate: "2026-07-10T08:00",
    endDate: "2026-11-20T23:59",
    allowedTypes: ["image"],
    maxFileSizeMb: 15,
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_SERVER_SUBMISSIONS = [
  {
    id: "SUB-2026-8812",
    competitionId: "comp-1",
    competitionTitle: "Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026",
    fullName: "Nguyễn Văn An",
    phoneNumber: "0901234567",
    email: "nguyenvanan@gmail.com",
    studentCode: "SV202601",
    notes: "Bài dự thi thiết kế giao diện ứng dụng di động thông minh.",
    fileName: "Thiet_Ke_Giao_Dien_NguyenVanAn.pdf",
    fileSize: 2458000,
    fileType: "application/pdf",
    fileData: "data:application/pdf;base64,JVBERi0xLjQKJ...",
    submittedAt: "2026-07-20T14:30:00.000Z",
    status: "approved",
  },
  {
    id: "SUB-2026-9041",
    competitionId: "comp-1",
    competitionTitle: "Cuộc Thi Sáng Tạo Thiết Kế & Ý Tưởng 2026",
    fullName: "Trần Thị Mai",
    phoneNumber: "0987654321",
    email: "tranmai@gmail.com",
    studentCode: "SV202609",
    notes: "File thiết kế poster truyền thông cuộc thi.",
    fileName: "Poster_Duan_TranThiMai.png",
    fileSize: 1840000,
    fileType: "image/png",
    fileData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    submittedAt: "2026-07-21T09:15:00.000Z",
    status: "pending",
  }
];

function readCompetitionsFile() {
  try {
    if (!fs.existsSync(COMPS_FILE)) {
      fs.writeFileSync(COMPS_FILE, JSON.stringify(DEFAULT_SERVER_COMPETITIONS, null, 2), "utf-8");
      return DEFAULT_SERVER_COMPETITIONS;
    }
    const data = fs.readFileSync(COMPS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading competitions file:", e);
    return DEFAULT_SERVER_COMPETITIONS;
  }
}

function writeCompetitionsFile(data: any) {
  try {
    fs.writeFileSync(COMPS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing competitions file:", e);
  }
}

function readSubmissionsFile() {
  try {
    if (!fs.existsSync(SUBS_FILE)) {
      fs.writeFileSync(SUBS_FILE, JSON.stringify(DEFAULT_SERVER_SUBMISSIONS, null, 2), "utf-8");
      return DEFAULT_SERVER_SUBMISSIONS;
    }
    const data = fs.readFileSync(SUBS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading submissions file:", e);
    return DEFAULT_SERVER_SUBMISSIONS;
  }
}

function writeSubmissionsFile(data: any) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing submissions file:", e);
  }
}

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

// Competitions API Endpoints
app.get("/api/competitions", (req, res) => {
  const comps = readCompetitionsFile();
  res.json({ success: true, data: comps });
});

app.post("/api/competitions", (req, res) => {
  const comp = req.body;
  if (!comp || !comp.id || !comp.title) {
    return res.status(400).json({ success: false, error: "Dữ liệu cuộc thi không hợp lệ" });
  }
  const comps = readCompetitionsFile();
  const idx = comps.findIndex((c: any) => c.id === comp.id);
  if (idx >= 0) {
    comps[idx] = comp;
  } else {
    comps.unshift(comp);
  }
  writeCompetitionsFile(comps);
  res.json({ success: true, data: comp });
});

app.delete("/api/competitions/:id", (req, res) => {
  const { id } = req.params;
  let comps = readCompetitionsFile();
  comps = comps.filter((c: any) => c.id !== id);
  writeCompetitionsFile(comps);
  res.json({ success: true, id });
});

// Submissions API Endpoints
app.get("/api/submissions", (req, res) => {
  const subs = readSubmissionsFile();
  res.json({ success: true, data: subs });
});

app.post("/api/submissions", (req, res) => {
  const sub = req.body;
  if (!sub || !sub.id || !sub.fullName) {
    return res.status(400).json({ success: false, error: "Dữ liệu bài nộp không hợp lệ" });
  }
  const subs = readSubmissionsFile();
  const idx = subs.findIndex((s: any) => s.id === sub.id);
  if (idx >= 0) {
    subs[idx] = sub;
  } else {
    subs.unshift(sub);
  }
  writeSubmissionsFile(subs);
  res.json({ success: true, data: sub });
});

app.delete("/api/submissions/:id", (req, res) => {
  const { id } = req.params;
  let subs = readSubmissionsFile();
  subs = subs.filter((s: any) => s.id !== id);
  writeSubmissionsFile(subs);
  res.json({ success: true, id });
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
