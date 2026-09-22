/* OmniUtil Core Application Controller */
const OMNI_TOOLS = [
  { id: 'file-compressor', name: 'File-Size Compressor', url: 'tools/file-size-compressor.html', icon: '⚡', category: 'Media', desc: 'Compress images & files right in your browser with live ratio preview.' },
  { id: 'image-converter', name: 'Image Converter', url: 'tools/image-converter.html', icon: '🖼️', category: 'Media', desc: 'Convert images between PNG, JPG, WEBP, and BMP formats instantly.' },
  { id: 'word-counter', name: 'Word Counter', url: 'tools/word-counter.html', icon: '📝', category: 'Text', desc: 'Real-time word, character, paragraph counter & reading time stats.' },
  { id: 'qr-generator', name: 'QR Code Generator', url: 'tools/qr-code-generator.html', icon: '📱', category: 'Utility', desc: 'Create custom QR codes with colors, scale & instant SVG/PNG download.' },
  { id: 'password-generator', name: 'Password Generator', url: 'tools/password-generator.html', icon: '🔒', category: 'Security', desc: 'Generate high-entropy secure passwords with length & symbol controls.' },
  { id: 'age-calculator', name: 'Age Calculator', url: 'tools/age-calculator.html', icon: '🎂', category: 'Math', desc: 'Calculate exact age down to seconds, total days & upcoming birthday.' },
  { id: 'case-converter', name: 'Text Case Converter', url: 'tools/text-case-converter.html', icon: '🔤', category: 'Text', desc: 'Convert text to UPPERCASE, camelCase, Title Case, snake_case & more.' },
  { id: 'json-formatter', name: 'JSON Formatter', url: 'tools/json-formatter.html', icon: 'JSON', category: 'Developer', desc: 'Format, minify, validate & navigate JSON data with tree view.' },
  { id: 'color-converter', name: 'Color Converter', url: 'tools/color-converter.html', icon: '🎨', category: 'Design', desc: 'Convert between HEX, RGB, HSL, CMYK & test WCAG contrast ratios.' },
  { id: 'base64-converter', name: 'Base64 Encoder/Decoder', url: 'tools/base64-converter.html', icon: '🔐', category: 'Developer', desc: 'Encode and decode text or files to/from Base64 strings.' },
  { id: 'stopwatch-timer', name: 'Stopwatch & Timer', url: 'tools/stopwatch-timer.html', icon: '⏱️', category: 'Utility', desc: 'Precision millisecond stopwatch with lap times & countdown chime.' },
  { id: 'markdown-converter', name: 'Markdown to HTML', url: 'tools/markdown-to-html.html', icon: '📄', category: 'Developer', desc: 'Live Markdown side-by-side previewer & HTML generator.' },
  { id: 'unit-converter', name: 'Unit Converter', url: 'tools/unit-converter.html', icon: '📐', category: 'Math', desc: 'Convert Length, Weight, Temperature, Data Size & Speed units.' },
  { id: 'image-to-html-css', name: 'Image to HTML/CSS', url: 'tools/image-to-html-css.html', icon: '💻', category: 'Design', desc: 'Convert uploaded images into pure HTML & CSS pixel art matrix.' }
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSearchModal();
  initGlobalEvents();
});

/* Theme Manager */
function initTheme() {
  const savedTheme = localStorage.getItem('omni_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('omni_theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} theme`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
  }
}

/* Quick Search Palette Modal */
function initSearchModal() {
  const searchBtn = document.getElementById('search-trigger');
  const modalOverlay = document.getElementById('search-modal-overlay');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  if (!modalOverlay || !searchInput || !resultsContainer) return;

  function openModal() {
    modalOverlay.classList.add('active');
    searchInput.value = '';
    renderSearchResults('');
    searchInput.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  if (searchBtn) searchBtn.addEventListener('click', openModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modalOverlay.classList.contains('active') ? closeModal() : openModal();
    }
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
}

function renderSearchResults(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  const q = query.toLowerCase().trim();
  const filtered = OMNI_TOOLS.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.desc.toLowerCase().includes(q) || 
    t.category.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    resultsContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching tools found</div>`;
    return;
  }

  // Get base path relative to current page location
  const isSubPage = window.location.pathname.includes('/tools/');
  const basePath = isSubPage ? '../' : '';

  resultsContainer.innerHTML = filtered.map(t => `
    <a href="${basePath}${t.url}" class="search-item">
      <span style="font-size: 1.25rem;">${t.icon}</span>
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${t.name} <span style="font-size: 0.7rem; padding: 0.1rem 0.4rem; background: var(--bg-primary); border-radius: 4px; color: var(--accent-primary); margin-left: 0.5rem;">${t.category}</span></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${t.desc}</div>
      </div>
    </a>
  `).join('');
}

/* Toast Notifications */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

/* Copy to Clipboard Utility */
async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, 'success');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(successMsg, 'success');
  }
}

function initGlobalEvents() {
  document.addEventListener('click', (e) => {
    const copyTarget = e.target.closest('[data-copy]');
    if (copyTarget) {
      const textToCopy = copyTarget.getAttribute('data-copy');
      if (textToCopy) copyToClipboard(textToCopy);
    }
  });
}
