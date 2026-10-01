# 🇻🇳 Chương trình cho sinh viên công nghệ tại Việt Nam

Danh sách **chương trình thực tập, fresher, graduate và quản trị viên tập sự mảng công nghệ** của các công ty tại Việt Nam — tổng hợp một chỗ, có trạng thái mở/đóng và hạn nộp.

Phần lớn các chương trình này **không nằm trên trang tuyển dụng thường**: chúng mở theo mùa, ở landing page riêng hoặc chỉ được đăng trên Facebook. Repo này gom chúng lại để bạn không lỡ đợt.

- 🔔 **Nhắc khi chương trình mở đơn**, xem job thực tập đang tuyển và người giới thiệu tại công ty: [techjobs.vn](https://techjobs.vn/?utm_source=github&utm_medium=vn-tech-programs)
- ➕ **Biết một chương trình chưa có trong danh sách?** [Gửi chương trình](https://github.com/techjobs-vn/vn-tech-programs/issues/new?template=new_program.yml)
- ✏️ **Thông tin sai hoặc chương trình đã đóng?** [Báo cập nhật](https://github.com/techjobs-vn/vn-tech-programs/issues/new?template=update_program.yml)

**Phạm vi:** chỉ chương trình công nghệ (phần mềm, dữ liệu/AI, bảo mật, hạ tầng, bán dẫn, sản phẩm…) hoặc chương trình có nhánh công nghệ rõ ràng. Trạng thái được tính tự động từ ngày mở đơn/hạn nộp mỗi ngày.

## Danh sách

<!-- PROGRAMS:START — tự sinh bởi scripts/render-readme.mjs, đừng sửa tay -->
_Cập nhật: 01/10/2026 · 0 chương trình · 0 đang mở_

_Chưa có chương trình nào đang mở hoặc sắp mở._
<!-- PROGRAMS:END -->

## Chú thích

| Trạng thái | Ý nghĩa |
| --- | --- |
| 🟢 Đang mở | Đã mở đơn và chưa qua hạn nộp |
| 🟡 Sắp mở | Đã công bố ngày mở đơn trong tương lai |
| ⚪ Chưa rõ | Chưa có thông tin ngày cho đợt gần nhất |
| 🔴 Đã đóng | Đã qua hạn nộp của đợt gần nhất — nhiều chương trình mở lại hằng năm |

Ngày tháng lấy từ trang chính thức hoặc bài đăng lại có dẫn nguồn (xem `sources` trong [`data/cycles.json`](data/cycles.json)). **Luôn kiểm tra lại trên trang chính thức trước khi nộp.**

## Dữ liệu

Toàn bộ dữ liệu nằm trong [`data/`](data/) dưới dạng JSON, dùng tự do cho dự án của bạn:

- [`data/programs.json`](data/programs.json) — chương trình (thông tin ít thay đổi qua các năm)
- [`data/cycles.json`](data/cycles.json) — từng đợt tuyển: năm, ngày mở đơn, hạn nộp, nguồn
- [`data/seen.jsonl`](data/seen.jsonl) — các URL đã được xét (để không đề xuất lặp)

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết schema và cách đóng góp.

## Giấy phép

Mã nguồn: [MIT](LICENSE). Dữ liệu trong `data/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.vi) — dùng thoải mái, chỉ cần ghi nguồn **vn-tech-programs / techjobs.vn**.

Repo chỉ lưu thông tin dạng dữ kiện (tên, ngày, link). Mô tả chi tiết thuộc về trang chính thức của từng công ty.
