// Progress bar
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const percent = (scrollTop / scrollHeight) * 100;
  progress.style.width = percent + '%';
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.block, .hero-inner, .hero-cards, .final').forEach(el => {
  el.classList.add('rev');
  observer.observe(el);
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbimg');
document.querySelectorAll('.shot img, .hcard img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add('on');
  });
});
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('on');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lightbox.classList.remove('on');
});

// Back to top
const totop = document.getElementById('totop');
window.addEventListener('scroll', () => {
  totop.classList.toggle('on', window.scrollY > 300);
});
totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile nav
const burger = document.getElementById('burger');
const navlinks = document.getElementById('navlinks');
burger.addEventListener('click', () => navlinks.classList.toggle('open'));
navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 110;
    if (scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('on', link.getAttribute('href') === '#' + current);
  });
});

// Copy to clipboard
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.getAttribute('data-copy');
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.style.background = 'rgba(34,197,94,.3)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
      }, 1500);
    });
  });
});

// Smooth scroll for hash links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
