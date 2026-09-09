/*
██╗  ██╗ █████╗ ███╗   ███╗███████╗████████╗███████╗██████╗     ███████╗ ██████╗ ███████╗████████╗██╗    ██╗ █████╗ ██████╗ ███████╗
██║  ██║██╔══██╗████╗ ████║██╔════╝╚══██╔══╝██╔════╝██╔══██╗    ██╔════╝██╔═══██╗██╔════╝╚══██╔══╝██║    ██║██╔══██╗██╔══██╗██╔════╝
███████║███████║██╔████╔██║███████╗   ██║   █████╗  ██████╔╝    ███████╗██║   ██║█████╗     ██║   ██║ █╗ ██║███████║██████╔╝█████╗  
██╔══██║██╔══██║██║╚██╔╝██║╚════██║   ██║   ██╔══╝  ██╔══██╗    ╚════██║██║   ██║██╔══╝     ██║   ██║███╗██║██╔══██║██╔══██╗██╔══╝  
██║  ██║██║  ██║██║ ╚═╝ ██║███████║   ██║   ███████╗██║  ██║    ███████║╚██████╔╝██║        ██║   ╚███╔███╔╝██║  ██║██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝ ╚═════╝ ╚═╝        ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
*/
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

function processDir(dir, isRecursive = true) {
  if (!fs.existsSync(dir)) return;
  const ignoredDirs = new Set(['node_modules', '.git', 'app', 'components', 'lib', 'scripts', 'tests', 'data', 'public', '.next/cache']);
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isRecursive && !ignoredDirs.has(entry.name) && !fullPath.includes('node_modules')) {
        processDir(fullPath, isRecursive);
      }
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.js') && (fullPath.includes('.next') || fullPath.includes('chunks') || fullPath.includes('out') || fullPath.includes('dist'))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.startsWith('/*\n' + asciiArt)) {
          if (content.startsWith('#!')) {
            const nl = content.indexOf('\n');
            const shebang = content.slice(0, nl + 1);
            const rest = content.slice(nl + 1);
            fs.writeFileSync(fullPath, shebang + jsComment + rest, 'utf8');
          } else {
            fs.writeFileSync(fullPath, jsComment + content, 'utf8');
          }
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

const nextDir = path.join(process.cwd(), '.next');
const serverAppDir = path.join(nextDir, 'server', 'app');
const publicDir = path.join(process.cwd(), 'public');

// Helper to populate a static directory for Cloudflare Pages / CDN hosting
function populateStaticDir(targetDir) {

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Copy public assets (e.g. hamster-software.jpg, icons) to target root
  if (fs.existsSync(publicDir)) {
    if (targetDir !== process.cwd()) {
      fs.cpSync(publicDir, targetDir, { recursive: true });
    } else {
      const publicFiles = fs.readdirSync(publicDir);
      for (const file of publicFiles) {
        const src = path.join(publicDir, file);
        const dest = path.join(targetDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  }

  // 2. Copy generated HTML pages to target root so Cloudflare Pages serves them
  if (fs.existsSync(serverAppDir)) {
    const htmlFiles = fs.readdirSync(serverAppDir).filter(f => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const src = path.join(serverAppDir, file);
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);

      // Create clean URL directory route (e.g. login/index.html from login.html)
      const baseName = path.basename(file, '.html');
      if (baseName !== 'index' && baseName !== '404' && !baseName.startsWith('_')) {
        const routeDir = path.join(targetDir, baseName);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.copyFileSync(src, path.join(routeDir, 'index.html'));
      }

      // Also create 404.html from _not-found.html
      if (file === '_not-found.html') {
        fs.copyFileSync(src, path.join(targetDir, '404.html'));
      }
    }
  }

  // 3. Ensure targetDir/_next/static is available for client bundle requests (/_next/static/...)
  const underNextDir = path.join(targetDir, '_next');
  if (!fs.existsSync(underNextDir)) {
    fs.mkdirSync(underNextDir, { recursive: true });
  }
  const staticSrc = path.join(nextDir, 'static');
  const staticDest = path.join(underNextDir, 'static');
  if (fs.existsSync(staticSrc)) {
    try {
      fs.cpSync(staticSrc, staticDest, { recursive: true });
    } catch (e) {
      console.warn('Warning: Could not copy static dir to ' + targetDir + ':', e.message);
    }
  }

  // 4. Create _redirects and _headers for Cloudflare Pages clean routing
  const redirectsContent = `/agent /#demo-agente 302
`;
  fs.writeFileSync(path.join(targetDir, '_redirects'), redirectsContent, 'utf8');

  const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
/api/*
  Content-Type: application/json; charset=utf-8
  Access-Control-Allow-Origin: *
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
`;
  fs.writeFileSync(path.join(targetDir, '_headers'), headersContent, 'utf8');

  // Inject ASCII into HTML files
  if (targetDir !== process.cwd()) {
    processDir(targetDir);
  }
}

// Populate root (if Cloudflare Pages is set to root), out (standard), dist, and .next
const outDir = path.join(process.cwd(), 'out');
const distDir = path.join(process.cwd(), 'dist');

populateStaticDir(process.cwd());
populateStaticDir(outDir);
populateStaticDir(distDir);
populateStaticDir(nextDir);

console.log('✔ Postbuild: Artefactos estáticos (.html, /_next/static, public, _redirects, _headers) preparados en ./, out/, dist/ y .next/ para Cloudflare Pages');

