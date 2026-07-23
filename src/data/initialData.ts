import { DocumentItem, Folder, DocumentTemplate } from '../types';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'f-work',
    name: 'Công việc & Dự án',
    icon: 'Briefcase',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    description: 'Báo cáo, kế hoạch, đề xuất và biên bản dự án'
  },
  {
    id: 'f-meetings',
    name: 'Ghi chú & Cuộc họp',
    icon: 'Users',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    description: 'Biên bản họp tuần, ghi chú thảo luận và hành động'
  },
  {
    id: 'f-study',
    name: 'Học tập & Nghiên cứu',
    icon: 'BookOpen',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    description: 'Tài liệu đào tạo, kiến thức chuyên môn và ghi chép'
  },
  {
    id: 'f-ideas',
    name: 'Cá nhân & Ý tưởng',
    icon: 'Sparkles',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    description: 'Ý tưởng sáng tạo, mục tiêu cá nhân và lưu trữ nhanh'
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Chào mừng đến với SmartDoc AI',
    icon: '🚀',
    folderId: 'f-work',
    tags: ['HướngDẫn', 'KhởiĐầu', 'SmartDoc'],
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    content: `# 🚀 Chào mừng đến với ứng dụng Soạn thảo & Quản lý Tài liệu SmartDoc AI!

SmartDoc là workspace làm việc thông minh giúp bạn **soạn thảo, quản lý, phân loại và tối ưu hóa tài liệu** một cách chuyên nghiệp với sự hỗ trợ từ **Trợ lý AI Gemini**.

---

### ✨ Các tính năng nổi bật:

1. **Soạn thảo Markdown mạnh mẽ**:
   - Tùy chỉnh Tiêu đề, Danh sách công việc, Khối ghi chú, Bảng biểu.
   - Chế độ **Xem song song (Split View)**, **Xem trước (Preview)** hoặc **Tập trung tuyệt đối (Zen Mode)**.

2. **Trợ lý AI Thông Minh (Gemini AI)**:
   - 🪄 **Viết dự thảo tự động**: Tạo nội dung báo cáo, hợp đồng, kế hoạch từ gợi ý ngắn.
   - 📑 **Tóm tắt tài liệu**: Trích xuất các điểm cốt lõi và danh sách việc cần làm (Action items).
   - 🔍 **Sửa lỗi & Nâng cấp văn phong**: Tối ưu ngữ pháp, từ vựng và phong cách văn bản.
   - 🌐 **Dịch thuật đa ngôn ngữ**: Dịch nhanh sang Anh, Nhật, Pháp, Trung...

3. **Quản lý & Lưu trữ khoa học**:
   - Phân loại theo **Thư mục**, **Thẻ đánh dấu (Tags)**, **Yêu thích**.
   - Lưu vết **Lịch sử phiên bản (Version History)** giúp bạn khôi phục lại tài liệu bất kỳ lúc nào.
   - Xuất tài liệu linh hoạt dưới dạng \`.md\`, \`.html\`, \`.txt\` hoặc in PDF.

> 💡 **Mẹo:** Nhấn vào nút **Trợ lý AI** trên thanh công cụ hoặc chọn đoạn văn bản bất kỳ để trải nghiệm khả năng sáng tạo của Gemini!

---

### 📋 Danh sách công việc cần thử nghiệm ngay:

- [x] Khám phá các thư mục và thẻ ở thanh bên trái.
- [ ] Bấm nút **Trợ lý AI** để tạo một dự thảo văn bản mới.
- [ ] Thử xuất tài liệu ra tập tin Markdown.
- [ ] Đánh dấu Sao (Favorite) tài liệu quan trọng này.
`,
    versionHistory: [
      {
        id: 'v1-1',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        title: 'Chào mừng đến với SmartDoc AI',
        content: '# Chào mừng đến với SmartDoc AI\n\nĐây là tài liệu khởi đầu.',
        note: 'Phiên bản ban đầu'
      }
    ]
  },
  {
    id: 'doc-2',
    title: 'Đề xuất Chiến lược Phát triển Dự án Q3',
    icon: '📊',
    folderId: 'f-work',
    tags: ['ChiếnLược', 'DựÁn', 'Q3_2026', 'KếHoạch'],
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    content: `# 📊 Đề xuất Chiến lược Phát triển Sản phẩm Q3 - 2026

**Người lập:** Nguyễn Văn An - Trưởng phòng Sản phẩm  
**Ngày tạo:** 20/07/2026  
**Trạng thái:** DRAFT / Đang xem xét  

---

## 🎯 1. Mục tiêu trọng tâm (OKRs)

- **Mục tiêu 1 (O1):** Tăng trưởng số lượng người dùng tích cực hàng tháng (MAU) thêm **35%**.
  - *KR1:* Ra mắt tính năng Cộng tác Tài liệu Thời gian thực trước ngày 15/08.
  - *KR2:* Đạt chỉ số hài lòng khách hàng (CSAT) trên **92%**.

- **Mục tiêu 2 (O2):** Tối ưu hóa hiệu năng ứng dụng và trải nghiệm người dùng.
  - *KR1:* Giảm thời gian tải trang xuống dưới **800ms**.
  - *KR2:* Giảm tỷ lệ lỗi ứng dụng xuống dưới **0.05%**.

---

## 🛠️ 2. Lộ trình triển khai (Roadmap)

| Giai đoạn | Thời gian | Công việc chính | Tình trạng |
| :--- | :--- | :--- | :--- |
| **P1** | Tuần 1-2 | Thiết kế UI/UX mới & Tích hợp AI Engine | ✅ Hoàn thành |
| **P2** | Tuần 3-5 | Phát triển hệ thống quản lý phiên bản | ⏳ Đang thực hiện |
| **P3** | Tuần 6-8 | Kiểm thử bảo mật & Tối ưu hóa lưu trữ | 🛑 Chờ bắt đầu |

---

> ⚠️ **Lưu ý đặc biệt:** Cần phối hợp chặt chẽ với bộ phận Hạ tầng để chuẩn bị hệ thống CSDL đáp ứng lưu lượng truy cập cao trong đợt phát hành sắp tới.
`,
    versionHistory: []
  },
  {
    id: 'doc-3',
    title: 'Biên bản Cuộc họp Triển khai Kế hoạch Tuần 30',
    icon: '📝',
    folderId: 'f-meetings',
    tags: ['BiênBản', 'CuộcHọp', 'Tuần30'],
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    content: `# 📝 Biên bản Cuộc họp Triển khai Kế hoạch Tuần 30

**Thời gian:** 09:00 - 10:30, Thứ Hai ngày 22/07/2026  
**Địa điểm:** Phòng họp A1 & Google Meet  
**Thành phần tham dự:** Anh Bình (PM), Chị Mai (Design), Anh Khoa (Frontend), Anh Tuấn (Backend)  

---

### 1. Tóm tắt tình hình tuần trước
- Đã hoàn thành sửa 12 lỗi tồn đọng trên môi trường Staging.
- Đã bàn giao tài liệu thiết kế giao diện Soạn thảo nâng cao.

### 2. Các hành động tiếp theo (Action Items):
- [ ] **Anh Khoa:** Cập nhật công cụ định dạng bảng cho Editor (Hạn chót: 24/07).
- [ ] **Anh Tuấn:** Xây dựng API tích hợp AI Gemini cho chức năng tóm tắt (Hạn chót: 25/07).
- [ ] **Chị Mai:** Hoàn thiện Iconset tùy chỉnh cho các danh mục tài liệu (Hạn chót: 26/07).
`,
    versionHistory: []
  },
  {
    id: 'doc-4',
    title: 'Quy trình Vận hành Tiêu chuẩn (SOP) Nội dung',
    icon: '📚',
    folderId: 'f-study',
    tags: ['SOP', 'QuyTrình', 'ĐàoTạo'],
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    content: `# 📚 Quy trình Kiểm duyệt & Xuất bản Tài liệu (SOP-08)

### 1. Mục đích
Đảm bảo tất cả tài liệu ban hành tuân thủ chuẩn mực chất lượng, chính xác về mặt nội dung và nhất quán về hình thức.

### 2. Các bước thực hiện:
1. **Khởi tạo dự thảo:** Tạo tài liệu mới từ Mẫu chuẩn trên SmartDoc.
2. **Kiểm tra tự động với AI:** Sử dụng Trợ lý AI để rà soát lỗi chính tả và định dạng.
3. **Phê duyệt nội dung:** Gửi tài liệu cho Quản lý trực tiếp thẩm định.
4. **Lưu trữ & Ban hành:** Phân loại vào thư mục tương ứng và gán Nhãn thích hợp.
`,
    versionHistory: []
  }
];

