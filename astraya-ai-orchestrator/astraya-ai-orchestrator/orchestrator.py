from __future__ import annotations

import base64
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

try:
    from openai import OpenAI
except Exception:
    OpenAI = None


HERE = Path(__file__).resolve().parent


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


load_env(HERE / "config.env")

REPO = (HERE / os.getenv("REPO_PATH", "../..")).resolve()
LOG_DIR = HERE / "logs"
LOG_DIR.mkdir(exist_ok=True)

OPENAI_MODEL = os.getenv("OPENAI_DIRECTOR_MODEL", "gpt-5.5")
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-2.5-flare")
MAX_TASKS = int(os.getenv("MAX_TASKS_PER_RUN", "8"))
MAX_FIX = int(os.getenv("MAX_FIX_ROUNDS", "3"))
MAX_ASSETS = int(os.getenv("MAX_ASSETS_PER_RUN", "8"))
AUTO_PUSH = os.getenv("AUTO_PUSH", "1") == "1"
AUTO_PROMOTE = os.getenv("AUTO_PROMOTE_ASSETS", "0") == "1"
REQUIRE_CLEAN = os.getenv("REQUIRE_CLEAN_WORKTREE", "1") == "1"
CURSOR_CMD = os.getenv("CURSOR_AGENT_COMMAND", "agent")
CURSOR_MODEL = os.getenv("CURSOR_MODEL", "").strip()
VALIDATION_COMMAND = os.getenv(
    "VALIDATION_COMMAND",
    "py tools/validate_static_client.py",
).strip()

RUN_ID = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
LOG_FILE = LOG_DIR / f"nightly-{RUN_ID}.log"


def log(msg: str) -> None:
    stamp = dt.datetime.now().strftime("%H:%M:%S")
    line = f"[{stamp}] {msg}"
    print(line, flush=True)
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def run(cmd: list[str], cwd: Path | None = None, check: bool = True, timeout: int | None = None) -> subprocess.CompletedProcess:
    log("$ " + " ".join(cmd))
    p = subprocess.run(
        cmd,
        cwd=str(cwd or REPO),
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )
    if p.stdout.strip():
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(p.stdout.rstrip() + "\n")
    if p.stderr.strip():
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write("[stderr]\n" + p.stderr.rstrip() + "\n")
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed ({p.returncode}): {' '.join(cmd)}\n{p.stderr[-2000:]}")
    return p


def must_exist() -> None:
    if not REPO.exists() or not (REPO / ".git").exists():
        raise RuntimeError(f"REPO_PATH git repo degil: {REPO}")
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY config.env icinde bos.")
    if not os.getenv("CURSOR_API_KEY"):
        # Cursor can also be authenticated by agent login, so only warn.
        log("UYARI: CURSOR_API_KEY bos. Mevcut `agent login` oturumu kullanilacak.")
    if shutil.which(CURSOR_CMD) is None:
        raise RuntimeError(f"Cursor CLI bulunamadi: {CURSOR_CMD}. Once Cursor CLI kur ve `agent login` yap.")
    run(["git", "--version"], check=True)
    run([CURSOR_CMD, "status"], check=False)


def git_output(*args: str) -> str:
    return run(["git", *args], check=True).stdout.strip()


def setup_branch() -> str:
    dirty = git_output("status", "--porcelain")
    if dirty and REQUIRE_CLEAN:
        raise RuntimeError(
            "Repo temiz degil. Cursor'daki mevcut degisiklikleri once commit et veya "
            "REQUIRE_CLEAN_WORKTREE=0 yap. Guvenlik icin gece modu durduruldu."
        )
    base_branch = git_output("branch", "--show-current") or "main"
    branch = f"{os.getenv('BRANCH_PREFIX','ai/nightly')}-{RUN_ID}"
    run(["git", "checkout", "-b", branch])
    log(f"Nightly branch: {branch} (base: {base_branch})")
    return branch


def install_cursor_permissions() -> None:
    p = REPO / ".cursor" / "cli.json"
    if p.exists():
        log(".cursor/cli.json zaten var; kullanicinin mevcut izin dosyasi korunuyor.")
        return
    p.parent.mkdir(parents=True, exist_ok=True)
    config = {
        "version": 1,
        "permissions": {
            "allow": [
                "Read(**)",
                "Write(js/**)",
                "Write(css/**)",
                "Write(assets/**)",
                "Write(design/**)",
                "Write(ai/**)",
                "Write(tools/**)",
                "Write(.cursor/**)",
                "Write(AGENTS.md)",
                "Write(README.md)",
                "Write(index.html)",
                "Shell(node)",
                "Shell(python)",
                "Shell(py)",
                "Shell(npm)",
                "Shell(npx)"
            ],
            "deny": [
                "Shell(git)",
                "Shell(gh)",
                "Shell(rm)",
                "Shell(del)",
                "Shell(rmdir)",
                "Read(**/.env*)",
                "Write(**/.env*)",
                "Write(.git/**)",
                "Write(astraya-ai-orchestrator/**)",
                "Write(CNAME)"
            ]
        }
    }
    p.write_text(json.dumps(config, indent=2), encoding="utf-8")
    log("Guvenli Cursor CLI izinleri .cursor/cli.json olarak olusturuldu.")


