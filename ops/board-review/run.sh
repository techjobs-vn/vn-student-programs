#!/usr/bin/env bash
# Daily board review: new links from the vtp-board TinyFish monitors → Claude reviews them →
# confident changes go out as a PR that is squash-merged once CI passes; unsure ones go to a
# draft PR for a human. See ops/board-review/README.md.
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/personal/vsp-bot}"           # dedicated clone, reset to origin/main every run
JOB_HUB_DIR="${JOB_HUB_DIR:-$HOME/personal/job-hub}"     # provides scripts/dev/query_prod_db.py
GH_USER="${GH_USER:-zohuyhieuzo03}"
DAYS="${DAYS:-3}"                                         # look-back window for monitor runs
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
CLAUDE_MODEL="${CLAUDE_MODEL:-sonnet}"
PYTHON="${PYTHON:-python3}"
DRY_RUN="${DRY_RUN:-0}"                                   # 1 = review and commit locally, never push
export KUBECONFIG="${KUBECONFIG:-$HOME/.kube/personal-infra.yaml}"
export GH_TOKEN="${GH_TOKEN:-$(gh auth token --user "$GH_USER")}"

LABEL="board-review"
CACHE=".cache/board-review"
TODAY="$(TZ=Asia/Ho_Chi_Minh date +%F)"
CLAUDE_TOOLS='Read,Edit,Write,Glob,Grep,WebFetch,WebSearch,Bash(npm test),Bash(npm run validate),Bash(npm run readme),Bash(node scripts/*)'

log() { echo "[$(date '+%F %T')] $*" >&2; }

exec 9>"${TMPDIR:-/tmp}/vsp-board-review.lock"
flock -n 9 || { log "another run is in progress"; exit 0; }

cd "$REPO_DIR"
case "$(git config user.email)" in
  *@users.noreply.github.com) ;;
  *) log "git user.email must be a GitHub noreply address"; exit 1 ;;
esac

reset_main() {
  git fetch -q origin
  git checkout -q -f main
  git reset -q --hard origin/main
  git clean -q -fd
}

# Branch name with -2, -3… when it already exists on the remote.
branch_name() {
  local base="$1" name="$1" n=2
  while git ls-remote --exit-code --heads origin "$name" >/dev/null 2>&1; do name="$base-$n"; n=$((n + 1)); done
  echo "$name"
}

run_claude() {
  "$CLAUDE_BIN" -p "$(cat "ops/board-review/$1")" \
    --model "$CLAUDE_MODEL" \
    --permission-mode acceptEdits \
    --allowedTools "$CLAUDE_TOOLS" \
    --max-turns 120 \
    --output-format text
}

# Commit data changes on a new branch, push, open a PR. Prints the PR url (empty when nothing changed).
open_pr() {
  local branch="$1" title="$2" body_file="$3" draft="$4"
  if git diff --quiet -- data README.md; then return 0; fi
  git checkout -q -b "$branch"
  git add data README.md
  git commit -q -m "$title"
  if [[ "$DRY_RUN" == 1 ]]; then log "DRY_RUN: committed $branch locally, not pushing"; return 0; fi
  git push -q -u origin "$branch"
  gh pr create --base main --head "$branch" --title "$title" --body-file "$body_file" --label "$LABEL" ${draft:+--draft}
}

