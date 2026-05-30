/* ==============================
   INTRO — Matrix/Phosphor canvas
   ============================== */
const canvas = document.getElementById('intro-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mix of katakana, binary and symbols for retro feel
const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01アβ∑ΔΩ#@!%&◆◇▲△□■░▒▓';
const fontSize = 13;
let columns, drops, colors;

function initDrops() {
  columns = Math.floor(canvas.width / fontSize);
  drops   = Array.from({ length: columns }, () => Math.random() * -80);
  colors  = Array.from({ length: columns }, () => Math.random());
}
initDrops();

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.055)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const bright = Math.random() > 0.92;

    if (bright) {
      ctx.fillStyle = '#ffffff';
    } else if (colors[i] > 0.6) {
      ctx.fillStyle = 'rgba(224,64,251,0.7)';
    } else if (colors[i] > 0.3) {
      ctx.fillStyle = 'rgba(0,229,255,0.5)';
    } else {
      ctx.fillStyle = 'rgba(105,255,71,0.4)';
    }

    ctx.fillText(char, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
      colors[i] = Math.random();
    }
    drops[i]++;
  }
}

let matrixInterval = setInterval(drawMatrix, 40);

/* ==============================
   INTRO — dismiss logic
   ============================== */
const intro  = document.getElementById('intro');
let dismissed = false;

function dismissIntro() {
  if (dismissed) return;
  dismissed = true;
  clearInterval(matrixInterval);
  intro.classList.add('hidden');
  document.body.style.overflow = '';
}

// Auto dismiss after bar finishes
const autoDismiss = setTimeout(dismissIntro, 4000);

document.addEventListener('keydown', () => {
  clearTimeout(autoDismiss);
  dismissIntro();
});

intro.addEventListener('click', () => {
  clearTimeout(autoDismiss);
  dismissIntro();
});

document.body.style.overflow = 'hidden';

/* ==============================
   SCROLL REVEAL
   ============================== */
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

/* ==============================
   ACTIVE NAV HIGHLIGHT
   ============================== */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ==============================
   SMOOTH SCROLL
   ============================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ==============================
   THEME FLASH ELEMENT
   ============================== */
const flashEl = document.createElement('div');
flashEl.className = 'theme-flash';
document.body.appendChild(flashEl);

/* ==============================
   THEME MODE SWITCH
   ============================== */
const themeToggle = document.getElementById('theme-toggle');
const heroPhoto   = document.getElementById('hero-photo');
const heroModeNote = document.getElementById('hero-mode-note');

function updateHeroImage(mode) {
  if (!heroPhoto) return;
  const newSrc = heroPhoto.dataset[mode] || heroPhoto.dataset.dark;

  // Animate the photo swap
  heroPhoto.classList.add('theme-transition');
  setTimeout(() => {
    heroPhoto.src = newSrc;
    heroPhoto.classList.remove('hidden');
    const placeholder = document.querySelector('.placeholder-img');
    if (placeholder) placeholder.classList.add('hidden');
  }, 300); // swap src at midpoint of animation
  setTimeout(() => {
    heroPhoto.classList.remove('theme-transition');
  }, 700);
}

function triggerFlash() {
  flashEl.classList.remove('burst');
  void flashEl.offsetWidth; // reflow
  flashEl.classList.add('burst');
}

function applyTheme(mode, animate = false) {
  if (animate) {
    triggerFlash();
  }

  setTimeout(() => {
    document.body.classList.toggle('light', mode === 'light');
    document.body.classList.toggle('dark',  mode === 'dark');

    if (heroModeNote) {
      heroModeNote.textContent = mode === 'light'
        ? '☀ LIGHT MODE — retro paper aesthetic active'
        : '⚡ DARK MODE — CRT synthwave active';
    }

    updateHeroImage(mode);
    localStorage.setItem('preferredTheme', mode);
  }, animate ? 80 : 0);
}

function getPreferredTheme() {
  const saved = localStorage.getItem('preferredTheme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // DEFAULT: dark mode
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.body.classList.contains('light') ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light', true);
  });
}

// Apply theme on load (no animation on initial load)
applyTheme(getPreferredTheme(), false);

/* ==============================
   TYPING EFFECT on hero tag
   ============================== */
