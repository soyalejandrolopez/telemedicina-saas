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
/dashboard /login 302
/appointments /login 302
/patients /login 302
/doctors /login 302
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

  // 5. Generate fallback static JSON endpoints for Cloudflare Pages static CDN
  const apiDir = path.join(targetDir, 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const defaultSlots = [
    { time: '09:00', datetime: '2026-09-09T09:00:00', available: true },
    { time: '09:30', datetime: '2026-09-09T09:30:00', available: true },
    { time: '10:00', datetime: '2026-09-09T10:00:00', available: true },
    { time: '10:30', datetime: '2026-09-09T10:30:00', available: true },
    { time: '11:00', datetime: '2026-09-09T11:00:00', available: true },
    { time: '11:30', datetime: '2026-09-09T11:30:00', available: true },
    { time: '14:00', datetime: '2026-09-09T14:00:00', available: true },
    { time: '14:30', datetime: '2026-09-09T14:30:00', available: true },
    { time: '15:00', datetime: '2026-09-09T15:00:00', available: true },
    { time: '15:30', datetime: '2026-09-09T15:30:00', available: true },
    { time: '16:00', datetime: '2026-09-09T16:00:00', available: true },
    { time: '16:30', datetime: '2026-09-09T16:30:00', available: true }
  ];

  const slotsPayload = JSON.stringify({ slots: defaultSlots, count: defaultSlots.length, availableCount: defaultSlots.length });
  fs.writeFileSync(path.join(apiDir, 'slots'), slotsPayload, 'utf8');
  fs.writeFileSync(path.join(apiDir, 'slots.json'), slotsPayload, 'utf8');

  const apptPayload = JSON.stringify({
    success: true,
    appointment: {
      id: 'apt_demo_' + Date.now(),
      status: 'scheduled',
      booked_via: 'voice_agent',
      notes: 'Confirmado por Agente IA MediSchedule'
    }
  });
  fs.writeFileSync(path.join(apiDir, 'appointments'), apptPayload, 'utf8');
  fs.writeFileSync(path.join(apiDir, 'appointments.json'), apptPayload, 'utf8');

  const defaultDoctors = [
    {
      id: 'doc_yc83uckgmttqbj11',
      name: 'Dr. Alejandro Mendoza',
      specialty: 'Cardiología',
      license_num: 'COL-MED-62118',
      bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',
      active: 1,
    },
    {
      id: 'doc_ojolu4lpmttqbj12',
      name: 'Dra. Elena Vargas',
      specialty: 'Pediatría',
      license_num: 'COL-MED-93451',
      bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
      active: 1,
    },
    {
      id: 'doc_39ebgkzzmttqbj11',
      name: 'Dra. Sofía Morales',
      specialty: 'Medicina General',
      license_num: 'COL-MED-84920',
      bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',
      active: 1,
    },
  ];
  const docPayload = JSON.stringify({ doctors: defaultDoctors, count: defaultDoctors.length });
  fs.writeFileSync(path.join(apiDir, 'doctors'), docPayload, 'utf8');
  fs.writeFileSync(path.join(apiDir, 'doctors.json'), docPayload, 'utf8');

  const defaultPatients = [
    {
      id: 'pat_anvm4atcmttqbj12',
      mrn: 'EXP-100234',
      name: 'María Fernanda López',
      phone: '+34 612 345 678',
      email: 'maria.lopez@example.com',
      blood_type: 'O+',
      notes: 'Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.',
    },
    {
      id: 'pat_ltcghry1mttqbj12',
      mrn: 'EXP-100582',
      name: 'Carlos Eduardo Ruiz',
      phone: '+34 655 987 321',
      email: 'carlos.ruiz@example.com',
      blood_type: 'A+',
      notes: 'Hipertensión arterial grado 1 en control.',
    },
    {
      id: 'pat_h25o9ic0mttqbj12',
      mrn: 'EXP-100911',
      name: 'Lucía Méndez Gómez',
      phone: '+34 688 443 219',
      email: 'madre.lucia@example.com',
      blood_type: 'B+',
      notes: 'Control de crecimiento pediátrico al día.',
    },
  ];
  const patPayload = JSON.stringify({ patients: defaultPatients, count: defaultPatients.length });
  fs.writeFileSync(path.join(apiDir, 'patients'), patPayload, 'utf8');
  fs.writeFileSync(path.join(apiDir, 'patients.json'), patPayload, 'utf8');

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