def read_file(rel: str, max_chars: int = 24000) -> str:
    p = REPO / rel
    if not p.exists():
        return f"[MISSING: {rel}]"
    try:
        t = p.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return f"[UNREADABLE {rel}: {e}]"
    return t[-max_chars:]


def shared_context() -> str:
    parts = []
    for rel in [
        "ai/PROJECT_STATE.md",
        "ai/TASKS.md",
        "ai/DECISIONS.md",
        "ai/HANDOFF.md",
        "ai/BUGS.md",
        "design/CHARACTER_ASSET_PRODUCTION_SPEC.md",
        "design/character_asset_requirements.json",
        "ai/ASSET_QUEUE.json",
    ]:
        parts.append(f"\n===== {rel} =====\n{read_file(rel)}")
    return "\n".join(parts)


def client() -> OpenAI:
    if OpenAI is None:
        raise RuntimeError("openai paketi yuklenemedi.")
    return OpenAI(api_key=os.environ["OPENAI_API_KEY"])


DIRECTOR_SCHEMA = {
    "type": "object",
    "properties": {
        "kind": {"type": "string", "enum": ["cursor", "stop"]},
        "title": {"type": "string"},
        "task": {"type": "string"},
        "acceptance_criteria": {"type": "array", "items": {"type": "string"}},
        "reason": {"type": "string"},
    },
    "required": ["kind", "title", "task", "acceptance_criteria", "reason"],
    "additionalProperties": False,
}

REVIEW_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {"type": "string", "enum": ["PASS", "NEEDS_FIX", "BLOCKED"]},
        "summary": {"type": "string"},
        "fix_prompt": {"type": "string"},
    },
    "required": ["verdict", "summary", "fix_prompt"],
    "additionalProperties": False,
}


def structured(prompt: str, schema: dict[str, Any], name: str) -> dict[str, Any]:
    c = client()
    response = c.responses.create(
        model=OPENAI_MODEL,
        input=prompt,
        text={
            "format": {
                "type": "json_schema",
                "name": name,
                "strict": True,
                "schema": schema,
            }
        },
    )
    return json.loads(response.output_text)


def choose_task() -> dict[str, Any]:
    system = (HERE / "prompts" / "director.md").read_text(encoding="utf-8")
    prompt = system + "\n\nCURRENT REPOSITORY STATE:\n" + shared_context()
    result = structured(prompt, DIRECTOR_SCHEMA, "astraya_next_task")
    log(f"Director: {result['kind']} / {result['title']} — {result['reason']}")
    return result


def run_cursor(task: dict[str, Any]) -> str:
    wrapper = (HERE / "prompts" / "cursor_wrapper.md").read_text(encoding="utf-8")
    prompt = wrapper.format(
        task=task["task"],
        criteria="\n".join(f"- {x}" for x in task.get("acceptance_criteria", [])),
    )
    cmd = [CURSOR_CMD, "-p", "--force", prompt, "--output-format", "text"]
    if CURSOR_MODEL:
        cmd += ["--model", CURSOR_MODEL]
    env = os.environ.copy()
    p = subprocess.run(
        cmd,
        cwd=str(REPO),
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        env=env,
    )
    if p.stdout.strip():
        log("Cursor summary:\n" + p.stdout[-8000:])
    if p.stderr.strip():
        log("Cursor stderr:\n" + p.stderr[-3000:])
    if p.returncode != 0:
        raise RuntimeError(f"Cursor CLI failed ({p.returncode}).")
    return p.stdout


def changed_files() -> list[str]:
    out = git_output("status", "--porcelain")
    result = []
    for line in out.splitlines():
        if len(line) >= 4:
            result.append(line[3:].strip())
    return result


def commit_changes(title: str) -> str | None:
    files = changed_files()
    if not files:
        log("Degisiklik yok; commit olusturulmadi.")
        return None
    run(["git", "add", "-A"])
    safe = re.sub(r"[^A-Za-z0-9 _:\-./]", "", title)[:80].strip()
    run(["git", "commit", "-m", f"ai: {safe or 'nightly task'}"])
    sha = git_output("rev-parse", "--short", "HEAD")
    log(f"Commit: {sha}")
    if AUTO_PUSH:
        p = run(["git", "push", "-u", "origin", "HEAD"], check=False)
        if p.returncode != 0:
            log("UYARI: push basarisiz; yerel commit korunuyor.")
        else:
            log("Nightly branch origin'a push edildi.")
    return sha


