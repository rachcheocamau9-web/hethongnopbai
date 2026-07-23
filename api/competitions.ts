import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_BASE_URL = "https://kvdb.io/6P7aX9mK1bQv3L0z8W9n";

const DEFAULT_COMPETITIONS = [
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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
      let comps = DEFAULT_COMPETITIONS;
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/competitions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            const data = JSON.parse(text);
            if (Array.isArray(data) && data.length > 0) {
              comps = data;
            }
          }
        }
      } catch (e) {
        console.warn("Vercel KV fetch failed:", e);
      }
      return res.status(200).json({ success: true, data: comps });
    }

    if (req.method === "POST") {
      const newComp = req.body;
      if (!newComp || !newComp.id || !newComp.title) {
        return res.status(400).json({ success: false, error: "Dữ liệu cuộc thi không hợp lệ" });
      }

      let currentComps = DEFAULT_COMPETITIONS;
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/competitions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) currentComps = data;
          }
        }
      } catch (e) {}

      const idx = currentComps.findIndex((c: any) => c.id === newComp.id);
      if (idx >= 0) {
        currentComps[idx] = newComp;
      } else {
        currentComps.unshift(newComp);
      }

      await fetch(`${KV_BASE_URL}/competitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentComps)
      });

      return res.status(200).json({ success: true, data: newComp });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: "Thiếu ID cuộc thi" });
      }

      let currentComps: any[] = [];
      try {
        const kvRes = await fetch(`${KV_BASE_URL}/competitions`, { cache: "no-store" });
        if (kvRes.ok) {
          const text = await kvRes.text();
          if (text && text.trim().startsWith("[")) {
            currentComps = JSON.parse(text);
          }
        }
      } catch (e) {}

      const updated = currentComps.filter((c: any) => c.id !== id);
      await fetch(`${KV_BASE_URL}/competitions`, {
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