reset_main
mkdir -p "$CACHE"
rm -f "$CACHE"/*.json

# 1. New links from monitor runs in the window.
"$PYTHON" "$JOB_HUB_DIR/scripts/dev/query_prod_db.py" --preset monitor-links --json --limit 200 > "$CACHE/runs.json"
"$PYTHON" - "$CACHE/runs.json" "$DAYS" > "$CACHE/links.json" <<'EOF'
import json, sys
from datetime import datetime, timedelta, timezone
runs, days = json.load(open(sys.argv[1])), int(sys.argv[2])
cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
seen, out = set(), []
for r in runs:
    if r["received_at"] < cutoff:
        continue
    for url in json.loads(r["new_links"] or "[]"):
        if url not in seen:
            seen.add(url)
            out.append({"url": url, "board": r["board"], "received_at": r["received_at"]})
json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
EOF

# Drop links already in seen.jsonl so a quiet day costs no Claude run.
"$PYTHON" - "$CACHE/links.json" data/seen.jsonl <<'EOF'
import json, sys
path, seen_path = sys.argv[1], sys.argv[2]
seen = {json.loads(l)["url"] for l in open(seen_path) if l.strip()}
links = [l for l in json.load(open(path)) if l["url"] not in seen]
json.dump(links, open(path, "w"), ensure_ascii=False, indent=1)
EOF
count="$("$PYTHON" -c 'import json,sys; print(len(json.load(open(sys.argv[1]))))' "$CACHE/links.json")"
if [[ "$count" == 0 ]]; then log "no new links"; exit 0; fi
log "$count new links"

# URLs already waiting in open board-review draft PRs.
gh pr list --label "$LABEL" --state open --json body --jq '.[].body' | grep -oE 'https?://[^ )|>]+' | sort -u > "$CACHE/pending-urls.txt" || true

# 2. Review.
run_claude prompt.md
[[ -f "$CACHE/result.json" ]] || { log "claude wrote no result.json"; exit 1; }
npm test >/dev/null && npm run -s validate && npm run -s readme

"$PYTHON" - "$CACHE/result.json" > "$CACHE/body.md" <<'EOF'
import json, sys
r = json.load(open(sys.argv[1]))
print("Tự động từ monitor bảng việc làm (`ops/board-review`). CI pass thì tự merge.\n")
print("## Thêm / sửa\n")
for a in r.get("added", []):
    print(f"- `{a.get('program_slug')}` ({a.get('kind')}): {a.get('summary')}")
print("\n## Đã loại\n")
for x in r.get("rejected", []):
    print(f"- {x.get('url')}: {x.get('reason')}")
if r.get("unsure"):
    print("\n## Chưa chắc (mở draft PR riêng)\n")
    for u in r["unsure"]:
        print(f"- {u.get('url')}: {u.get('why')}")
EOF

pr_url="$(open_pr "$(branch_name "claude/board-review-$TODAY")" "data: duyệt tin từ bảng việc làm ($TODAY)" "$CACHE/body.md" "")"
if [[ -n "$pr_url" ]]; then
  log "PR $pr_url"
  sleep 20  # let checks register
  if gh pr checks "$pr_url" --watch --fail-fast >/dev/null; then
    gh pr merge "$pr_url" --squash --delete-branch
    log "merged $pr_url"
  else
    gh pr comment "$pr_url" --body "CI không pass, để lại cho người duyệt."
    gh pr ready "$pr_url" --undo || true
    log "CI failed on $pr_url, converted to draft"
  fi
fi

# 3. Unsure items → draft PR on top of the freshly merged main.
"$PYTHON" -c 'import json,sys; json.dump(json.load(open(sys.argv[1])).get("unsure", []), open(sys.argv[2], "w"), ensure_ascii=False)' \
  "$CACHE/result.json" "$CACHE/unsure.json"
if [[ "$("$PYTHON" -c 'import json,sys; print(len(json.load(open(sys.argv[1]))))' "$CACHE/unsure.json")" == 0 ]]; then
  log "done"; exit 0
fi
cp "$CACHE/unsure.json" "${TMPDIR:-/tmp}/vsp-unsure.json"
reset_main
mkdir -p "$CACHE" && mv "${TMPDIR:-/tmp}/vsp-unsure.json" "$CACHE/unsure.json"
run_claude prompt-unsure.md
[[ -f "$CACHE/result-unsure.json" ]] || { log "claude wrote no result-unsure.json"; exit 1; }
npm test >/dev/null && npm run -s validate && npm run -s readme

"$PYTHON" - "$CACHE/result-unsure.json" > "$CACHE/body-unsure.md" <<'EOF'
import json, sys
r = json.load(open(sys.argv[1]))
print("Các mục AI **chưa chắc** từ monitor bảng việc làm (`ops/board-review`). Cần người duyệt trước khi merge.\n")
print("| URL | Chương trình | Kết luận | Cần kiểm tra |\n| --- | --- | --- | --- |")
for i in r.get("items", []):
    print(f"| {i.get('url')} | `{i.get('program_slug') or '—'}` | {i.get('verdict')} | {i.get('check')} |")
EOF
draft_url="$(open_pr "$(branch_name "claude/board-review-$TODAY-unsure")" "data: tin cần duyệt từ bảng việc làm ($TODAY)" "$CACHE/body-unsure.md" 1)"
log "draft ${draft_url:-none}"
log "done"