export const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tmpl-meeting',
    name: 'Biên bản cuộc họp',
    category: 'CongViec',
    description: 'Mẫu ghi chép diễn biến cuộc họp, ý kiến thảo luận và công việc được giao.',
    icon: 'Users',
    tags: ['CuộcHọp', 'GhiChú'],
    content: `# 📝 Biên bản Cuộc họp: [Tên Cuộc Họp]

**Thời gian:** [HH:MM - DD/MM/YYYY]  
**Địa điểm:** [Phòng họp / Online]  
**Chủ trì:** [Họ và tên]  
**Thư ký:** [Họ và tên]  
**Thành phần tham dự:** [Danh sách người tham dự]  

---

### 1. Mục tiêu cuộc họp
- 

### 2. Nội dung thảo luận & Báo cáo
- **Nội dung 1:** ...
- **Nội dung 2:** ...

### 3. Kết luận & Phân công công việc (Action Items)
- [ ] **[Tên người nhận]:** [Nội dung công việc] (Hạn chót: DD/MM/YYYY)
- [ ] **[Tên người nhận]:** [Nội dung công việc] (Hạn chót: DD/MM/YYYY)
`
  },
  {
    id: 'tmpl-proposal',
    name: 'Đề xuất Dự án / Kế hoạch',
    category: 'DuAn',
    description: 'Dành cho việc đề xuất dự án mới, tính năng mới hoặc kế hoạch triển khai.',
    icon: 'Rocket',
    tags: ['ĐềXuất', 'DựÁn'],
    content: `# 🚀 Đề xuất Dự án: [Tên Dự Án]

**Đơn vị đề xuất:** [Tên phòng ban / Tên tác giả]  
**Ngày lập:** [DD/MM/YYYY]  

---

## 1. Bối cảnh & Lý do thực hiện
[Mô tả vấn đề hiện tại hoặc cơ hội cần nắm bắt...]

## 2. Mục tiêu dự án
- **Mục tiêu định lượng:** 
- **Mục tiêu định tính:** 

## 3. Phạm vi & Tóm tắt giải pháp
[Mô tả giải pháp đề xuất...]

## 4. Dự toán nguồn lực & Chi phí
- **Nhân sự cần thiết:** 
- **Ngân sách dự kiến:** 

## 5. Lộ trình triển khai (Timeline)
- **Giai đoạn 1 (Chuẩn bị):** 
- **Giai đoạn 2 (Thực thi):** 
- **Giai đoạn 3 (Đánh giá):** 
`
  },
  {
    id: 'tmpl-weekly',
    name: 'Báo cáo Tiến độ Tuần',
    category: 'CongViec',
    description: 'Báo cáo kết quả công việc đã hoàn thành, tồn đọng và kế hoạch tuần tiếp theo.',
    icon: 'Calendar',
    tags: ['BáoCáo', 'Tuần'],
    content: `# 📅 Báo cáo Công việc Tuần [Số tuần] - [Tháng/Năm]

**Họ và tên:** [Tên người báo cáo]  
**Vị trí:** [Chức danh]  

---

### ✅ 1. Công việc đã hoàn thành trong tuần
- [x] Công việc 1: [Chi tiết kết quả]
- [x] Công việc 2: [Chi tiết kết quả]

### ⏳ 2. Công việc đang xử lý / Tồn đọng
- [ ] Công việc A (Đạt 70% - Lý do chưa xong: ...)

### 💡 3. Khó khăn & Đề xuất hỗ trợ
- 

### 🎯 4. Kế hoạch trọng tâm tuần tới
- [ ] Nhiệm vụ 1 (Ưu tiên cao)
- [ ] Nhiệm vụ 2
`
  },
  {
    id: 'tmpl-sop',
    name: 'Quy trình Vận hành SOP',
    category: 'NhanSu',
    description: 'Mẫu hướng dẫn từng bước quy trình làm việc chuẩn cho phòng ban.',
    icon: 'FileText',
    tags: ['SOP', 'HướngDẫn'],
    content: `# 📖 Hướng dẫn Quy trình: [Tên Quy Trình]

**Mã quy trình:** SOP-[XXX]  
**Áp dụng cho:** [Đối tượng / Phòng ban]  

---

### 1. Mục đích
[Nêu rõ lý do ban hành quy trình...]

### 2. Các thuật ngữ & Bảng viết tắt
- **SOP:** Standard Operating Procedure
- **...:** ...

### 3. Quy trình thực hiện chi tiết

| Bước | Người thực hiện | Nội dung chi tiết | Sản phẩm đầu ra |
| :--- | :--- | :--- | :--- |
| **B1** | Nhân viên | Tiếp nhận yêu cầu | Phiếu thông tin |
| **B2** | Trưởng nhóm | Duyệt thông tin | Quyết định duyệt |
| **B3** | Chuyên viên | Thực thi công việc | Báo cáo hoàn thành |
`
  },
  {
    id: 'tmpl-idea',
    name: 'Ghi chú Ý tưởng Sáng tạo',
    category: 'YTuong',
    description: 'Nơi phác thảo ý tưởng mới, mô hình kinh doanh hoặc ghi chép nhanh.',
    icon: 'Lightbulb',
    tags: ['ÝTưởng', 'SángTạo'],
    content: `# 💡 Ý tưởng: [Tên Ý Tưởng]

**Ngày nảy ra ý tưởng:** [DD/MM/YYYY]  
**Chủ đề:** [Công nghệ / Sản phẩm / Marketing / ...]  

---

### 🌟 1. Điểm độc đáo của ý tưởng
[Viết ngắn gọn 2-3 câu về điểm đặc biệt nhất...]

### ❓ 2. Vấn đề giải quyết cho ai?
- **Khách hàng mục tiêu:** 
- **Nỗi đau (Pain point):** 

### 🛠️ 3. Phác thảo giải pháp
- Điểm 1:
- Điểm 2:

### 🚀 4. Các bước thử nghiệm nhanh (MVP)
- [ ] Lập khảo sát 10 khách hàng đầu tiên
- [ ] Tạo mẫu phác thảo sơ bộ (Wireframe)
`
  }
];
