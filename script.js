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
// Follow device settings until the visitor chooses a light or dark override.
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeModes = ['system', 'light', 'dark'];
let themeMode = 'system';
try {
  const stored = localStorage.getItem('ahmed-theme-preference');
  if (themeModes.includes(stored)) themeMode = stored;
} catch { /* Storage is optional. */ }
function applyTheme() {
  const theme = themeMode === 'system' ? (systemTheme.matches ? 'dark' : 'light') : themeMode;
  root.dataset.theme = theme;
  themeButton.textContent = '◐';
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f5f3ee' : '#18231f';
}
applyTheme();
systemTheme.addEventListener('change', () => {
  if (themeMode === 'system') applyTheme();
});
themeButton.addEventListener('click', () => {
  themeMode = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  try { localStorage.setItem('ahmed-theme-preference', themeMode); } catch {}
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
