"""Create an upload archive containing public assets only (never docs or credentials)."""
from pathlib import Path
import hashlib, json, subprocess, sys, zipfile
ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(ROOT / "scripts/check.py")], check=True)
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
archive = DIST / "tranquilfast-website.zip"
files = sorted(p for p in (ROOT / "public").rglob("*") if p.is_file())
manifest = []
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
    for path in files:
        name = path.relative_to(ROOT / "public").as_posix()
        if path.name.startswith("."): raise ValueError(f"Unexpected hidden asset: {name}")
        data = path.read_bytes()
        entry = zipfile.ZipInfo(name, date_time=(2026, 10, 17, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        z.writestr(entry, data)
        manifest.append({"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
(DIST / "manifest.json").write_text(json.dumps({"archive_sha256":hashlib.sha256(archive.read_bytes()).hexdigest(),"files":manifest},indent=2)+"\n")
print(f"Upload archive: {archive} ({len(files)} files)")
