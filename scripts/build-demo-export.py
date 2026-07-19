from pathlib import Path
from hashlib import sha256
import json,zipfile
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
root=Path(__file__).resolve().parents[1];out=root/'output'/'pdf';public=root/'public'/'demo-export';out.mkdir(parents=True,exist_ok=True);public.mkdir(parents=True,exist_ok=True)
pdf=out/'technical-dossier.pdf';c=canvas.Canvas(str(pdf),pagesize=A4);w,h=A4;c.setFillColor(HexColor('#12251e'));c.rect(0,h-115,w,115,fill=1,stroke=0);c.setFillColor(HexColor('#d9ef8f'));c.setFont('Helvetica-Bold',24);c.drawString(48,h-60,'CRA Evidence OS');c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica',11);c.drawString(48,h-84,'AegisEdge Gateway 2.3 - Annex VII mini-dossier');y=h-150
sections=[('1. Product description','Synthetic edge gateway for managed industrial networks.'),('2. Design and vulnerability handling','Administrative traffic uses mutual TLS 1.3. SBOM snapshot attached.'),('3. Cybersecurity risk assessment','Authentication bypass scenario remains under human review.'),('4. Evidence lineage','Annex I Part I (3)(d) -> approved claim -> page 4 source fragment.'),('5. Export status','DRAFT - NOT APPROVED. Evidence readiness is not legal compliance.')]
for title,body in sections:c.setFillColor(HexColor('#174f3c'));c.setFont('Helvetica-Bold',13);c.drawString(48,y,title);y-=20;c.setFillColor(HexColor('#26352f'));c.setFont('Helvetica',10);c.drawString(58,y,body);y-=38
c.setFillColor(HexColor('#63716b'));c.setFont('Helvetica',8);c.drawString(48,35,'Synthetic Build Week demo - generated from approved fixture facts');c.drawRightString(w-48,35,'Page 1 of 1');c.save()
html='<!doctype html><html><head><meta charset="utf-8"><title>AegisEdge dossier</title></head><body><h1>CRA Evidence OS</h1><h2>AegisEdge Gateway 2.3</h2><p>DRAFT - NOT APPROVED</p><ol><li>Product description</li><li>Design and vulnerability handling</li><li>Risk assessment</li><li>Evidence lineage</li></ol></body></html>'
files={'technical-dossier.pdf':pdf.read_bytes(),'technical-dossier.html':html.encode(),'evidence-index.json':json.dumps({'claim':'secure-admin-traffic','sourceFragmentId':'architecture-p4-p2','status':'APPROVED'},sort_keys=True).encode(),'sbom.cdx.json':(root/'fixtures'/'sbom-v2.4.cdx.json').read_bytes()};manifest={'schemaVersion':1,'productVersion':'AegisEdge Gateway 2.3','status':'DRAFT_NOT_APPROVED','files':[{'path':n,'sha256':sha256(b).hexdigest(),'bytes':len(b)} for n,b in files.items()]};files['manifest.json']=json.dumps(manifest,indent=2,sort_keys=True).encode();zip_path=out/'aegisedge-annex-vii-draft.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for n,b in files.items():z.writestr(n,b)
for source in (pdf,zip_path):(public/source.name).write_bytes(source.read_bytes())
print(pdf);print(zip_path)
