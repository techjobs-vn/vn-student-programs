---
description: Tìm chương trình mới / đợt mới theo ROUTINE.md rồi mở draft PR
argument-hint: "[tuỳ chọn: công ty hoặc chủ đề cần tập trung, ví dụ \"ngân hàng\" hoặc \"viettel\"]"
---

Chạy quy trình discover trong `ROUTINE.md` cho repo này, với các điều chỉnh khi chạy local dưới đây.

Trọng tâm lần chạy này (nếu có): $ARGUMENTS
Nếu có trọng tâm: vẫn kiểm tra nhanh các query `general`, nhưng dành phần lớn công sức cho trọng tâm đó, kể cả khi nó nằm ngoài phần xoay vòng của hôm nay.

## Điều chỉnh khi chạy local

1. **Chuẩn bị.** `git checkout main && git pull --ff-only`. Nếu working tree không sạch thì dừng và báo lại, không stash, không xoá thay đổi.
2. **Công cụ web.** Ưu tiên TinyFish MCP (`search`, `fetch_content`) nếu có; không thì dùng web search/fetch sẵn có.
3. **Branch.** `discover/YYYY-MM-DD` (ngày giờ Việt Nam). Nếu branch đã tồn tại, thêm hậu tố `-2`, `-3`…
4. **Tài khoản GitHub.** Trước khi push/mở PR, kiểm tra `gh api repos/techjobs-vn/vn-tech-programs --jq .permissions.push` trả `true`. Nếu không, xem `gh auth status`, chọn tài khoản có quyền và chạy các lệnh `gh` với `GH_TOKEN=$(gh auth token --user <tài-khoản>)`. Không đổi tài khoản active của `gh`.
5. **Email commit.** Commit phải dùng email noreply của GitHub (`git config user.email` kết thúc bằng `@users.noreply.github.com`). Nếu không phải, dừng và báo lại.
6. **PR.** `gh pr create --draft --base main --label routine`, nội dung PR theo bước 6 của `ROUTINE.md`.
7. **Kết thúc.** Trả về link PR (hoặc lý do không mở PR) và bảng tóm tắt: số URL đã xét, số chương trình/đợt thêm hoặc sửa, số bị loại, các mục cần người kiểm tra. Sau đó `git checkout main`.