def run_validation() -> str:
    if not VALIDATION_COMMAND:
        return "Validation disabled: VALIDATION_COMMAND is empty."
    log(f"Validation: {VALIDATION_COMMAND}")
    p = subprocess.run(
        VALIDATION_COMMAND,
        cwd=str(REPO),
        shell=True,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
    )
    output = (p.stdout + ("\n[stderr]\n" + p.stderr if p.stderr else "")).strip()
    result = f"exit_code={p.returncode}\n{output[-12000:]}"
    log("Validation result:\n" + result)
    return result


def review_task(task: dict[str, Any], cursor_summary: str, validation: str) -> dict[str, Any]:
    review_prompt = (HERE / "prompts" / "reviewer.md").read_text(encoding="utf-8")
    diff = run(
        ["git", "show", "--format=fuller", "--stat", "--patch", "HEAD"],
        check=False,
    ).stdout
    prompt = (
        review_prompt
        + "\n\nASSIGNED TASK:\n" + task["task"]
        + "\n\nCURSOR SUMMARY:\n" + cursor_summary[-10000:]
        + "\n\nDETERMINISTIC VALIDATION:\n" + validation[-12000:]
        + "\n\nLATEST COMMIT DIFF:\n" + diff[-50000:]
        + "\n\nUPDATED SHARED STATE:\n" + shared_context()
    )
    result = structured(prompt, REVIEW_SCHEMA, "astraya_review")
    log(f"Reviewer: {result['verdict']} — {result['summary']}")
    return result


def load_asset_queue() -> list[dict[str, Any]]:
    p = REPO / "ai" / "ASSET_QUEUE.json"
    if not p.exists():
        return []
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            data = data.get("jobs", [])
        return data if isinstance(data, list) else []
    except Exception as e:
        log(f"ASSET_QUEUE okunamadi: {e}")
        return []


def save_asset_queue(jobs: list[dict[str, Any]]) -> None:
    p = REPO / "ai" / "ASSET_QUEUE.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps({"jobs": jobs}, ensure_ascii=False, indent=2), encoding="utf-8")


def generate_asset_candidate(job: dict[str, Any]) -> Path | None:
    jid = str(job.get("id") or f"asset-{int(time.time())}")
    prompt = str(job.get("prompt") or "").strip()
    if not prompt:
        job["status"] = "blocked"
        job["note"] = "prompt missing"
        return None

    target = str(job.get("target_path") or f"assets/generated/{jid}.png")
    candidate_dir = REPO / "assets" / "generated_candidates"
    candidate_dir.mkdir(parents=True, exist_ok=True)
    out = candidate_dir / (Path(target).stem + f"__candidate_{RUN_ID}.png")

    art_prompt = f"""Draw a production candidate asset for the ASTRAYA 2D top-down MMORPG.

{prompt}

Critical constraints:
- transparent background
- no text, labels, UI, watermark, border or mockup
- preserve a coherent fantasy MMORPG pixel/sprite aesthetic
- this is a candidate to be validated, not automatically assumed final
- if the requirement describes a sprite sheet, keep poses separated cleanly and consistent

Return only the requested art.
"""
    c = client()
    log(f"Asset generate: {jid}")
    response = c.responses.create(
        model=OPENAI_MODEL,
        input=art_prompt,
        tools=[{
            "type": "image_generation",
            "model": IMAGE_MODEL,
            "action": "generate",
            "background": "transparent",
            "quality": "high",
        }],
        tool_choice={"type": "image_generation"},
    )
    image_data = [
        x.result for x in response.output
        if getattr(x, "type", "") == "image_generation_call" and getattr(x, "result", None)
    ]
    if not image_data:
        job["status"] = "blocked"
        job["note"] = "image model returned no image"
        return None
    out.write_bytes(base64.b64decode(image_data[0]))
    job["status"] = "candidate"
    job["candidate_path"] = str(out.relative_to(REPO)).replace("\\", "/")
    log(f"Asset candidate saved: {job['candidate_path']}")
    return out


