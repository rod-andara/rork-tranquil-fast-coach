"""Check the deployed static site's navigable paths, metadata, and CSP inputs."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import base64, hashlib, json, re, sys, xml.etree.ElementTree as ET
PUBLIC = Path(__file__).resolve().parents[1] / "public"
errors = []
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.ids=set(); self.refs=[]; self.main=0; self.h1=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if "id" in a:
            if a["id"] in self.ids: errors.append(f"{self.path.name}: duplicate id {a['id']}")
            self.ids.add(a["id"])
        self.main += tag == "main"; self.h1 += tag == "h1"
        if "style" in a or any(k.startswith("on") for k in a): errors.append(f"{self.path.name}: inline executable/style attribute")
        if tag == "img" and not a.get("alt"): errors.append(f"{self.path.name}: missing image alt")
        if tag == "a" and (not a.get("href") or a["href"] == "#"): errors.append(f"{self.path.name}: empty link")
        for key in ("href", "src"):
            if key in a: self.refs.append(a[key])
pages={}
for path in PUBLIC.glob("*.html"):
    page=Page(path); page.feed(path.read_text()); pages[path.name]=page
    if page.main!=1 or page.h1!=1: errors.append(f"{path.name}: expected one main and h1")
    s=path.read_text()
    if re.search(r"<script(?:\s[^>]*)?>",s) and "<script>" in s: errors.append(f"{path.name}: inline JS")
    if any(x in s for x in ["fonts.googleapis.com", "fonts.gstatic.com", "Replace with App Store QR", "iOS 16+", "Now on iPhone"]): errors.append(f"{path.name}: stale release content")
    if path.name != "404.html":
        expected="https://tranquilfast.app/"+("" if path.stem=="index" else path.stem)
        if f'rel="canonical" href="{expected}"' not in s: errors.append(f"{path.name}: canonical mismatch")
for name, page in pages.items():
    for ref in page.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        target=unquote(u.path).lstrip("/") or (name if not u.path else "index.html")
        if not u.path and u.fragment: target=name
        candidate=PUBLIC/target
        if not candidate.is_file() and candidate.suffix=="": candidate=candidate.with_suffix(".html")
        if not candidate.is_file(): errors.append(f"{name}: missing local target {ref}")
        elif u.fragment and candidate.name in pages and u.fragment not in pages[candidate.name].ids: errors.append(f"{name}: missing anchor {ref}")
for ref in re.findall(r"url\(([^)]+)\)",(PUBLIC/"fonts.css").read_text()):
    if not (PUBLIC/ref.lstrip("/")).is_file(): errors.append(f"Missing font {ref}")
s=(PUBLIC/"index.html").read_text()
ld=re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]
json.loads(ld)
hashvalue=base64.b64encode(hashlib.sha256(ld.encode()).digest()).decode()
if f"'sha256-{hashvalue}'" not in (PUBLIC/"_headers").read_text(): errors.append("JSON-LD hash does not match CSP")
ET.fromstring((PUBLIC/"sitemap.xml").read_text())
if errors:
    print("\n".join(errors)); sys.exit(1)
print(f"PASS: {len(pages)} pages; local links/anchors/assets, metadata, structured data, sitemap, CSP hash, and launch content.")
