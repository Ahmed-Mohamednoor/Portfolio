// Native links and expandable details remain usable without JavaScript.
const root = document.documentElement;
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const themeButton = document.querySelector('.theme-toggle');
const topLink = document.querySelector('.back-to-top');
const progress = document.querySelector('.scroll-progress');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
root.classList.add('js');
menu.hidden = false;
themeButton.hidden = false;
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.textContent = 'Menu';
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('header')) closeMenu();
});
window.matchMedia('(max-width: 800px)').addEventListener('change', closeMenu);
function setTheme(theme) {
  root.dataset.theme = theme;
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f5f3ee' : '#18231f';
}
let savedTheme;
try { savedTheme = localStorage.getItem('ahmed-theme'); } catch { /* Optional storage. */ }
setTheme(savedTheme === 'dark' ? 'dark' : 'light');
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(theme);
  try { localStorage.setItem('ahmed-theme', theme); } catch { /* Works for this visit. */ }
});
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
let scheduled = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section;
  }
  if (distance > 0 && window.scrollY >= distance - 5) current = sections[sections.length - 1];
  navLinks.forEach(link => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  topLink.hidden = window.scrollY < 500;
  scheduled = false;
}
function requestScrollUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
}
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
window.addEventListener('load', updateScroll);
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', requestScrollUpdate));
updateScroll();
const filters = document.querySelector('.skill-filters');
filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  filters.querySelectorAll('button').forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('.skill-group').forEach(group => {
    group.hidden = button.dataset.filter !== 'All' && group.dataset.category !== button.dataset.filter;
  });
  document.querySelector('#filter-status').textContent = button.dataset.filter === 'All' ? 'Showing all skill categories.' : `Showing ${button.dataset.filter} skills.`;
  requestScrollUpdate();
});
if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04 });
  sections.slice(1).forEach(section => {
    section.classList.add('reveal');
    observer.observe(section);
  });
}
