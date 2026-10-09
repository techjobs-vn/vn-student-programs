# Đóng góp

Cảm ơn bạn đã muốn bổ sung! Cách nhanh nhất là **mở issue** — bạn không cần biết Git.

## Gửi chương trình mới

1. Mở [issue "Gửi chương trình"](https://github.com/techjobs-vn/vn-student-programs/issues/new?template=new_program.yml) và điền form.
2. Maintainer kiểm tra rồi thêm vào dữ liệu. README tự cập nhật sau khi merge.

Chương trình được nhận khi:

- Là **chương trình có tên** (không phải tin tuyển một vị trí), thuộc [phạm vi](#phạm-vi) bên dưới.
- Do công ty/tổ chức tổ chức cho sinh viên hoặc người mới tốt nghiệp tại Việt Nam: thực tập, fresher, graduate, quản trị viên tập sự, học bổng kèm thực tập, đại sứ sinh viên.
- Có **trang chính thức** trên domain của công ty hoặc ATS (Workday, SuccessFactors, Greenhouse…). Bài Facebook, LinkedIn hoặc bài đăng lại của trường được dùng làm **nguồn cho ngày tháng**, không dùng làm link chính.
- Chưa có trong danh sách.

Không nhận: tin tuyển một vị trí lẻ (hãy xem trên [techjobs.vn](https://techjobs.vn)), khoá học thu phí. Xem [phạm vi](#phạm-vi).

### Phạm vi

Nhận chương trình **mọi ngành**, miễn là chương trình có tên, do công ty hoặc tổ chức tuyển dụng tại Việt Nam tổ chức cho sinh viên hoặc người mới tốt nghiệp. Mỗi chương trình ghi một hoặc nhiều **lĩnh vực** trong `fields`:

| `fields` | Lĩnh vực | Ví dụ |
| --- | --- | --- |
| `tech` | Công nghệ | Phần mềm, dữ liệu/AI, bảo mật, cloud, vi mạch/phần cứng, product, UX/UI, data analytics, quant |
| `finance` | Tài chính – Ngân hàng – Bảo hiểm | Tín dụng, quản lý rủi ro, đầu tư, môi giới, định phí |
| `audit-consulting` | Kiểm toán – Thuế – Tư vấn | Big4, tư vấn quản lý, pháp chế, tuân thủ |
| `business` | Kinh doanh – Marketing | Sales, marketing, brand, thương mại điện tử, chiến lược |
| `operations` | Vận hành – Chuỗi cung ứng | Logistics, thu mua, vận hành |
| `engineering` | Kỹ thuật – Sản xuất | Cơ khí, điện, ô tô, quy trình sản xuất, R&D sản phẩm vật lý |
| `hr` | Nhân sự | Tuyển dụng, đào tạo, C&B |
| `general` | Quản trị tổng hợp | MT luân chuyển chung, không gắn ngành cụ thể |

Chương trình MT nhiều nhánh ghi đủ các lĩnh vực của các nhánh; `tracks` liệt kê tên nhánh.

**Học bổng** (`scholarship`): nhận học bổng **có tên và có đợt nộp đơn** dành cho sinh viên hoặc người mới tốt nghiệp ở Việt Nam, gồm: học bổng của công ty, quỹ, tổ chức; học bổng của chính phủ hoặc tổ chức nước ngoài (Fulbright, Chevening, Australia Awards, MEXT, KGSP, DAAD, Erasmus Mundus...); học bổng của trường đại học mà người ngoài trường cũng nộp được. Trang chính thức phải là trang của đơn vị cấp học bổng. Ghi bậc học và nước đến trong `eligibility`, lĩnh vực trong `fields` (không rõ ngành thì `general`).

Không nhận học bổng chỉ dành cho một địa phương, học bổng của một trường cho sinh viên của chính trường, học bổng tự động xét theo điểm không cần nộp đơn, và học bổng không có trang chính thức.

Không nhận: tin tuyển một vị trí lẻ, khoá học thu phí, cuộc thi không kèm tuyển dụng, chương trình trao đổi ngắn hạn do trường tổ chức (không phải học bổng).

## Báo cập nhật

Chương trình mở đợt mới, đổi hạn nộp, đã đóng hay link hỏng → mở [issue "Báo cập nhật"](https://github.com/techjobs-vn/vn-student-programs/issues/new?template=update_program.yml), kèm link nguồn.

## Sửa trực tiếp bằng Pull Request

```bash
npm test            # unit test
npm run validate    # kiểm tra dữ liệu
npm run readme      # sinh lại bảng trong README (CI cũng tự làm sau khi merge)
```

Không cần cài package nào, chỉ cần Node.js ≥ 22.

### `data/programs.json`

```json
{
  "slug": "viettel-digital-talent",
  "name": "Viettel Digital Talent",
  "type": "internship",
  "company": { "name": "Viettel", "slug": "viettel" },
  "official_url": "https://tuyendung.viettel.vn/page/page-digitalTalent",
  "tracks": ["Cloud", "Cyber Security", "Data Science & AI"],
  "duration": "6 tháng",
  "eligibility": "Sinh viên năm cuối hoặc mới tốt nghiệp các ngành kỹ thuật, CNTT.",
  "recurring": "yearly",
  "active": true,
  "is_visible": true,
  "source": "manual",
  "added_at": "2026-10-01",
  "updated_at": "2026-10-01"
}
```

| Trường | Bắt buộc | Ghi chú |
| --- | :---: | --- |
| `slug` | ✓ | kebab-case, duy nhất; nên không chứa năm vì chương trình lặp lại hằng năm |
| `name` | ✓ | Tên chính thức của chương trình |
| `type` | ✓ | `internship` · `fresher` · `graduate` · `management_trainee` · `ambassador` · `scholarship` |
| `company.name` | ✓ | |
| `company.slug` | ✓ | Slug công ty trên techjobs.vn (`techjobs.vn/companies/<slug>`), hoặc `null` |
| `company.domain` | | Domain website công ty, không có `https://` (ví dụ `ey.com`); dùng để lấy logo khi công ty chưa có trên techjobs.vn |
| `official_url` | ✓ | https, domain công ty/ATS; không nhận mạng xã hội |
| `description` | | 1–2 câu tiếng Việt (tối đa 280 ký tự) tóm tắt chương trình và đối tượng; chỉ dùng thông tin có nguồn |
| `tracks` | | Tên các nhánh/vị trí trong chương trình |
| `fields` | ✓ | Lĩnh vực, một hoặc nhiều: `tech` · `finance` · `audit-consulting` · `business` · `operations` · `engineering` · `hr` · `general` (xem [phạm vi](#phạm-vi)) |
| `duration`, `eligibility` | | Một câu ngắn, tự viết — không copy nguyên văn |
| `recurring` | ✓ | `yearly` · `multiple` · `unknown` |
| `active` | ✓ | `false` khi chương trình ngừng hẳn |
| `is_visible` | ✓ | `false` để ẩn khỏi README mà không xoá dữ liệu |
| `source` | ✓ | `manual` · `routine` · `github:<username>` |
| `added_at`, `updated_at` | ✓ | `YYYY-MM-DD` |

### `data/cycles.json`

Mỗi chương trình có thể có nhiều đợt, một đợt mỗi năm (`program_slug` + `year` là duy nhất). `year` là **năm mở đơn** (ví dụ Techcombank Future Gen tuyển năm 2026 cho khoá "TFG 2027" → `year: 2026`). README dùng đợt có `year` lớn nhất.

```json
{
  "program_slug": "viettel-digital-talent",
  "year": 2026,
  "opens_at": "2026-02-12",
  "deadline": "2026-03-15",
  "sources": ["https://viettelfamily.com/news/viettel-talent-2026-chinh-thuc-mo-cong-dang-ky"],
  "updated_at": "2026-10-01"
}
```

- `opens_at`, `deadline`: `YYYY-MM-DD` hoặc `null` nếu chưa rõ.
- `status` (tuỳ chọn): `open` · `upcoming` · `closed` · `unknown` — **chỉ dùng khi không có ngày** (validate báo lỗi nếu có cả hai). Khi có ngày, trạng thái luôn được tính từ ngày.
- `year` phải khớp năm của `opens_at`; nếu chỉ biết `deadline` thì là năm đó hoặc năm trước.
- Khi một chương trình có nhiều đợt, README ưu tiên đợt mới nhất **có ngày**.
- `sources`: bắt buộc khi có ngày hoặc `status` — link nơi bạn thấy thông tin.

### `data/details.json`

Nội dung trang chi tiết của từng chương trình (không bắt buộc, mỗi chương trình tối đa một mục). Chỉ ghi dữ kiện có trong nguồn, tự viết lại bằng tiếng Việt; mục nào không có nguồn thì bỏ key đó.

```json
{
  "program_slug": "viettel-digital-talent",
  "overview": "2–4 câu: chương trình là gì, dành cho ai, kéo dài bao lâu.",
  "eligibility": ["Sinh viên năm 3, năm 4 hoặc mới tốt nghiệp ngành kỹ thuật, CNTT"],
  "benefits": ["Trợ cấp hằng tháng trong thời gian thực tập"],
  "selection_process": ["Vòng 1: nộp hồ sơ online", "Vòng 2: phỏng vấn"],
  "locations": ["Hà Nội"],
  "stipend": "Một câu về mức trợ cấp nếu nguồn nêu rõ",
  "faq": [{ "q": "Câu hỏi?", "a": "Câu trả lời có trong nguồn." }],
  "sources": ["https://tuyendung.viettel.vn/page/page-digitalTalent"],
  "confidence": "high",
  "updated_at": "2026-10-08"
}
```

- Bắt buộc: `program_slug`, `overview`, `sources` (1–6 link https đã đọc, trang chính thức đứng đầu), `confidence` (`high` · `medium`), `updated_at`.
- Danh sách tối đa: `eligibility` 6, `benefits` 6, `selection_process` 8, `locations` 6, `faq` 5; mỗi ý tối đa 240 ký tự, `overview` tối đa 700.
- Không đưa link, email, số điện thoại vào nội dung (validate sẽ báo lỗi).
- Có thể tạo tự động: `node scripts/research-details.mjs` (cursor-agent + TinyFish, kết quả thô ở `.cache/details/`), rồi `node scripts/research-details.mjs --merge` để lọc, bỏ kết quả độ tin cậy thấp và ghi vào file này.

### `data/seen.jsonl`

Mỗi dòng một URL đã xét, để quy trình tự động không đề xuất lại:

```json
{"url": "https://...", "first_seen": "2026-10-01", "verdict": "added", "program_slug": "viettel-digital-talent"}
```

`verdict`: `added` · `rejected` · `duplicate`. Khi `rejected`, ghi thêm `reason` (ví dụ `"không phải công nghệ"`).

## Quy tắc nội dung

- Chỉ lưu **dữ kiện** (tên, ngày, điều kiện tóm tắt, link). Không copy mô tả dài, ảnh, banner.
- Không lưu thông tin cá nhân (tên, số điện thoại, email riêng của người tuyển dụng).
