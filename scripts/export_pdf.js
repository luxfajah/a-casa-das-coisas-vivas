const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8099;
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(ROOT_DIR, '.tmp_pdf_slides');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 1. Static HTTP Server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(ROOT_DIR, reqPath === '/' ? 'index.html' : reqPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const mimeMap = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.otf': 'font/otf',
      '.ttf': 'font/ttf',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, async () => {
  console.log(`Server started on http://localhost:${PORT}`);

  try {
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1000));

    // Disable CSS animations/transitions and hide HUD
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
        .presentation-hud, .hud-trigger-zone, .rotation-warning-overlay, .logo-lightbox-overlay {
          display: none !important;
        }
      `
    });

    const slidesMeta = await page.evaluate(() => {
      const slides = Array.from(document.querySelectorAll('.slide'));
      return slides.map((s, idx) => ({
        index: idx,
        id: s.id,
        theme: s.getAttribute('data-theme') || 'off-white'
      }));
    });

    console.log(`Found ${slidesMeta.length} slides in presentation.`);

    let slideNum = 0;
    const capturedImages = [];

    for (let i = 0; i < slidesMeta.length; i++) {
      const meta = slidesMeta[i];

      if (meta.id === 'slide-1015-gallery') {
        // Handle each item of the gallery
        const galleryCount = await page.evaluate(() => {
          const gSlide = document.getElementById('slide-1015-gallery');
          return gSlide.querySelectorAll('.gallery-1015-item').length;
        });

        console.log(`Exporting Gallery with ${galleryCount} mockups...`);

        for (let gIdx = 0; gIdx < galleryCount; gIdx++) {
          slideNum++;
          const imgName = `page_${String(slideNum).padStart(3, '0')}_gallery_${gIdx + 1}.png`;
          const imgPath = path.join(TEMP_DIR, imgName);

          await page.evaluate((activeGIdx) => {
            const slides = document.querySelectorAll('.slide');
            slides.forEach(s => s.classList.remove('active', 'past', 'future'));
            const gSlide = document.getElementById('slide-1015-gallery');
            gSlide.classList.add('active');

            const items = gSlide.querySelectorAll('.gallery-1015-item');
            items.forEach((it, idx) => {
              if (idx === activeGIdx) it.classList.add('active');
              else it.classList.remove('active');
            });

            const currentNumEl = gSlide.querySelector('#gallery-current-num');
            if (currentNumEl) currentNumEl.textContent = String(activeGIdx + 1).padStart(2, '0');

            const vid = gSlide.querySelector('.gallery-1015-item.active video');
            if (vid) {
              vid.currentTime = 1.0;
            }

            document.body.style.backgroundColor = '#FAF9F6';
          }, gIdx);

          // Give a short moment for video frame or image rendering
          await new Promise(r => setTimeout(r, 500));
          await page.screenshot({ path: imgPath });
          capturedImages.push(imgPath);
          console.log(`Captured [${slideNum}] Mockup ${gIdx + 1}/${galleryCount}`);
        }
      } else {
        slideNum++;
        const imgName = `page_${String(slideNum).padStart(3, '0')}_${meta.id}.png`;
        const imgPath = path.join(TEMP_DIR, imgName);

        await page.evaluate((targetIdx) => {
          const slides = document.querySelectorAll('.slide');
          slides.forEach((s, idx) => {
            s.classList.remove('active', 'past', 'future');
            if (idx === targetIdx) s.classList.add('active');
            else if (idx < targetIdx) s.classList.add('past');
            else s.classList.add('future');
          });

          const activeSlide = slides[targetIdx];
          const theme = activeSlide ? activeSlide.getAttribute('data-theme') : 'off-white';

          if (activeSlide && activeSlide.id === 'slide-18') {
            document.body.style.backgroundColor = '#14523E';
          } else if (theme === 'dark-petrol' || theme === 'dark') {
            document.body.style.backgroundColor = '#1C262B';
          } else if (theme === 'sand-paper') {
            document.body.style.backgroundColor = '#F4F0EA';
          } else if (theme === 'neutral-grey') {
            document.body.style.backgroundColor = '#ECE9E3';
          } else {
            document.body.style.backgroundColor = '#FAF9F6';
          }
        }, i);

        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: imgPath });
        capturedImages.push(imgPath);
        console.log(`Captured [${slideNum}] Slide: ${meta.id}`);
      }
    }

    await browser.close();
    server.close();

    console.log(`\nSuccessfully captured ${capturedImages.length} high-resolution slides.`);

    // Run python script to compile into PDF
    console.log('Compiling into final 1920x1080 PDF...');
    execSync('python3 scripts/compile_pdf.py', { cwd: ROOT_DIR, stdio: 'inherit' });

  } catch (err) {
    console.error('Error exporting PDF:', err);
    server.close();
    process.exit(1);
  }
});
