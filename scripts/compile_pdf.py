#!/usr/bin/env python3
import os
import glob
import io
import fitz  # PyMuPDF
from PIL import Image

def compile_pdf():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_dir = os.path.join(root_dir, '.tmp_pdf_slides')
    output_pdf = os.path.join(root_dir, 'A-Casa-das-Coisas-Vivas-Apresentacao-1920x1080.pdf')
    optimized_pdf = os.path.join(root_dir, 'A-Casa-das-Coisas-Vivas-Apresentacao-1920x1080-Otimizado.pdf')

    image_files = sorted(glob.glob(os.path.join(temp_dir, 'page_*.png')))

    if not image_files:
        print("No slide images found to compile!")
        return

    print(f"Compiling {len(image_files)} pages into {os.path.basename(output_pdf)}...")

    doc = fitz.open()
    doc_opt = fitz.open()

    # Exact 1920 x 1080 dimensions in points (16:9 widescreen)
    PAGE_WIDTH = 1920
    PAGE_HEIGHT = 1080
    page_rect = fitz.Rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

    for i, img_path in enumerate(image_files):
        # Master PDF page
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        page.insert_image(page_rect, filename=img_path)

        # Optimized PDF page (JPEG quality 88)
        im = Image.open(img_path)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        buf = io.BytesIO()
        im.save(buf, format='JPEG', quality=88, optimize=True)
        jpg_bytes = buf.getvalue()

        p_opt = doc_opt.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        p_opt.insert_image(page_rect, stream=jpg_bytes)

        if (i + 1) % 5 == 0 or i == len(image_files) - 1:
            print(f"  Processed page {i + 1}/{len(image_files)}")

    # Save Master PDF
    doc.save(output_pdf, deflate=True, garbage=3)
    doc.close()

    # Save Optimized PDF
    doc_opt.save(optimized_pdf, deflate=True, garbage=4)
    doc_opt.close()

    master_size = os.path.getsize(output_pdf) / (1024 * 1024)
    opt_size = os.path.getsize(optimized_pdf) / (1024 * 1024)
    print(f"\nPDFs successfully generated!")
    print(f"  Master PDF:    {output_pdf} ({master_size:.1f} MB)")
    print(f"  Optimized PDF: {optimized_pdf} ({opt_size:.1f} MB)")
    print(f"  Pages: {len(image_files)}")
    print(f"  Dimensions: {PAGE_WIDTH}x{PAGE_HEIGHT} pt (16:9 widescreen)")

    # Clean up temporary PNG files
    for img_path in image_files:
        try:
            os.remove(img_path)
        except OSError:
            pass
    try:
        os.rmdir(temp_dir)
    except OSError:
        pass
    print("Temporary image cache cleaned up.")

if __name__ == '__main__':
    compile_pdf()
