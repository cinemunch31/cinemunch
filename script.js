const POSTS_URL = 'posts.json';
let posts = [];
let page = 1; const PAGE_SIZE = 6;
let timerActive = false;
let timerCountdown = 10;

const postList = document.getElementById('postList');
const stats = document.getElementById('stats');
const search = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sort');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const subscribeBtn = document.getElementById('subscribeBtn');
const subscribeModal = document.getElementById('subscribeModal');
const closeModal = document.getElementById('closeModal');
const cancelSubscribe = document.getElementById('cancelSubscribe');
const confirmSubscribe = document.getElementById('confirmSubscribe');
const emailInput = document.getElementById('email');
const darkToggle = document.getElementById('darkToggle');
const timerBtn = document.getElementById('timerBtn');

function formatTime(seconds){
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setupTimerButton(){
  timerBtn.addEventListener('click', startTimer);
}

function startTimer(){
  // Prevent clicking if already permanently disabled
  if(timerBtn.disabled) return;
  if(timerActive) return;
  timerActive = true;
  timerCountdown = 10;
  timerBtn.disabled = true;
  timerBtn.classList.add('permanently-disabled');
  timerBtn.textContent = formatTime(10);
  
  const interval = setInterval(()=>{
    timerCountdown--;
    timerBtn.textContent = formatTime(timerCountdown);
    
    if(timerCountdown === 5){
      timerBtn.classList.add('continue-state');
    }
    
    if(timerCountdown <= 0){
      clearInterval(interval);
      timerBtn.textContent = 'Click here';
      timerBtn.classList.remove('continue-state');
      timerActive = false;
      // Keep top button disabled - show bottom button
      const bottomBtn = document.getElementById('bottomTimerBtn');
      if(bottomBtn) bottomBtn.style.display = 'inline-block';
      // Scroll to bottom
      window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    }
  }, 1000);
}

function startBottomTimer(){
  const bottomBtn = document.getElementById('bottomTimerBtn');
  if(!bottomBtn || timerActive) return;
  timerActive = true;
  let countdown = 5;
  bottomBtn.disabled = true;
  bottomBtn.textContent = formatTime(5);
  
  const interval = setInterval(()=>{
    countdown--;
    bottomBtn.textContent = formatTime(countdown);
    
    if(countdown <= 0){
      clearInterval(interval);
      bottomBtn.disabled = false;
      bottomBtn.textContent = 'Continue';
      timerActive = false;
      // Top button stays permanently disabled - no re-enabling
    }
  }, 1000);
}

async function loadPosts(){
  try{
    const res = await fetch(POSTS_URL);
    posts = await res.json();
    populateCategories();
    render();
  }catch(e){console.error('Failed to load posts',e)}
}

function populateCategories(){
  const cats = ['all',...new Set(posts.map(p=>p.category))];
  categoryFilter.innerHTML = '';
  cats.forEach(c=>{
    const opt = document.createElement('option');opt.value=c;opt.textContent = c=== 'all'? 'All Categories' : capitalize(c);
    categoryFilter.appendChild(opt);
  });
}

function capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1)}

function filtered(){
  const q = search.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  let list = posts.filter(p=> (cat==='all' || p.category===cat));
  if(q) list = list.filter(p=> (p.title+p.excerpt+p.content).toLowerCase().includes(q));
  if(sortSelect.value==='newest') list = list.sort((a,b)=> new Date(b.date)-new Date(a.date)); else list = list.sort((a,b)=> new Date(a.date)-new Date(b.date));
  return list;
}

function render(){
  const list = filtered();
  stats.textContent = `${list.length} posts`;
  const start = (page-1)*PAGE_SIZE; const end = start+PAGE_SIZE;
  const pageItems = list.slice(start,end);
  postList.innerHTML = '';
  pageItems.forEach(renderCard);
  pageInfo.textContent = `Page ${page}`;
}

function renderCard(p){
  const el = document.createElement('article'); el.className='post-card';
  el.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:84px;height:84px;border-radius:8px;background:linear-gradient(135deg,#eef2ff,#f8fbff);display:flex;align-items:center;justify-content:center;font-weight:700;color:#0b62d6">${p.category[0].toUpperCase()}</div>
      <div style="flex:1">
        <div class="title">${p.title}</div>
        <div class="post-meta">${p.date} • <span class="text-muted">${capitalize(p.category)}</span></div>
        <div class="card-excerpt">${p.excerpt}</div>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn outline readBtn">Read More</button>
      <button class="btn ghost likeBtn">Like (<span class="likes">${getLikes(p.id)}</span>)</button>
      <button class="btn ghost shareBtn">Share</button>
    </div>
  `;
  // attach events
  el.querySelector('.readBtn').addEventListener('click', ()=> openReader(p));
  el.querySelector('.likeBtn').addEventListener('click', (e)=> {toggleLike(p.id,e)});
  el.querySelector('.shareBtn').addEventListener('click', ()=> sharePost(p));
  postList.appendChild(el);
}

function getLikes(id){return Number(localStorage.getItem('likes-'+id) || 0)}
function toggleLike(id,e){const key='likes-'+id; const v=getLikes(id)+1; localStorage.setItem(key,v); e.currentTarget.querySelector('.likes').textContent=v}

function openReader(p){
  const win = window.open('', '_blank');
  win.document.write(`<title>${p.title}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,Arial;padding:28px;max-width:800px;margin:auto;color:#0b1220} h1{font-size:28px} .muted{color:#6b7280}</style><h1>${p.title}</h1><div class="muted">${p.date} • ${capitalize(p.category)}</div><hr>${p.content}`);
}

function sharePost(p){
  if(navigator.share){ navigator.share({title:p.title,text:p.excerpt,url:location.href}).catch(()=>{});}else{navigator.clipboard.writeText(`${p.title} - ${p.excerpt}`).then(()=> alert('Post summary copied to clipboard'))}
}

// Pagination
prevPage.addEventListener('click', ()=>{ if(page>1){page--; render();}});
nextPage.addEventListener('click', ()=>{ const total = filtered().length; if(page*PAGE_SIZE < total){page++; render();}});

// Controls
search.addEventListener('input', ()=>{page=1;render();});
categoryFilter.addEventListener('change', ()=>{page=1;render();});
sortSelect.addEventListener('change', ()=>{page=1;render();});

// Subscribe modal
subscribeBtn.addEventListener('click', ()=> subscribeModal.classList.remove('hidden'));
closeModal.addEventListener('click', ()=> subscribeModal.classList.add('hidden'));
cancelSubscribe.addEventListener('click', ()=> subscribeModal.classList.add('hidden'));
confirmSubscribe.addEventListener('click', ()=>{const e=emailInput.value.trim(); if(!e||!e.includes('@')){alert('Enter a valid email');return}localStorage.setItem('subscribed',e); subscribeModal.classList.add('hidden'); alert('Thanks! You are subscribed.');});

// Dark mode
darkToggle.addEventListener('click', ()=>{document.body.classList.toggle('dark'); darkToggle.textContent = document.body.classList.contains('dark')? 'Light' : 'Dark';});

// Init
loadPosts();
setupTimerButton();

// Setup bottom timer button
const bottomTimerBtn = document.getElementById('bottomTimerBtn');
if(bottomTimerBtn){
  bottomTimerBtn.addEventListener('click', startBottomTimer);
}

// Expose small helper for dev
window._fs = {posts, render};
