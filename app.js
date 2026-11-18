// Unikkake prototyp: faner, snapping-reveal og parallakse i hero (spec: ../MOTION-HERO.md)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tabs = document.querySelector('.tabs');
const hero = document.querySelector('.hero');
const words = document.querySelector('.hero__words');

addEventListener('load', () => document.body.classList.add('loaded'));
requestAnimationFrame(() => document.body.classList.add('loaded'));

// Fanene vises først når hero er ute av bildet
const syncTabs = () => tabs.classList.toggle('is-on', scrollY > hero.offsetHeight - innerHeight * 0.5);
addEventListener('scroll', syncTabs, { passive: true });
addEventListener('resize', syncTabs);
syncTabs();

// Aktiv fane + reveal når en seksjon kommer inn
const links = [...tabs.querySelectorAll('a')];
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    const ch = e.target.dataset.ch;
    if (ch) links.forEach(a => a.classList.toggle('is-active', a.dataset.ch === ch));
  }
}, { threshold: 0.5 });
document.querySelectorAll('section.page, .hero').forEach(s => {
  s.querySelectorAll('[data-reveal]').forEach((el, i) => (el.style.transitionDelay = reduce ? '0ms' : i * 80 + 'ms'));
  io.observe(s);
});
// hero-teksten i nedre halvdel: egen observer
new IntersectionObserver(([e]) => e.isIntersecting && hero.classList.add('is-in'), { threshold: 0.3 })
  .observe(hero.querySelector('.hero__text'));

// Mobilmeny
const burger = document.querySelector('.burger');
const mnav = document.getElementById('mast-nav');
const setMenu = open => {
  burger.setAttribute('aria-expanded', String(open));
  mnav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
};
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
mnav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

// Skjema (prototyp: ingen sending ennå, WP-skjema kobles på senere)
const form = document.querySelector('.form');
const fileUi = form.querySelector('.file__ui');
form.querySelector('input[type=file]').addEventListener('change', e => {
  fileUi.textContent = e.target.files[0] ? e.target.files[0].name : 'Velg bilde';
});
form.addEventListener('submit', e => {
  e.preventDefault();
  // knappen og takk-teksten står i den smale spalten (utenfor <form>)
  document.querySelector('[form="bestill-form"]').hidden = true;
  document.querySelector('.cols__send .form__ok').hidden = false;
});

// Parallakse: bokstavene henger etter, kaken kommer frem (+120 px over 900 px)
// Store ord glir sakte sidelengs/opp mens seksjonen passerer (bare transform)
const bigWords = [...document.querySelectorAll('.mag__word, .book__word')];
const footWord = document.querySelector('.foot__word span');
const progress = el => {
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
};
function drift() {
  const k = innerWidth < 900 ? 0.5 : 1;
  for (const w of bigWords) {
    const p = progress(w.parentElement);
    if (p > 0 && p < 1) w.style.transform = `translateX(${(0.5 - p) * 8 * k}vw)`;
  }
  const f = footWord.parentElement.parentElement;
  const fp = Math.max(0, Math.min(1, (innerHeight - f.getBoundingClientRect().top) / f.offsetHeight));
  footWord.style.setProperty('--fy', `${(1 - fp) * 30}%`);
}

if (!reduce) {
  drift();
  let ticking = false;
  const max = innerWidth < 900 ? 60 : 120;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = Math.min(scrollY / innerHeight, 1);
      words.style.transform = `translateY(${p * max}px)`;
      words.style.opacity = String(1 - p * 0.4);
      drift();
      ticking = false;
    });
  }, { passive: true });
}
