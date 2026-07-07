// ===========================
// SECURITY UTILITIES
// ===========================
function sanitize(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url) return '#';
  const s = String(url).trim();
  if (/^javascript:/i.test(s)) return '#';
  return s;
}

function absoluteAssetPath(url) {
  if (!url) return url;
  const s = String(url).trim();
  if (!s || s.startsWith('/') || /^https?:/.test(s) || s.startsWith('data:')) return s;
  return '/' + s;
}

// ===========================
// THEME
// ===========================
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  btn.addEventListener('click', () => {
    const nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (nowDark) {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '🌙 Dark';
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.textContent = '☀️ Light';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// ===========================
// NAV
// ===========================
function renderNav(activePage) {
  const list = document.getElementById('navList');
  if (!list) return;

  const links = [
    { href: '/',           label: 'Home',      id: 'home'      },
    { href: '/about/',     label: 'About',     id: 'about'     },
    { href: '/events/',    label: 'Events',    id: 'events'    },
    { href: '/media/',     label: 'Media',     id: 'media'     },
    { href: '/join/',      label: 'Join Us',   id: 'join'      },
    { href: '/contact/',   label: 'Contact',   id: 'contact'   },
  ];

  list.innerHTML = links
    .map(l => `<li><a href="${l.href}"${l.id === activePage ? ' class="active"' : ''}>${l.label}</a></li>`)
    .join('');

  const toggle = document.getElementById('navToggle');
  const navRight = document.getElementById('navRight');
  if (toggle && navRight) {
    toggle.addEventListener('click', () => navRight.classList.toggle('open'));
  }
}

// ===========================
// OFFICER CARD TEMPLATE
// ===========================
function officerCardHTML(m) {
  const LI_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="vertical-align:-0.1em;margin-right:3px" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

  const photo = m.photo
    ? `<img src="${sanitizeUrl(absoluteAssetPath(m.photo))}" alt="${sanitize(m.name)}" loading="lazy">`
    : sanitize(m.initials || '??');

  const linkedin = m.linkedin
    ? `<a href="${sanitizeUrl(m.linkedin)}" target="_blank" rel="noopener noreferrer" class="officer-linkedin">${LI_SVG} LinkedIn</a>`
    : '';

  const moreInfo = (m.id && !m.open)
    ? `<a href="/officer/?id=${sanitize(m.id)}" class="officer-more-info">More Info &rarr;</a>`
    : '';

  const links = (linkedin || moreInfo)
    ? `<div class="officer-links">${linkedin}${moreInfo}</div>`
    : `<div class="officer-links"><span class="officer-linkedin-placeholder">Position Open &mdash; <a href="/join/" style="color:var(--cyan-glow)">Apply</a></span></div>`;

  return `
    <div class="officer-card">
      <div class="officer-avatar">${photo}</div>
      <h3>${sanitize(m.name)}</h3>
      <div class="officer-role-badge">${sanitize(m.role)}</div>
      <div class="officer-divider"></div>
      <p class="officer-bio">${sanitize(m.bio || 'ACM Richmond Chapter Officer.')}</p>
      ${links}
    </div>
  `;
}

// ===========================
// CALENDAR WIDGET
// ===========================
class CalendarWidget {
  constructor({ containerId, items = [], accentClass = 'has-event', onSelect }) {
    this.container = document.getElementById(containerId);
    this.items = items;
    this.accentClass = accentClass;
    this.onSelect = onSelect;
    this.today = new Date();
    this.current = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.selectedDate = null;
    if (this.container) this.render();
  }

  itemsForDate(dateStr) { return this.items.filter(e => e.date === dateStr); }

  fmtDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  render() {
    const year  = this.current.getFullYear();
    const month = this.current.getMonth();
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay   = new Date(year, month, 1).getDay();

    let html = `
      <div class="cal-header">
        <button class="cal-nav" data-dir="prev">&#8592;</button>
        <span class="cal-month-label">${MONTHS[month]} ${year}</span>
        <button class="cal-nav" data-dir="next">&#8594;</button>
      </div>
      <div class="cal-grid">
        <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div>
        <div class="cal-day-name">Tu</div><div class="cal-day-name">We</div>
        <div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div>
        <div class="cal-day-name">Sa</div>
    `;

    for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr  = this.fmtDate(year, month, d);
      const hasItems = this.itemsForDate(dateStr).length > 0;
      const isToday  = this.today.getFullYear() === year &&
                       this.today.getMonth()     === month &&
                       this.today.getDate()      === d;
      const isSelected = this.selectedDate === dateStr;

      const selectedCls = isSelected
        ? (this.accentClass === 'has-volunteer' ? ' selected-volunteer' : ' selected')
        : '';

      const cls = ['cal-cell', hasItems ? this.accentClass : '', isToday ? 'today' : '', selectedCls.trim()]
        .filter(Boolean).join(' ');

      html += `<div class="${cls}" data-date="${dateStr}">${d}${hasItems ? '<span class="cal-dot"></span>' : ''}</div>`;
    }
    html += '</div>';
    this.container.innerHTML = html;

    this.container.querySelector('[data-dir="prev"]').addEventListener('click', () => {
      this.current.setMonth(this.current.getMonth() - 1);
      this.render();
    });
    this.container.querySelector('[data-dir="next"]').addEventListener('click', () => {
      this.current.setMonth(this.current.getMonth() + 1);
      this.render();
    });

    this.container.querySelectorAll(`.cal-cell.${this.accentClass}`).forEach(cell => {
      cell.addEventListener('click', () => {
        this.selectedDate = cell.dataset.date;
        this.render();
        if (this.onSelect) this.onSelect(this.itemsForDate(this.selectedDate), this.selectedDate);
      });
    });
  }

  goToDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    this.current = new Date(d.getFullYear(), d.getMonth(), 1);
    this.render();
  }
}

// ===========================
// DATE UTILITIES
// ===========================
function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function monthAbbr(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}
function dayNum(dateStr)  { return new Date(dateStr + 'T00:00:00').getDate(); }
function yearNum(dateStr) { return new Date(dateStr + 'T00:00:00').getFullYear(); }

// ===========================
// ANIMATION UTILITIES
// ===========================
function animateIn(containerEl) {
  if (!containerEl) return;
  Array.from(containerEl.children).forEach((el, i) => {
    el.style.transition = 'none';
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(16px)';
    el.offsetHeight; // force reflow
    el.style.transition = `opacity 0.38s ease ${i * 0.07}s, transform 0.38s ease ${i * 0.07}s`;
    el.style.opacity    = '1';
    el.style.transform  = 'none';
  });
}

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
}

// ===========================
// EXPANDABLE OFFICER CARDS
// ===========================
function initExpandableCards(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.addEventListener('click', e => {
    const card = e.target.closest('.officer-card');
    if (!card) return;
    if (e.target.tagName === 'A') return; // allow LinkedIn click-through
    const expanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', expanded);
  });
  grid.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.officer-card');
      if (card) { e.preventDefault(); card.click(); }
    }
  });
}

// ===========================
// BACK TO TOP
// ===========================
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 420);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollReveal();
  initBackToTop();
});
