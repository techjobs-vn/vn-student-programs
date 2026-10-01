# Đóng góp

Cảm ơn bạn đã muốn bổ sung! Cách nhanh nhất là **mở issue** — bạn không cần biết Git.

## Gửi chương trình mới

1. Mở [issue "Gửi chương trình"](https://github.com/techjobs-vn/vn-tech-programs/issues/new?template=new_program.yml) và điền form.
2. Maintainer kiểm tra rồi thêm vào dữ liệu. README tự cập nhật sau khi merge.

Chương trình được nhận khi:

- Là chương trình **công nghệ**, hoặc có **nhánh công nghệ rõ ràng** (ví dụ ngân hàng có track IT/Data).
- Do công ty/tổ chức tổ chức cho sinh viên hoặc người mới tốt nghiệp tại Việt Nam: thực tập, fresher, graduate, quản trị viên tập sự, đại sứ sinh viên của công ty công nghệ.
- Có **trang chính thức** trên domain của công ty hoặc ATS (Workday, SuccessFactors, Greenhouse…). Bài Facebook, LinkedIn hoặc bài đăng lại của trường được dùng làm **nguồn cho ngày tháng**, không dùng làm link chính.
- Chưa có trong danh sách.

Không nhận: tin tuyển một vị trí lẻ (hãy xem trên [techjobs.vn](https://techjobs.vn)), khoá học thu phí, chương trình ngoài mảng công nghệ.

## Báo cập nhật

Chương trình mở đợt mới, đổi hạn nộp, đã đóng hay link hỏng → mở [issue "Báo cập nhật"](https://github.com/techjobs-vn/vn-tech-programs/issues/new?template=update_program.yml), kèm link nguồn.

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
| `type` | ✓ | `internship` · `fresher` · `graduate` · `management_trainee` · `ambassador` |
| `company.name` | ✓ | |
| `company.slug` | ✓ | Slug công ty trên techjobs.vn (`techjobs.vn/companies/<slug>`), hoặc `null` |
| `official_url` | ✓ | https, domain công ty/ATS; không nhận mạng xã hội |
| `tracks` | | Các nhánh/lĩnh vực |
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

### `data/seen.jsonl`

Mỗi dòng một URL đã xét, để quy trình tự động không đề xuất lại:

```json
{"url": "https://...", "first_seen": "2026-10-01", "verdict": "added", "program_slug": "viettel-digital-talent"}
```

`verdict`: `added` · `rejected` · `duplicate`. Khi `rejected`, ghi thêm `reason` (ví dụ `"không phải công nghệ"`).

## Quy tắc nội dung

- Chỉ lưu **dữ kiện** (tên, ngày, điều kiện tóm tắt, link). Không copy mô tả dài, ảnh, banner.
- Không lưu thông tin cá nhân (tên, số điện thoại, email riêng của người tuyển dụng).
