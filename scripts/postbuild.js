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

console.log('✔ Postbuild: Código ASCII inyectado como comentario en archivos compilados (.html y .js)');
