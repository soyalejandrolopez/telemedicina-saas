const fs = require('fs');
const path = require('path');

const asciiArt = `██╗  ██╗ █████╗ ███╗   ███╗███████╗████████╗███████╗██████╗     ███████╗ ██████╗ ███████╗████████╗██╗    ██╗ █████╗ ██████╗ ███████╗
██║  ██║██╔══██╗████╗ ████║██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝██║    ██║██╔══██╗██╔══██╗██╔════╝
███████║███████║██╔████╔██║███████╗   ██║   █████╗  ██████╔╝    ███████╗██║   ██║█████╗     ██║   ██║ █╗ ██║███████║██████╔╝█████╗  
██╔══██║██╔══██║██║╚██╔╝██║╚════██║   ██║   ██╔══╝  ██╔══██╗    ╚════██║██║   ██║██╔══╝     ██║   ██║███╗██║██╔══██║██╔══██╗██╔══╝  
██║  ██║██║  ██║██║ ╚═╝ ██║███████║   ██║   ███████╗██║  ██║    ███████║╚██████╔╝██║        ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝ ╚═════╝ ╚═╝        ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝`;

const jsComment = `/*\n${asciiArt}\n*/\n`;
const htmlComment = `<!--\n${asciiArt}\n-->\n`;

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.startsWith('/*\n' + asciiArt)) {
          fs.writeFileSync(fullPath, jsComment + content, 'utf8');
        }
      } else if (entry.name.endsWith('.html')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.startsWith('<!--\n' + asciiArt)) {
          fs.writeFileSync(fullPath, htmlComment + content, 'utf8');
        }
      }
    }
  }
}

// Inject into compiled client chunks and server output
processDir(path.join(process.cwd(), '.next', 'static', 'chunks'));
processDir(path.join(process.cwd(), '.next', 'server', 'app'));

// Prepare .next directory for Cloudflare Pages static hosting
const nextDir = path.join(process.cwd(), '.next');
const serverAppDir = path.join(nextDir, 'server', 'app');
const publicDir = path.join(process.cwd(), 'public');

// 1. Copy public assets (e.g. hamster-software.jpg, icons) to .next root
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, nextDir, { recursive: true });
}

// 2. Copy generated HTML pages to .next root so Cloudflare Pages serves them
if (fs.existsSync(serverAppDir)) {
  const htmlFiles = fs.readdirSync(serverAppDir).filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    const src = path.join(serverAppDir, file);
    const dest = path.join(nextDir, file);
    fs.copyFileSync(src, dest);
    // Also create 404.html from _not-found.html
    if (file === '_not-found.html') {
      fs.copyFileSync(src, path.join(nextDir, '404.html'));
    }
  }
}

// 3. Ensure .next/_next/static is available for client bundle requests (/_next/static/...)
const underNextDir = path.join(nextDir, '_next');
if (!fs.existsSync(underNextDir)) {
  fs.mkdirSync(underNextDir, { recursive: true });
}
const staticSrc = path.join(nextDir, 'static');
const staticDest = path.join(underNextDir, 'static');
if (fs.existsSync(staticSrc) && !fs.existsSync(staticDest)) {
  try {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  } catch (e) {
    console.warn('Warning: Could not copy static dir:', e.message);
  }
}

// Inject ASCII into any newly copied HTML files in .next root
processDir(nextDir);

console.log('✔ Postbuild: Código ASCII inyectado y artefactos estáticos (.html, /_next/static, public) preparados en .next para Cloudflare Pages');
