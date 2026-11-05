#!/usr/bin/env python3
import os
import glob
import fitz  # PyMuPDF
from PIL import Image

def compile_pdf():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    temp_dir = os.path.join(root_dir, '.tmp_pdf_slides')
    output_pdf = os.path.join(root_dir, 'A-Casa-das-Coisas-Vivas-Apresentacao-1920x1080.pdf')

    image_files = sorted(glob.glob(os.path.join(temp_dir, 'page_*.png')))

    if not image_files:
        print("No slide images found to compile!")
        return

    print(f"Compiling {len(image_files)} pages into {os.path.basename(output_pdf)}...")

    doc = fitz.open()

    # Exact 1920 x 1080 dimensions in points (16:9 widescreen)
    PAGE_WIDTH = 1920
    PAGE_HEIGHT = 1080
    page_rect = fitz.Rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

    for i, img_path in enumerate(image_files):
        page = doc.new_page(width=PAGE_WIDTH, height=PAGE_HEIGHT)
        page.insert_image(page_rect, filename=img_path)
        if (i + 1) % 5 == 0 or i == len(image_files) - 1:
            print(f"  Added page {i + 1}/{len(image_files)}")

    # Save PDF with compression for high performance
    doc.save(output_pdf, deflate=True, garbage=3)
    doc.close()

    file_size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
    print(f"\nPDF successfully generated!")
    print(f"  File: {output_pdf}")
    print(f"  Pages: {len(image_files)}")
    print(f"  Dimensions: {PAGE_WIDTH}x{PAGE_HEIGHT} pt (16:9 widescreen)")
    print(f"  Size: {file_size_mb:.2f} MB")

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
