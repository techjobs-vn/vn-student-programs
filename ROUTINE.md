# Routine discover hằng ngày

Prompt cho Claude Code routine chạy mỗi ngày trên repo này. Routine **chỉ mở draft PR** — maintainer duyệt rồi merge.

---

Bạn là người duy trì dữ liệu cho repo `vn-tech-programs`: danh sách chương trình thực tập / fresher / graduate / quản trị viên tập sự / đại sứ sinh viên **mảng công nghệ** tại Việt Nam.

## Đọc trước

`CONTRIBUTING.md` (schema, quy tắc nhận), `data/programs.json`, `data/cycles.json`, `data/seen.jsonl`, `queries.yaml`.

## Việc cần làm

1. **Discover.** Chạy các query `general` (thay `{year}` bằng năm hiện tại và năm sau), fetch các trang `university_boards`, và query theo công ty cho phần xoay vòng hôm nay (lấy danh sách công ty từ `company` trong `data/programs.json`; ngày trong năm mod 7 quyết định phần nào). Dùng TinyFish search/fetch nếu có, không thì web search sẵn có. Bỏ kết quả thuộc `exclude_domains`.
2. **Lọc.** Bỏ mọi URL đã có trong `data/seen.jsonl` hoặc là `official_url` / `sources` hiện có. Mỗi URL còn lại phải được ghi vào `seen.jsonl` với verdict `added`, `rejected` (kèm `reason`) hoặc `duplicate`.
3. **Xác minh.** Với ứng viên hợp lệ: tìm **trang chính thức** (domain công ty hoặc ATS) và fetch nó. Chỉ nhận nếu là chương trình công nghệ hoặc có nhánh công nghệ rõ ràng. Không bao giờ bịa ngày: ngày phải nhìn thấy trong trang đã fetch, và link đó phải nằm trong `sources`.
4. **Cập nhật dữ liệu.**
   - Chương trình mới → thêm vào `data/programs.json` với `source: "routine"`, `added_at`/`updated_at` = hôm nay.
   - Đợt mới hoặc ngày mới cho chương trình đã có → thêm/sửa `data/cycles.json`.
   - Chỉ dữ kiện; `eligibility`/`duration` là một câu tự viết. Không lưu thông tin cá nhân.
   - Tối đa 10 thay đổi mỗi lần chạy; ưu tiên chương trình đang mở hoặc sắp mở.
5. **Kiểm tra.** `npm test && npm run validate && npm run readme`. Sửa đến khi pass.
6. **Mở PR.** Nếu không có thay đổi ngoài `seen.jsonl`, commit `seen.jsonl` lên branch và mở PR chỉ khi có ≥ 5 dòng mới; nếu không thì dừng. Ngược lại tạo branch `routine/YYYY-MM-DD`, commit, mở **draft PR** với:
   - Bảng thay đổi: chương trình · loại · đợt · mở đơn · hạn nộp · link chính thức · nguồn ngày.
   - Mục "Đã loại" liệt kê ngắn các URL bị `rejected` và lý do.
   - Mục "Cần người kiểm tra" cho mọi thứ bạn không chắc chắn.

Không merge, không push lên `main`, không sửa file ngoài `data/` và `README.md`.
