// Topbar progress + sidebar active + drawer + lightbox + copy
const chapters = [...document.querySelectorAll('.chapter')];
const sideLinks = [...document.querySelectorAll('.side-nav a')];
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuToggle = document.getElementById('menuToggle');
const tbBar = document.getElementById('tbBar');
const tbProgress = document.getElementById('tbProgress');
const stepNav = document.getElementById('tutNav');
const steps = [...document.querySelectorAll('.step')];
let tutLockUntil = 0;

function idOf(href){ return href ? href.slice(1) : ''; }

// Advancement toast — quest log popup ala Minecraft
const advToast = document.getElementById('advToast');
const advTitle = document.getElementById('advTitle');
const advSub = document.getElementById('advSub');
let toastTimer = null;
function showToast(title, sub){
  if(!advToast) return;
  if(advTitle) advTitle.textContent = title;
  if(advSub) advSub.textContent = sub;
  advToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> advToast.classList.remove('show'), 2800);
}
const questNames = chapters.map(c => (c.dataset.name || c.querySelector('h1')?.textContent || c.id).trim());
let lastQuest = -1;
let toastArmed = false;

// Reveal on scroll — fade-up block per block
// NOTE: .chapter sengaja TIDAK diberi .reveal karena chapter #instalasi
// sangat tinggi sehingga threshold IntersectionObserver tidak pernah
// tercapai (rasio terlihat < threshold) dan seluruh section tetap opacity:0.
(function(){
  const els = [...document.querySelectorAll('.step, .shot, .mini')];
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ return; }
  if(!('IntersectionObserver' in window)) return;
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold: 0.02, rootMargin: '0px 0px -5% 0px'});
  els.forEach(el => io.observe(el));
  // Safety net: paksa tampilkan elemen yang sudah di viewport (misal reload di tengah halaman)
  // dan bersihkan sisa .reveal yang gagal ter-observe agar konten tidak hilang.
  setTimeout(()=>{
    els.forEach(el=>{
      const r = el.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){ el.classList.add('in'); io.unobserve(el); }
    });
  }, 600);
})();

setTimeout(()=> showToast('SELAMAT BELAJAR', 'Pilih materi dan mulai membangun'), 900);

function onScroll(){
  const docTop = el => el.getBoundingClientRect().top + window.scrollY;
  const scrolled = window.scrollY + 140;
  let current = chapters[0] ? chapters[0].id : '';
  chapters.forEach(c => { if (scrolled >= docTop(c)) current = c.id; });

  sideLinks.forEach(a => {
    const on = idOf(a.getAttribute('href')) === current;
    a.classList.toggle('on', on);
  });
  const order = chapters.map(c=>c.id);
  const curI = order.indexOf(current);
  sideLinks.forEach(a=>{
    const i = order.indexOf(idOf(a.getAttribute('href')));
    a.classList.toggle('done', i >= 0 && i < curI);
    const dot = a.querySelector('.st');
    if(!dot) return;
    if(i < curI){ dot.textContent=''; }
    else if(i===curI){ dot.textContent=''; }
  });

  // Step nav active
  // NOTE: pakai posisi relatif-dokumen (getBoundingClientRect + scrollY),
  // karena s.offsetTop relatif ke .chapter (position:relative) sehingga
  // nilainya kecil dan semua step terbaca sudah lewat.
  // NOTE: saat klik tut nav, kunci update dari scroll sampai animasi
  // smooth-scroll selesai, supaya warna biru/hijau hasil klik tidak
  // langsung ditimpa posisi scroll lama di tengah animasi.
  if(steps.length && stepNav && Date.now() >= tutLockUntil){
    let curStep = steps[0].id;
    const sc2 = window.scrollY + 240;
    steps.forEach(s => { if(sc2 >= docTop(s)) curStep = s.id; });
    const tutLinks = [...stepNav.querySelectorAll('a')];
    let curIdx = 0;
    tutLinks.forEach((a,i)=>{ if(idOf(a.getAttribute('href'))===curStep) curIdx=i; });
    tutLinks.forEach((a,i)=>{
      a.classList.toggle('active', i===curIdx);
      a.classList.toggle('done', i<curIdx);
    });
  }

  const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(100, Math.round((window.scrollY / h)*100));
  tbBar.style.width = pct + '%';
  const curNum = Math.max(1, order.indexOf(current)+1);
  tbProgress.textContent = 'LVL ' + curNum + ' · XP ' + pct + '%';
  const qi = order.indexOf(current);
  if(!toastArmed){ lastQuest = qi; toastArmed = true; }
  else if(qi !== lastQuest){
    lastQuest = qi;
    showToast('MATERI ' + (qi + 1) + ' / ' + chapters.length, questNames[qi] || current);
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Tut nav: set status langsung saat diklik (1..n-1 hijau, n biru),
// lalu kunci sinkron scroll selama animasi agar tidak flicker.
// Aturan warna: i < idx = hijau (done), i === idx = biru (active), i > idx = coklat (default).
const tutNavLinks = [...document.querySelectorAll('#tutNav a')];
function setTutState(idx){
  tutNavLinks.forEach((x,i)=>{
    x.classList.toggle('active', i===idx);
    x.classList.toggle('done', i<idx);
  });
}
tutNavLinks.forEach((a,i)=>a.addEventListener('click', e=>{
  if(e.button!==0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  setTutState(i);
  tutLockUntil = Date.now() + 1500;
  const target = document.getElementById(idOf(a.getAttribute('href')));
  if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  if(history.replaceState) history.replaceState(null,'',a.getAttribute('href'));
  // re-sync setelah animasi scroll selesai (posisi final yang menentukan)
  setTimeout(()=>{ tutLockUntil = 0; onScroll(); }, 1500);
}));
// Layout bisa bergeser tanpa event scroll (gambar lazy-load): sinkron ulang.
window.addEventListener('resize', onScroll);
window.addEventListener('load', onScroll);
if('onscrollend' in window) window.addEventListener('scrollend', onScroll);
document.querySelectorAll('img').forEach(img=>{ img.addEventListener('load', onScroll); });

// Drawer
function closeDrawer(){ sidebar.classList.remove('open'); scrim.classList.remove('on'); }
menuToggle.addEventListener('click', ()=>{ sidebar.classList.toggle('open'); scrim.classList.toggle('on'); });
scrim.addEventListener('click', closeDrawer);
sideLinks.forEach(a=>a.addEventListener('click', closeDrawer));

// Lightbox (tahan kalau elemen tidak ada)
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbimg');
if (lb) {
  if (!lbImg) {
    const im = document.createElement('img');
    im.id = 'lbimg'; im.alt = 'preview';
    lb.appendChild(im);
  }
  const _lbImg = document.getElementById('lbimg');
  document.querySelectorAll('.shot img').forEach(img=>{
    img.addEventListener('click', ()=>{ _lbImg.src=img.src; _lbImg.alt=img.alt; lb.classList.add('on'); });
  });
  lb.addEventListener('click', e=>{ if(e.target===lb) lb.classList.remove('on'); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') lb.classList.remove('on'); });
}

// Copy
document.querySelectorAll('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(()=>{
      const o=btn.textContent; btn.textContent='✓ Copied';
      setTimeout(()=> btn.textContent=o, 1400);
    });
  });
});
