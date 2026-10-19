"""Local preview of Cloudflare's extensionless HTML routing and static headers."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
PUBLIC = Path(__file__).resolve().parents[1] / "public"
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/index.html" or (path.endswith(".html") and path != "/404.html"):
            self.send_response(308)
            self.send_header("Location", "/" if path == "/index.html" else path[:-5])
            self.end_headers()
            return
        candidate = path + ".html"
        if path != "/" and (PUBLIC / candidate.lstrip("/")).is_file():
            self.path = candidate
        super().do_GET()
    def end_headers(self):
        for line in (PUBLIC / "_headers").read_text().splitlines():
            if line.startswith("  "):
                key, value = line.strip().split(":", 1)
                # localhost is already a secure context; do not upgrade local HTTP assets.
                self.send_header(key, value.strip().replace("; upgrade-insecure-requests", ""))
        super().end_headers()
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            data = (PUBLIC / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            super().send_error(code, message, explain)
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    print(f"Preview: http://127.0.0.1:{args.port}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