def review_asset(job: dict[str, Any], image_path: Path) -> dict[str, Any]:
    raw = base64.b64encode(image_path.read_bytes()).decode("ascii")
    req = json.dumps(job, ensure_ascii=False, indent=2)
    schema = {
        "type": "object",
        "properties": {
            "verdict": {"type": "string", "enum": ["PASS", "REJECT", "BLOCKED"]},
            "summary": {"type": "string"},
            "issues": {"type": "array", "items": {"type": "string"}},
        },
        "required": ["verdict", "summary", "issues"],
        "additionalProperties": False,
    }
    c = client()
    response = c.responses.create(
        model=OPENAI_MODEL,
        input=[{
            "role": "user",
            "content": [
                {"type": "input_text", "text": (
                    "Review this generated ASTRAYA asset candidate against the requirement below. "
                    "Be strict about sprite usability, consistency, transparency/background appearance, "
                    "direction/frame clarity and obvious artifacts. Do not pass merely because it looks attractive.\n\n"
                    + req
                )},
                {"type": "input_image", "image_url": f"data:image/png;base64,{raw}"},
            ],
        }],
        text={"format": {"type": "json_schema", "name": "asset_review", "strict": True, "schema": schema}},
    )
    result = json.loads(response.output_text)
    log(f"Asset review {job.get('id')}: {result['verdict']} — {result['summary']}")
    job["review"] = result
    if result["verdict"] == "PASS":
        job["status"] = "approved_candidate"
        if AUTO_PROMOTE and job.get("target_path"):
            target = REPO / str(job["target_path"])
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(image_path, target)
            job["status"] = "promoted"
            log(f"Asset promoted: {target.relative_to(REPO)}")
    else:
        job["status"] = "rejected" if result["verdict"] == "REJECT" else "blocked"
    return result


def process_asset_queue() -> int:
    jobs = load_asset_queue()
    n = 0
    changed = False
    for job in jobs:
        if n >= MAX_ASSETS:
            break
        if job.get("status", "pending") not in ("pending", "retry"):
            continue
        changed = True
        n += 1
        try:
            path = generate_asset_candidate(job)
            if path:
                review_asset(job, path)
        except Exception as e:
            job["status"] = "blocked"
            job["note"] = f"{type(e).__name__}: {e}"
            log(f"Asset job failed {job.get('id')}: {e}")
    if changed:
        save_asset_queue(jobs)
    return n


def append_report(line: str) -> None:
    p = REPO / "ai" / "NIGHTLY_REPORT.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text(f"# ASTRAYA Nightly Report\n\nRun: {RUN_ID}\n\n", encoding="utf-8")
    with p.open("a", encoding="utf-8") as f:
        f.write(line.rstrip() + "\n")


def main() -> int:
    try:
        must_exist()
        branch = setup_branch()
        install_cursor_permissions()
        append_report(f"## Branch `{branch}`\n")

        completed = 0
        for i in range(1, MAX_TASKS + 1):
            log(f"===== ITERATION {i}/{MAX_TASKS} =====")

            # Generate pending art candidates first when Cursor has provided exact jobs.
            asset_count = process_asset_queue()
            if asset_count:
                commit_changes(f"asset candidates batch {i}")
                append_report(f"- Asset batch {i}: processed {asset_count} pending job(s).")

            task = choose_task()
            if task["kind"] == "stop":
                append_report(f"- Director stopped: {task['reason']}")
                break

            cursor_summary = run_cursor(task)
            sha = commit_changes(task["title"])
            if not sha:
                append_report(f"- `{task['title']}`: no file changes; stopped to avoid loop.")
                break

            validation = run_validation()
            review = review_task(task, cursor_summary, validation)
            fixes = 0
            while review["verdict"] == "NEEDS_FIX" and fixes < MAX_FIX:
                fixes += 1
                fix_task = {
                    "title": f"{task['title']} fix {fixes}",
                    "task": review["fix_prompt"],
                    "acceptance_criteria": task.get("acceptance_criteria", []),
                }
                cursor_summary = run_cursor(fix_task)
                fix_sha = commit_changes(fix_task["title"])
                if not fix_sha:
                    break
                validation = run_validation()
                review = review_task(task, cursor_summary, validation)

            completed += 1
            append_report(
                f"- `{task['title']}` → **{review['verdict']}** — {review['summary']}"
            )

            if review["verdict"] == "BLOCKED":
                log("Reviewer BLOCKED; insan/art karari gerektigi icin gece dongusu burada duruyor.")
                break

        # Final asset queue pass.
        final_assets = process_asset_queue()
        if final_assets:
            commit_changes("final asset candidate batch")
            append_report(f"- Final asset batch: processed {final_assets} job(s).")

        append_report(f"\nCompleted task count: **{completed}**\n")
        log(f"DONE. Completed tasks: {completed}. Branch: {branch}")
        return 0
    except KeyboardInterrupt:
        log("Kullanici tarafindan durduruldu.")
        return 130
    except Exception as e:
        log(f"FATAL: {type(e).__name__}: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
