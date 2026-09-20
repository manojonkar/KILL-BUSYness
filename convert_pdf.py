import fitz
import os

pdf_path = r"C:\Users\Manoj\.gemini\antigravity\brain\a5382956-1ed7-45cf-ace3-f0392026d003\.user_uploaded\media_1788864259421.pdf"
output_dir = r"c:\KILL BUSYness Website\Rebuild\rebuild\source\public\files\chapter_pages\0"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)

for i in range(len(doc)):
    page = doc.load_page(i)
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    
    out_file = os.path.join(output_dir, f"page_{i}.jpg")
    pix.save(out_file)
    print(f"Saved {out_file}")

print("Done")
