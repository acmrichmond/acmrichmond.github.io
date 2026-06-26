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

// ===========================
// THEME
// ===========================
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.textContent = isLight ? '🌙 Dark' : '☀️ Light';
  btn.addEventListener('click', () => {
    const nowLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (nowLight) {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '☀️ Light';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      btn.textContent = '🌙 Dark';
      localStorage.setItem('theme', 'light');
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
    { href: 'index.html',     label: 'Home',      id: 'home'      },
    { href: 'events.html',    label: 'Events',    id: 'events'    },
    { href: 'media.html',     label: 'Media',     id: 'media'     },
    { href: 'about.html',     label: 'About',     id: 'about'     },
    { href: 'join.html',      label: 'Join Us',   id: 'join'      },
    { href: 'volunteer.html', label: 'Volunteer', id: 'volunteer' },
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
  const photo = m.photo
    ? `<img src="${sanitizeUrl(m.photo)}" alt="${sanitize(m.name)}" loading="lazy">`
    : sanitize(m.initials || '??');

  const linkedin = m.linkedin
    ? `<div class="officer-links"><a href="${sanitizeUrl(m.linkedin)}" target="_blank" rel="noopener noreferrer" class="officer-linkedin">&#128101; LinkedIn</a></div>`
    : `<div class="officer-links"><span class="officer-linkedin-placeholder">Connect on LinkedIn</span></div>`;

  return `
    <div class="officer-card">
      <div class="officer-avatar">${photo}</div>
      <h3>${sanitize(m.name)}</h3>
      <div class="officer-role-badge">${sanitize(m.role)}</div>
      <div class="officer-divider"></div>
      <p class="officer-bio">${sanitize(m.bio || 'ACM Richmond Chapter Officer.')}</p>
      ${linkedin}
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
