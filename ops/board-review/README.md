# Board review bot

Chạy hằng ngày trên `le11` lúc 07:45 (giờ VN), sau khi các TinyFish monitor `vtp-board: …` chạy lúc 07:00.

1. Lấy link mới trong `DAYS` ngày (mặc định 3) từ bảng `tinyfish_monitor_runs` trên prod (`job-hub/scripts/dev/query_prod_db.py --preset monitor-links`), bỏ link đã có trong `data/seen.jsonl`.
2. `claude -p` với [`prompt.md`](prompt.md): lọc, xác minh trang chính thức, sửa `data/` cho mục chắc chắn, ghi `.cache/board-review/result.json`. Claude không có quyền git.
3. Script mở PR `claude/board-review-YYYY-MM-DD` (label `board-review`), chờ CI, pass thì squash merge. CI fail thì chuyển PR sang draft.
4. Mục chưa chắc: lượt `claude -p` thứ hai với [`prompt-unsure.md`](prompt-unsure.md) trên `main` mới, mở **draft PR** `…-unsure` để người duyệt.

## Cài trên le11

```bash
git clone https://github.com/techjobs-vn/vn-student-programs.git ~/personal/vsp-bot
git -C ~/personal/vsp-bot config user.email "<id>+zohuyhieuzo03@users.noreply.github.com"
crontab -e   # thêm dòng dưới
```

```cron
45 7 * * * TZ=Asia/Ho_Chi_Minh $HOME/personal/vsp-bot/ops/board-review/run.sh >> $HOME/logs/vsp-board-review.log 2>&1
```

Script tự `git reset --hard origin/main` trong clone riêng này, nên chính nó cũng tự cập nhật. Không trỏ `REPO_DIR` vào clone đang làm việc.

Biến môi trường: `REPO_DIR`, `JOB_HUB_DIR`, `GH_USER`, `DAYS`, `CLAUDE_MODEL`, `KUBECONFIG`, `DRY_RUN=1` (commit local, không push).
