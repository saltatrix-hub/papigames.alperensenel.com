from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JS_ROOT = ROOT / "js"
IMPORT_RE = re.compile(
    r"(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?['\"]([^'\"]+)['\"]"
)


def resolve_module(source: Path, specifier: str) -> Path | None:
    if not specifier.startswith("."):
        return None
    candidate = (source.parent / specifier).resolve()
    if candidate.suffix:
        return candidate
    return candidate.with_suffix(".js")


def main() -> int:
    failures: list[str] = []
    if not (ROOT / "index.html").is_file():
        failures.append("missing index.html")
    if not JS_ROOT.is_dir():
        failures.append("missing js/ directory")

    js_files = sorted(JS_ROOT.rglob("*.js")) if JS_ROOT.is_dir() else []
    for path in js_files:
        checked = subprocess.run(
            ["node", "--check", str(path)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
        )
        if checked.returncode:
            detail = (checked.stderr or checked.stdout).strip().splitlines()
            failures.append(f"syntax {path.relative_to(ROOT)}: {detail[-1] if detail else 'failed'}")

        text = path.read_text(encoding="utf-8", errors="replace")
        for specifier in IMPORT_RE.findall(text):
            target = resolve_module(path, specifier)
            if target is not None and not target.is_file():
                failures.append(
                    f"missing import {path.relative_to(ROOT)} -> {specifier}"
                )

    if failures:
        print("STATIC CLIENT VALIDATION: FAIL")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"STATIC CLIENT VALIDATION: PASS ({len(js_files)} JavaScript files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
