import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_BASE_URL = "https://kvdb.io/6P7aX9mK1bQv3L0z8W9n";

const DEFAULT_SUBMISSIONS = [
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      let subs = DEFAULT_SUBMISSIONS;
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/submissions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            const data = JSON.parse(text);
            if (Array.isArray(data) && data.length > 0) {
              subs = data;
            }
          }
        }
      } catch (e) {
        console.warn("Vercel KV fetch submissions failed:", e);
      }
      return res.status(200).json({ success: true, data: subs });
    }

    if (req.method === "POST") {
      const newSub = req.body;
      if (!newSub || !newSub.id || !newSub.fullName) {
        return res.status(400).json({ success: false, error: "Dữ liệu bài nộp không hợp lệ" });
      }

      let currentSubs = DEFAULT_SUBMISSIONS;
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/submissions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) currentSubs = data;
          }
        }
      } catch (e) {}

      const idx = currentSubs.findIndex((s: any) => s.id === newSub.id);
      if (idx >= 0) {
        currentSubs[idx] = newSub;
      } else {
        currentSubs.unshift(newSub);
      }

      await fetch(`${KV_BASE_URL}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSubs)
      });

      return res.status(200).json({ success: true, data: newSub });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Thiếu ID bài nộp" });
      }

      let currentSubs: any[] = [];
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/submissions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            currentSubs = JSON.parse(text);
          }
        }
      } catch (e) {}

      const updated = currentSubs.filter((s: any) => s.id !== id);
      await fetch(`${KV_BASE_URL}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Lỗi Server" });
  }
}