const heroTag = document.querySelector('.hero-tag');
if (heroTag) {
  const originalText = heroTag.textContent.trim();
  heroTag.textContent = '';
  let i = 0;
  const typeInterval = setInterval(() => {
    heroTag.textContent += originalText[i];
    i++;
    if (i >= originalText.length) clearInterval(typeInterval);
  }, 40);
}

/* ==============================
   CURSOR GLOW (dark mode only)
   ============================== */
let cursorGlow = null;

function initCursorGlow() {
  if (cursorGlow) return;
  cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = `
    position: fixed;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(224,64,251,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9997;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top  = e.clientY + 'px';
    }
  });
}

function updateCursorGlow() {
  const isDark = !document.body.classList.contains('light');
  if (isDark) {
    initCursorGlow();
    if (cursorGlow) cursorGlow.style.opacity = '1';
  } else {
    if (cursorGlow) cursorGlow.style.opacity = '0';
  }
}

// Run after theme applied
setTimeout(updateCursorGlow, 200);
if (themeToggle) {
  themeToggle.addEventListener('click', () => setTimeout(updateCursorGlow, 300));
}

/* ==============================
   RETRO GLITCH ON HOVER (project cards)
   ============================== */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const title = card.querySelector('.project-title');
    if (!title || document.body.classList.contains('light')) return;
    title.style.animation = 'none';
    title.style.textShadow = '2px 0 #00e5ff, -2px 0 #e040fb';
    setTimeout(() => {
      title.style.textShadow = '';
      title.style.animation = '';
    }, 200);
  });
});

/* ==============================
   HAMBURGER MENU
   ============================== */

// Build the nav drawer dynamically
const drawer = document.createElement('div');
drawer.className = 'nav-drawer';
drawer.innerHTML = `
  <button class="nav-drawer-close">[ ESC / CLOSE ]</button>
  <a href="#hero"     class="drawer-link">HOME</a>
  <a href="#about"    class="drawer-link">ABOUT</a>
  <a href="#projects" class="drawer-link">PROJECTS</a>
  <a href="https://www.facebook.com/Coryxcarlos" target="_blank" rel="noopener" class="drawer-link">FACEBOOK</a>
`;
document.body.appendChild(drawer);

const hamburger = document.getElementById('hamburger');

function openDrawer() {
  drawer.style.display = 'flex';
  requestAnimationFrame(() => drawer.classList.add('open'));
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  setTimeout(() => { drawer.style.display = 'none'; }, 400);
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
}

drawer.querySelector('.nav-drawer-close').addEventListener('click', closeDrawer);

drawer.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    closeDrawer();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 420);
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});

// Re-apply drawer bg on theme change
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  setTimeout(() => {
    // drawer inherits CSS vars via body class, no extra work needed
  }, 100);
});
/* ==============================
   CV DOWNLOAD — Terminal Animation + PDF Generation
   ============================== */

const cvBtn    = document.getElementById('cv-download-btn');
const cvModal  = document.getElementById('cv-modal');
const cvDoneClose = document.getElementById('cv-done-close');
const cvTerminal  = document.getElementById('cv-terminal-lines');
const cvProgressBar  = document.getElementById('cv-progress-bar');
const cvProgressText = document.getElementById('cv-progress-text');
const cvPhaseCompile = document.getElementById('cv-phase-compile');
const cvPhaseDone    = document.getElementById('cv-phase-done');

const terminalLines = [
  { delay: 0,    text: '$ initializing cv_compiler.exe', cls: '' },
  { delay: 300,  text: '> loading profile data...', cls: 'cv-info' },
  { delay: 620,  text: '✓ name: Carlos Daniel L. Saguran', cls: 'cv-ok' },
  { delay: 860,  text: '✓ degree: BS Information Technology', cls: 'cv-ok' },
  { delay: 1060, text: '✓ institution: STI College Global City', cls: 'cv-ok' },
  { delay: 1260, text: '> compiling skills matrix...', cls: 'cv-info' },
  { delay: 1480, text: '✓ HTML · CSS · JavaScript · Java · C# · C++', cls: 'cv-ok' },
  { delay: 1680, text: '✓ Web Dev · UI/UX · Network Config', cls: 'cv-ok' },
  { delay: 1880, text: '> rendering project blocks...', cls: 'cv-info' },
  { delay: 2080, text: '✓ [01] LiveAlert — PNP integration system', cls: 'cv-ok' },
  { delay: 2250, text: '✓ [02] MedTrack — sales performance dashboard', cls: 'cv-ok' },
  { delay: 2420, text: '✓ [03] Night City — 2D cyberpunk platformer', cls: 'cv-ok' },
  { delay: 2620, text: '> applying formal document layout...', cls: 'cv-info' },
  { delay: 2860, text: '✓ formatting complete', cls: 'cv-ok' },
  { delay: 3060, text: '$ generating PDF...', cls: '' },
];

const progressSteps = [
  { at: 400,  pct: 10 },
  { at: 700,  pct: 22 },
  { at: 1000, pct: 38 },
  { at: 1300, pct: 52 },
  { at: 1600, pct: 65 },
  { at: 1900, pct: 76 },
  { at: 2200, pct: 85 },
  { at: 2600, pct: 93 },
  { at: 3100, pct: 100 },
];

function setProgress(pct) {
  cvProgressBar.style.width = pct + '%';
  cvProgressText.textContent = pct + '%';
}

function addTerminalLine(text, cls, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const line = document.createElement('span');
      line.className = 'cv-line';
      line.style.animationDelay = '0s';

      const prompt = document.createElement('span');
      prompt.className = 'cv-prompt';
      prompt.textContent = '›';

      const content = document.createElement('span');
      if (cls) content.className = cls;
      content.textContent = ' ' + text;

      line.appendChild(prompt);
      line.appendChild(content);
      cvTerminal.appendChild(line);
      cvTerminal.scrollTop = cvTerminal.scrollHeight;
      resolve();
    }, delay);
  });
}

function generateCVContent() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Carlos Daniel L. Saguran — Curriculum Vitae</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Lato', 'Times New Roman', serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1a1a1a;
    background: #fff;
    padding: 0;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 18mm 20mm 18mm 22mm;
    background: #fff;
  }

  /* Header */
  .cv-header {
    border-bottom: 2.5pt solid #1a1a1a;
    padding-bottom: 10pt;
    margin-bottom: 14pt;
  }

  .cv-name {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 26pt;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #0a0a0a;
    line-height: 1.1;
    margin-bottom: 3pt;
  }

  .cv-title-line {
    font-size: 10pt;
    font-weight: 400;
    color: #333;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cv-contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0 20pt;
    margin-top: 7pt;
    font-size: 9pt;
    color: #444;
  }

  .cv-contact-row span { display: inline-flex; align-items: center; gap: 4pt; }

  /* Section */
  .cv-section {
    margin-bottom: 14pt;
  }

  .cv-section-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0a0a0a;
    border-bottom: 0.75pt solid #888;
    padding-bottom: 2pt;
    margin-bottom: 7pt;
  }

  /* Education */
  .cv-edu-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10pt;
  }

  .cv-edu-left .cv-degree {
    font-weight: 700;
    font-size: 10.5pt;
    color: #111;
  }

  .cv-edu-left .cv-school {
    font-size: 10pt;
    color: #333;
    font-style: italic;
  }

  .cv-edu-right {
    text-align: right;
    font-size: 9.5pt;
    color: #555;
    white-space: nowrap;
  }

  /* Skills */
  .cv-skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4pt 20pt;
  }

  .cv-skill-cat {
    font-size: 9.5pt;
  }

  .cv-skill-cat strong {
    color: #111;
    font-weight: 700;
  }

  /* Projects */
  .cv-project {
    margin-bottom: 10pt;
  }

  .cv-project-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2pt;
  }

  .cv-project-name {
    font-weight: 700;
    font-size: 10.5pt;
    color: #111;
  }

  .cv-project-tags {
    font-size: 8.5pt;
    color: #666;
    font-style: italic;
  }

  .cv-project-desc {
    font-size: 9.5pt;
    color: #333;
    line-height: 1.5;
  }

  /* Profile summary */
  .cv-summary {
    font-size: 10pt;
    color: #222;
    line-height: 1.6;
  }

  /* Footer */
  .cv-footer {
    margin-top: 18pt;
    padding-top: 8pt;
    border-top: 0.75pt solid #aaa;
    font-size: 8pt;
    color: #888;
    display: flex;
    justify-content: space-between;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; padding: 14mm 18mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="cv-header">
    <div class="cv-name">Carlos Daniel L. Saguran</div>
    <div class="cv-title-line">Bachelor of Science in Information Technology &nbsp;·&nbsp; STI College Global City</div>
    <div class="cv-contact-row">
      <span>&#127758; Philippines</span>
      <span>&#128100; facebook.com/Coryxcarlos</span>
      <span>&#127979; 2026 Graduate (Expected)</span>
    </div>
  </div>

  <!-- PROFESSIONAL SUMMARY -->
  <div class="cv-section">
    <div class="cv-section-title">Professional Summary</div>
    <p class="cv-summary">
      A highly motivated Information Technology student at STI College Global City with a strong foundation
      in software development, web technologies, and system design. Demonstrated ability to architect and
      deliver end-to-end technical solutions across multiple domains — including public-safety platforms,
      enterprise dashboards, and interactive digital experiences. Committed to continuous learning and
      applying innovative thinking to solve real-world challenges.
    </p>
  </div>

  <!-- EDUCATION -->
  <div class="cv-section">
    <div class="cv-section-title">Education</div>
    <div class="cv-edu-item">
      <div class="cv-edu-left">
        <div class="cv-degree">Bachelor of Science in Information Technology</div>
        <div class="cv-school">STI College Global City &nbsp;·&nbsp; Philippines</div>
      </div>
      <div class="cv-edu-right">
        2022 – Present<br/>
        Expected Graduation: 2026
      </div>
    </div>
  </div>

  <!-- TECHNICAL SKILLS -->
  <div class="cv-section">
    <div class="cv-section-title">Technical Skills</div>
    <div class="cv-skills-grid">
      <div class="cv-skill-cat">
        <strong>Programming Languages</strong><br/>
        HTML5, CSS3, JavaScript (ES6+), Java, C#, C++
      </div>
      <div class="cv-skill-cat">
        <strong>Web Development</strong><br/>
        Responsive design, DOM manipulation, RESTful APIs
      </div>
      <div class="cv-skill-cat">
        <strong>Systems &amp; Tools</strong><br/>
        Database management, system architecture, dashboards
      </div>
      <div class="cv-skill-cat">
        <strong>Other Competencies</strong><br/>
        UI/UX Design, hardware troubleshooting, network configuration
      </div>
    </div>
  </div>

  <!-- PROJECTS -->
  <div class="cv-section">
    <div class="cv-section-title">Selected Projects</div>

    <div class="cv-project">
      <div class="cv-project-header">
        <span class="cv-project-name">LiveAlert — Incident Reporting & Live Stream System</span>
        <span class="cv-project-tags">JavaScript · Web Development · PNP Integration</span>
      </div>
      <p class="cv-project-desc">
        Developed a real-time incident reporting platform integrated with the Philippine National Police (PNP).
        The system enables citizens to initiate live video streams and submit reports directly to local PNP units,
        facilitating faster emergency response and enhancing community safety monitoring through a centralised
        web-based interface.
      </p>
    </div>

    <div class="cv-project">
      <div class="cv-project-header">
        <span class="cv-project-name">MedTrack — Medical Sales Representative Performance System</span>
        <span class="cv-project-tags">C# · Database · System Development</span>
      </div>
      <p class="cv-project-desc">
        Designed and implemented a comprehensive performance tracking system for medical sales representatives.
        The platform provides a centralised management dashboard for monitoring field activities, client visit
        logs, territory-based sales metrics, and automated performance reporting — enabling data-driven
        decision-making for regional managers.
      </p>
    </div>

    <div class="cv-project">
      <div class="cv-project-header">
        <span class="cv-project-name">Night City — 2D Cyberpunk Platformer Game</span>
        <span class="cv-project-tags">Game Development · 2D · Solo Project</span>
      </div>
      <p class="cv-project-desc">
        Sole developer of a 2D side-scrolling platformer set in a neon-lit cyberpunk environment.
        Responsibilities encompassed end-to-end game development including level design, custom enemy
        artificial intelligence, atmospheric audio integration, and interactive mechanics — demonstrating
        proficiency in creative problem-solving and independent project management.
      </p>
    </div>
  </div>

  <!-- PROFESSIONAL ATTRIBUTES -->
  <div class="cv-section">
    <div class="cv-section-title">Professional Attributes</div>
    <div class="cv-skills-grid">
      <div class="cv-skill-cat">&#10003; &nbsp;Strong analytical and problem-solving ability</div>
      <div class="cv-skill-cat">&#10003; &nbsp;Self-directed learner with initiative</div>
      <div class="cv-skill-cat">&#10003; &nbsp;Full-stack project ownership experience</div>
      <div class="cv-skill-cat">&#10003; &nbsp;Open to collaborative and agile workflows</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="cv-footer">
    <span>Carlos Daniel L. Saguran &nbsp;·&nbsp; Curriculum Vitae &nbsp;·&nbsp; 2026</span>
    <span>References available upon request</span>
  </div>

</div>
</body>
</html>
  `;
}

