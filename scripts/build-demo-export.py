from pathlib import Path
from hashlib import sha256
import json
import zipfile

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
PUBLIC_EXPORT = ROOT / "public" / "demo-export"
PUBLIC_SOURCE = ROOT / "public" / "demo-source"
for directory in (OUT, PUBLIC_EXPORT, PUBLIC_SOURCE):
    directory.mkdir(parents=True, exist_ok=True)


def header(pdf_canvas, title, subtitle):
    width, height = A4
    pdf_canvas.setFillColor(HexColor("#12251e"))
    pdf_canvas.rect(0, height - 115, width, 115, fill=1, stroke=0)
    pdf_canvas.setFillColor(HexColor("#d9ef8f"))
    pdf_canvas.setFont("Helvetica-Bold", 24)
    pdf_canvas.drawString(48, height - 60, title)
    pdf_canvas.setFillColor(HexColor("#ffffff"))
    pdf_canvas.setFont("Helvetica", 11)
    pdf_canvas.drawString(48, height - 84, subtitle)


def footer(pdf_canvas, page, total):
    width, _ = A4
    pdf_canvas.setFillColor(HexColor("#63716b"))
    pdf_canvas.setFont("Helvetica", 8)
    pdf_canvas.drawString(48, 35, "Repository-owned synthetic Build Week demo data")
    pdf_canvas.drawRightString(width - 48, 35, f"Page {page} of {total}")


def draw_paragraph(pdf_canvas, label, lines, y):
    pdf_canvas.setFillColor(HexColor("#174f3c"))
    pdf_canvas.setFont("Helvetica-Bold", 10)
    pdf_canvas.drawString(48, y, label)
    y -= 20
    pdf_canvas.setFillColor(HexColor("#26352f"))
    pdf_canvas.setFont("Helvetica", 10)
    for line in lines:
        pdf_canvas.drawString(58, y, line)
        y -= 16
    return y - 18


source_pdf = PUBLIC_SOURCE / "aegisedge-architecture-v2.3.pdf"
source = canvas.Canvas(str(source_pdf), pagesize=A4)
source.setTitle("AegisEdge Gateway 2.3 - Synthetic Security Architecture")
source_pages = [
    (
        "AegisEdge security architecture",
        "Version 2.3 - controlled synthetic evidence source",
        [
            ("Document purpose", ["This synthetic document supports the public CRA Evidence OS judge demo.", "It contains no customer, personal or confidential information."]),
            ("Scope", ["AegisEdge Gateway is a fictional managed industrial edge product.", "The document is not a conformity assessment or legal opinion."]),
        ],
    ),
    (
        "System boundaries",
        "Version 2.3 - architecture context",
        [
            ("Paragraph 1", ["The gateway separates management, telemetry and workload traffic."]),
            ("Paragraph 2", ["Administrative interfaces are reachable only through the managed control plane."]),
            ("Paragraph 3", ["All examples, versions and identities in this file are synthetic."]),
        ],
    ),
    (
        "Identity lifecycle",
        "Version 2.3 - manufacturing and rotation",
        [
            ("Paragraph 1", ["Device identities are created during the fictional manufacturing flow."]),
            ("Paragraph 2", ["Rotation policy is reviewed whenever the cryptographic runtime changes."]),
            ("Paragraph 3", ["Review evidence must retain its exact source and product version."]),
        ],
    ),
    (
        "Administrative channel protections",
        "Version 2.3 - cited evidence page",
        [
            ("Paragraph 1", ["The management plane is separated from application workloads."]),
            ("Paragraph 2", [
                "All administrative traffic is protected using mutual TLS 1.3.",
                "Device identities are provisioned during manufacturing and rotated every 90 days.",
                "Failed authentication attempts are rate limited and recorded.",
            ]),
            ("Paragraph 3", ["Any change to the TLS runtime triggers evidence review."]),
        ],
    ),
]
for page_number, (title, subtitle, paragraphs) in enumerate(source_pages, start=1):
    header(source, title, subtitle)
    y = A4[1] - 155
    for label, lines in paragraphs:
        y = draw_paragraph(source, label, lines, y)
    footer(source, page_number, len(source_pages))
    source.showPage()
source.save()

dossier_pdf = OUT / "technical-dossier.pdf"
dossier = canvas.Canvas(str(dossier_pdf), pagesize=A4)
dossier.setTitle("CRA Evidence OS - Annex VII mini-dossier")
header(dossier, "CRA Evidence OS", "AegisEdge Gateway 2.3 - Annex VII mini-dossier")
y = A4[1] - 150
sections = [
    ("1. Product description", "Synthetic edge gateway for managed industrial networks."),
    ("2. Design and vulnerability handling", "Administrative traffic uses mutual TLS 1.3. SBOM snapshot attached."),
    ("3. Cybersecurity risk assessment", "Authentication bypass scenario remains under human review."),
    ("4. Evidence lineage", "Annex I Part I (3)(d) -> reviewed claim -> page 4, paragraph 2."),
    ("5. Export status", "DRAFT - NOT APPROVED. Evidence readiness is not legal compliance."),
]
for title, body in sections:
    dossier.setFillColor(HexColor("#174f3c"))
    dossier.setFont("Helvetica-Bold", 13)
    dossier.drawString(48, y, title)
    y -= 20
    dossier.setFillColor(HexColor("#26352f"))
    dossier.setFont("Helvetica", 10)
    dossier.drawString(58, y, body)
    y -= 38
footer(dossier, 1, 1)
dossier.save()

html = """<!doctype html><html><head><meta charset="utf-8"><title>AegisEdge dossier</title></head>
<body><h1>CRA Evidence OS</h1><h2>AegisEdge Gateway 2.3</h2><p>DRAFT - NOT APPROVED</p>
<ol><li>Product description</li><li>Design and vulnerability handling</li><li>Risk assessment</li>
<li>Evidence lineage: page 4, paragraph 2</li></ol></body></html>"""
files = {
    "technical-dossier.pdf": dossier_pdf.read_bytes(),
    "technical-dossier.html": html.encode(),
    "evidence-index.json": json.dumps({
        "claim": "secure-admin-traffic",
        "sourceArtifact": "aegisedge-architecture-v2.3.pdf",
        "sourceFragmentId": "architecture-v2.3:p4:p2",
        "status": "SUGGESTED",
    }, sort_keys=True).encode(),
    "sbom.cdx.json": (ROOT / "fixtures" / "sbom-v2.4.cdx.json").read_bytes(),
}
manifest = {
    "schemaVersion": 1,
    "productVersion": "AegisEdge Gateway 2.3",
    "status": "DRAFT_NOT_APPROVED",
    "files": [
        {"path": name, "sha256": sha256(data).hexdigest(), "bytes": len(data)}
        for name, data in files.items()
    ],
}
files["manifest.json"] = json.dumps(manifest, indent=2, sort_keys=True).encode()
zip_path = OUT / "aegisedge-annex-vii-draft.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
    for name, data in files.items():
        archive.writestr(name, data)

for source_file in (dossier_pdf, zip_path):
    (PUBLIC_EXPORT / source_file.name).write_bytes(source_file.read_bytes())

print(source_pdf)
print(dossier_pdf)
print(zip_path)
