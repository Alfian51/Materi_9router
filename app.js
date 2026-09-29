// Topbar progress + sidebar active + drawer + search + lightbox + copy + checklist
const chapters = [...document.querySelectorAll('.chapter')];
const sideLinks = [...document.querySelectorAll('.side-nav a')];
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const menuToggle = document.getElementById('menuToggle');
const tbBar = document.getElementById('tbBar');
const tbProgress = document.getElementById('tbProgress');
const stepNav = document.getElementById('tutNav');
const steps = [...document.querySelectorAll('.step')];

function idOf(href){ return href ? href.slice(1) : ''; }

function onScroll(){
  const scrolled = window.scrollY + 140;
  let current = chapters[0] ? chapters[0].id : '';
  chapters.forEach(c => { if (scrolled >= c.offsetTop) current = c.id; });

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
  if(steps.length && stepNav){
    let curStep = steps[0].id;
    const sc2 = window.scrollY + 180;
    steps.forEach(s => { if(sc2 >= s.offsetTop) curStep = s.id; });
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
  tbProgress.textContent = curNum + ' dari ' + chapters.length + ' bagian';
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Drawer
function closeDrawer(){ sidebar.classList.remove('open'); scrim.classList.remove('on'); }
menuToggle.addEventListener('click', ()=>{ sidebar.classList.toggle('open'); scrim.classList.toggle('on'); });
scrim.addEventListener('click', closeDrawer);
sideLinks.forEach(a=>a.addEventListener('click', closeDrawer));

// Search
const searchInput = document.getElementById('searchInput');
const searchPop = document.getElementById('searchPop');
const index = Array.from(document.querySelectorAll('.chapter')).map(c=>({
  id:c.id, name:(c.dataset.name||c.querySelector('h1')?.textContent||c.id).trim()
}));
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(!q){ searchPop.classList.remove('on'); searchPop.innerHTML=''; return; }
  const hits = index.filter(x=> x.name.toLowerCase().includes(q) || x.id.toLowerCase().includes(q)).slice(0,7);
  if(!hits.length){ searchPop.innerHTML='<a>— tidak ada hasil</a>'; searchPop.classList.add('on'); return; }
  searchPop.innerHTML = hits.map(h=>'<a href="#'+h.id+'">'+h.name+'</a>').join('');
  searchPop.classList.add('on');
  searchPop.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    searchPop.classList.remove('on'); searchInput.value=''; closeDrawer();
  }));
});
searchInput.addEventListener('keydown', e=>{ if(e.key==='Escape'){ searchPop.classList.remove('on'); searchInput.blur(); }});
document.addEventListener('click', e=>{
  if(e.target!==searchInput && !searchPop.contains(e.target)) searchPop.classList.remove('on');
});

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbimg');
document.querySelectorAll('.shot img').forEach(img=>{
  img.addEventListener('click', ()=>{ lbImg.src=img.src; lbImg.alt=img.alt; lb.classList.add('on'); });
});
lb.addEventListener('click', e=>{ if(e.target===lb) lb.classList.remove('on'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') lb.classList.remove('on'); });

// Copy
document.querySelectorAll('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(()=>{
      const o=btn.textContent; btn.textContent='✓ Copied';
      setTimeout(()=> btn.textContent=o, 1400);
    });
  });
});

// Checklist
const checklist = document.getElementById('checklist');
const ckCount = document.getElementById('ckCount');
if(checklist && ckCount){
  function updateCount(){
    const boxes=[...checklist.querySelectorAll('input')];
    const done=boxes.filter(b=>b.checked).length;
    ckCount.textContent=done+'/'+boxes.length;
    ckCount.classList.toggle('complete', done===boxes.length);
    checklist.querySelectorAll('label').forEach(l=> l.classList.toggle('done', l.querySelector('input').checked));
  }
  checklist.querySelectorAll('input').forEach(b=> b.addEventListener('change', updateCount));
  updateCount();
}