function downloadCV() {
  const b64 = "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIgL0Y0IDUgMCBSIC9GNSA3IDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYSAvRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZyAvTmFtZSAvRjEgL1N1YnR5cGUgL1R5cGUxIC9UeXBlIC9Gb250Cj4+CmVuZG9iagozIDAgb2JqCjw8Ci9CYXNlRm9udCAvVGltZXMtQm9sZCAvRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZyAvTmFtZSAvRjIgL1N1YnR5cGUgL1R5cGUxIC9UeXBlIC9Gb250Cj4+CmVuZG9iago0IDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhLUJvbGQgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YzIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNSAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1PYmxpcXVlIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GNCAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0NvbnRlbnRzIDEyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1LjI3NTYgODQxLjg4OTggXSAvUGFyZW50IDExIDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago3IDAgb2JqCjw8Ci9CYXNlRm9udCAvWmFwZkRpbmdiYXRzIC9OYW1lIC9GNSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0NvbnRlbnRzIDEzIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1LjI3NTYgODQxLjg4OTggXSAvUGFyZW50IDExIDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago5IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgMTEgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iagoxMCAwIG9iago8PAovQXV0aG9yIChDYXJsb3MgRGFuaWVsIEwuIFNhZ3VyYW4pIC9DcmVhdGlvbkRhdGUgKEQ6MjAyNjA1MzAxNDIxMzcrMDAnMDAnKSAvQ3JlYXRvciAoXCh1bnNwZWNpZmllZFwpKSAvS2V5d29yZHMgKCkgL01vZERhdGUgKEQ6MjAyNjA1MzAxNDIxMzcrMDAnMDAnKSAvUHJvZHVjZXIgKFJlcG9ydExhYiBQREYgTGlicmFyeSAtIFwob3BlbnNvdXJjZVwpKSAKICAvU3ViamVjdCAoXCh1bnNwZWNpZmllZFwpKSAvVGl0bGUgKEN1cnJpY3VsdW0gVml0YWUgXDIwNCBDYXJsb3MgRGFuaWVsIEwuIFNhZ3VyYW4pIC9UcmFwcGVkIC9GYWxzZQo+PgplbmRvYmoKMTEgMCBvYmoKPDwKL0NvdW50IDIgL0tpZHMgWyA2IDAgUiA4IDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKMTIgMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggMjc5NQo+PgpzdHJlYW0KR2F1YFU+dVRLSyg0Rk40XDVjSGI3NWU4cVwjIkt0YFpgVkdiW0A+bFZeYT9aZUAnXUpXQkRnTmByIyliRkElcDpLI1duJylCXmNDViFlLCZtUUlJZmFNdF0hcl9JUi8lbDhQM2QzNlEsZnBqJj5ubkMiWmlVImhYRGssdDgwWEFAPEZmP0pYPFlVOHUqbEQiJHAwdVZbbC9BW0hdWVRiK10qbTM1WiVHXGVXLUBgSV4mSC0oV0QmViJjM2hCRClJIyUwTW1bJDU+RlBMW1pbWlprSV9rYic3WDFXZ2AqcUY8aURUWCdaKV42c0VRXi8tSVEvOW8pTkgxKDIjMFxrXy5cJ04odC5VVDU5RDczUVkzWVBqR0lRZV81Rj9VR11OPSlJPEVGazlrUFtoOVpILE9gSzJebFA3TTs5KU44OkMqXU1RKVhrPEJXQXBXVHQqa2poRmc5WkM1aDMlXFpEVUpVMFlFcEZIWC1HKVg9a2JmSCQsO2JyUyFEKG1yQlJDLSslW0pNRio3OHVNQzAtN2tzRFhzYnBqbHBKITRaW2k9a1IkL0RtcHJoMmJtT3FzX2RIcixRNiw0bXIuJD1VZDsrRFtOZz06NEREMlklbjhlUEw2YUlzIkxhXGQhI0EjZiU7bHUwI0BOSkUrJ2NzUyZyXzBGR2VRbEY0MmUvUVkvN3RQOEVvcChoJT9Ca2RPPEFxUSFDJj9fP1hwJkIuWl1MSSY4XEEjI1w7SE1JP2BhWTdJRlxvQklPWUBEVVMwRmdGcVUiTVQiU0MoNGNRSiUiNT1jIzU7TWRUTi5WOTJMSWQjOT9xNj10OENUc0BrIl1WcFdkRmQ6LSRpc1NUdVJDbSlLJTdJVXRIVmxBT2lEKFxXImpRLz84RidoVCRXTEAhTU88LzRuK2FuUztVMj1pVkR0Rk1OYjxCdEEhOWoma0k0RS0yXScraC0hJGdARFRbayJcP2NtLV9QMitDYjYjOW5aZTZwRipfJytsUXFFWUc6S1FcUFBcOSE5V3JpX2wsZzZZcF45TjIpQnMzW19dW1UvQyI6Z1xQPkFNdGRAWXA3Wjhia0VKYCUkRDExMiE/LmN1SnNQL0JRSkJKQGhsVEQna0VQYWxYUkRYPjNpQDBaJWYoX3BxQTlQITlAQW0pNEhqOUxyPHNdVGwwZU5NQWcpX1wvYUpxaF4kKj9rRVc5US9HKko5KzBfKUYmP1lkaUdUb3U4ZWMnTy9oLGdTKCJzWUAkPHNYPE5JRSswNjZgc0JtRCtDPUMrNSRZcT9AdEkxZllORS5hRz9WXWk4LSxhY1tnaGA8JHUiIltOXjJRNWZKVlFVOV4kcjYpbkpmXSwkdUlJJXJsWTZJMz1fUDFxXV1QVDpQRE88RnRuKFIzZydcJjBAPT1oKiNaJG5paz1MJiZiJ1ppQDAnMm5xUUJFcTlvX3JeXV1LRTdoLW9VZSdSPi5hXVViKmAhXG5hOEopKjokZCNrbGdVcGVYLVgsKUtnXy1oY2VHaV1eYmtdUCZrRyNtanBHVzlOTkdvO2YtRlkqWTQvKjEsNlY3YUdYUTtNOTQvXWcsalxUW0k5SEI+NGM9Sz5LOylxSCJab3FCVjouOkluJkpnb0kvQWkuImhXSFgzRVtpRktGLV8jTD5sL3FuLyRXVFhJb3NmMUlZMDZYclBUKjQnK1pBckZGJipATD4taGZhMElHRW0pYzgxczVBNTBZXyNfJ29oajt0I3I3WlRDJz5QWlVyWG9qZyNraGdLb1dJdSMlbV9TOjxgXjlhUT82RytCS2ksZFonVUNtRFdgcUs0R05yVCgxM1VwVXFdQV9pWVVZLz0yX1pgZyJIdV9lPWpNPlQlKTRbOEdjIz5fNVk7ODVPKmF1J3QpODYoQF5aT3NkPVhUVFo3QT5TNnBLP3BDMDUva20uRkBObj1TcFQ7WjkvJ0xHRD8tXm9KPWFmYlsuPixjV1M1KT1pa2VLSlVqMk4yOlNcJzxib1pNJCYkN0ArP2JqMSdeIU5CNy0iMS1eY25gYD5cUDdlaVk9cV9HV2hpSS1BTEgxKDUhayZFW2VpNE1vQCtbXUU2TFdWWVN0T0JLXVE5L21BVi5iYSJAK0JhVklGX1VJUSFMWEhPKShaU3VSaUhSPkwlRjVAT2tWSVpMNHNtcUglaCQ2VWooK2JFPidCKm1eV0FWP19UKSUtKHRSIjQnYkpFITRfR1g2PE5RPGxXI203RURZUWdSU1FuRVpoYT5qIkhvZS9EXD1JJkxUY2kvLidaLCw6JTw7NGI0Tiojck1nUForanJzV243OG9yZEQ3XFwhPTReWFkrWG8hKWc5UihYYDVuWipjQmJxIV4yKkQoXGdSJWFcJWU5NVZeZz83aE9TU2wpUmBcTlF1XWNWQkZXR2NUYlV0Oz5xMXRQSWJcSSVbMklYaTEqYHE7WzpoQ1Mnb2NVXi9DS2dSJ05GWCw2STleR0E0NVNHPkRtKzo2aHVEOjclcnFzLl5qNVVdTzJaOlBfX3MwVDBqa2o9R1spdFlUJTlvOHA7c15DNUluVC11MlxsXjRoZWUkbldYcydPW09OK2UpJVQ3Qm8iWFltQDVaUzBfQSMxQDxFajImVVpsSERyVzJjPHVTVDFfJGlYQ1lONjYxRz87bE51KEdHQ2BTV0AsI1UnJkVGNWJJYUQiTENBSkYpOWguaVlGSSJGJSVROWk5Xz4qZXBUQkxpWVZVbGhfU045UmlJRjkxaj8rOFQ3ajddbVE3ZjcqcVc6W049I2UwVlJWR3JnVE9yYDJCKm4nJCdtUGosZ15obUtzS0BbYUhEbzw3NmlyckNQU2dOTCMlKzhmKjVcSzBbcm1KTFhYLWtHWnNTZDlya0JIRFZVXShJJk1nKmQ1dU1LQzVTcFtcJlhXLV5mOGUxS1NQU1VUPzo/J0AyVkZGP0s9Sz01Sl0lSWQ2OjhCZDdLUzhiKmQ8JyQ7VVRHclJEIXAqLU85OVc6c09PTiNfN3RXPD5NWXMsKiEiRT5mNzUxPmtRSEtMPUJrXkRXZGdmMnFfKSVJWWNaSU1Fb1NIVjMkKFs+QzskLWFEbWVAJkE7WWtzaEBqbkQmYyQ/LVJkW1V1VUZYOytYYWBgKlhQY1xYZnFIXHQ+a2JTV1gnayJjX3A2JWl0Qi1ublg2SCdhYFwjWGUvSEdXTz8nNyFVbWBESUcpKlczNFZyZ0ZEZDQ+PTtZTWUwOlojc14zIkV1Sms0XFFaK25EZmplXCYuUzJeam8hKUtnMyM1WzNWXDJIWUU+XWtyZEchZmNqUmZuOUI8UF9YMztocGYxYEQ7VWpdSnNFQ0FPWGwkLmQ8KXRiSCUlU11PM15AcEtOUmZiLjtTTD1NdD9DPDQwQWMlWi1HRWZiZ0IzLE1zKE5rTzI3UzAnZT9KR2k1JFFUXzhbTSRvVmxMJ2RVIXNSOzZdZUsqVms0aHVQVDlVPUNSNVVubEtaVWUuNEtwSGEyZnBzUD5KPVdsNkVWJz07cnQ7aTVsbGNFK0EuPyg9Wz5jdSYnblhxY10zKDxAJSxbQjZEXk9HTTZ1ZVdhZ2opMUZyVGdqSnNnUHMjIU44YmFFc2MtbV4/YzlVLkcqOyhQXTddWzpbKl9QTyk4YUAzYURySmdaJ2A8JWJJPlZ0MlB1XicyTHNvTnQzQCo7ZyElQ2M4bUNJSj5ROipgaWJZJHAzODZBSFcrS3ElTTc+PFhmfj5lbmRzdHJlYW0KZW5kb2JqCjEzIDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDYxMgo+PgpzdHJlYW0KR2F1MD8/I1EyZCdSZi5HZ3JGNS80RF9lVk8nQihnUmVrRzpvaz8nPGkpJGxlJzRcb01tcTgsY2Q/N01wVlVlNWhnYjU7O1xZXXFNOF0vL1YhNTkwOmwnX1piOmkoWlosX2I0Xl4obyRSVTUpOjJQQ3ReciRfRUtORjZfMkQyXCcubTgma1tOLik3SWFKUEAiN08/T2JYNi4qNCZJJ2g0K3FJSUdRTy9cWylSdUM6aS9HVDpiaiFqVi5LcD1PLFhUO1gqSFJoYGdESGZEPm9OSSlgaEo5Tl9jPFhuN0NUNCxjTEZVODVPNzpgRicyIlFGX0ouMEwncyg2JEdwU0Z1WGYrSmsxcCZHYzkpQVVSQlFXITVLQUloV0JkSHJuJyxQVitjWDh0UVBIYik5TEBZKiFIVGBjN21rJ2kkP0JJYEopdGA+QnBDRlA7M2BTTCxQJUc2YT0hcnFARDBhN3U8PENTMGdFP0sjQDsiIVwlVGoxOjxYUkk0Ij00K1VYSkwrSUNsVTJeVUdibWVWOHJULjtHaFh0Wjk3WTZycEVQZ05ANGBhLClaayEoXDhqcWdsRFcvWUJTbSEyTyVrdGpYRlVoY0o0MixlSTFSMzQ9PDZkUENJSjgsR0hhWiI0I010YF51QUlLSnJCaShPa1xNZGRXVSxjbVtfZj0pPV4wRSduI2VvakciWFQ/UF1uKU45Zz9UUzxbPVYrIStBPWo2WmFYY1k4blVdK2oyMU9rYXNWJTUiKVIsKlVZMFlUSm1eYD8jXnFJQWAyJFYicTtkRyNuTXE0RUxWU0guJlUmdClMMX4+ZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgMTQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAxMzIgMDAwMDAgbiAKMDAwMDAwMDIzOSAwMDAwMCBuIAowMDAwMDAwMzQ3IDAwMDAwIG4gCjAwMDAwMDA0NTkgMDAwMDAgbiAKMDAwMDAwMDU3NCAwMDAwMCBuIAowMDAwMDAwNzc5IDAwMDAwIG4gCjAwMDAwMDA4NjIgMDAwMDAgbiAKMDAwMDAwMTA2NyAwMDAwMCBuIAowMDAwMDAxMTM2IDAwMDAwIG4gCjAwMDAwMDE0NjEgMDAwMDAgbiAKMDAwMDAwMTUyNyAwMDAwMCBuIAowMDAwMDA0NDE0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPGVhOTA4NzQwOWE5NGNkMzVmNzI1NjhjMjkzYzA3NDc3PjxlYTkwODc0MDlhOTRjZDM1ZjcyNTY4YzI5M2MwNzQ3Nz5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChvcGVuc291cmNlKQoKL0luZm8gMTAgMCBSCi9Sb290IDkgMCBSCi9TaXplIDE0Cj4+CnN0YXJ0eHJlZgo1MTE3CiUlRU9GCg==";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Carlos_Daniel_Saguran_CV.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function runCVSequence() {
  // Reset state
  cvTerminal.innerHTML = '';
  setProgress(0);
  cvPhaseCompile.classList.remove('hidden');
  cvPhaseDone.classList.add('hidden');

  // Open modal
  cvModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Queue terminal lines
  terminalLines.forEach(({ delay, text, cls }) => {
    addTerminalLine(text, cls, delay);
  });

  // Progress bar steps
  progressSteps.forEach(({ at, pct }) => {
    setTimeout(() => setProgress(pct), at);
  });

  // At 100% → trigger download and show done phase
  setTimeout(() => {
    downloadCV();

    setTimeout(() => {
      cvPhaseCompile.classList.add('hidden');
      cvPhaseDone.classList.remove('hidden');
    }, 400);
  }, 3200);
}

function closeCVModal() {
  cvModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (cvBtn) {
  cvBtn.addEventListener('click', runCVSequence);
}

if (cvDoneClose) {
  cvDoneClose.addEventListener('click', closeCVModal);
}

cvModal?.addEventListener('click', (e) => {
  if (e.target === cvModal) closeCVModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cvModal?.classList.contains('open')) closeCVModal();
});