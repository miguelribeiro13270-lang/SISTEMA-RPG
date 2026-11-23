const KEY='missao-real-v2';
const defaultMissions=[
{id:'bed',name:'Arrumar a cama',cat:'Casa',xp:10,icon:'🛏️'},
{id:'water',name:'Beber água',cat:'Corpo',xp:5,icon:'💧'},
{id:'study',name:'Estudar por 30 minutos',cat:'Mente',xp:30,icon:'📚'},
{id:'room',name:'Organizar o quarto',cat:'Casa',xp:20,icon:'🧹'},
{id:'walk',name:'Caminhar por 20 minutos',cat:'Corpo',xp:25,icon:'🚶'},
{id:'money',name:'Guardar ou economizar dinheiro',cat:'Vida',xp:20,icon:'💰'},
{id:'read',name:'Ler por 15 minutos',cat:'Mente',xp:20,icon:'📖'},
{id:'hygiene',name:'Cuidar da higiene pessoal',cat:'Pessoal',xp:15,icon:'🧼'}
];
const achievements=[
{id:'first',name:'Primeira Quest',desc:'Conclua sua primeira missão.',icon:'⚔️',ok:s=>s.completed>=1},
{id:'five',name:'Aventureiro',desc:'Conclua 5 missões.',icon:'🗡️',ok:s=>s.completed>=5},
{id:'ten',name:'Veterano',desc:'Conclua 10 missões.',icon:'🏆',ok:s=>s.completed>=10},
{id:'xp100',name:'Caçador de XP',desc:'Ganhe 100 XP.',icon:'⭐',ok:s=>s.xp>=100},
{id:'streak3',name:'Em sequência',desc:'Mantenha 3 dias seguidos.',icon:'🔥',ok:s=>s.streak>=3}
];
const skinColors=['#f6d2b8','#eab18a','#c98258','#8d5524','#5b3826'];
const defaultAvatar={skin:'#eab18a',hair:'short',hairColor:'#1f2937',shirt:'#2563eb',pants:'#334155',shoes:'#f8fafc',accessory:'none'};
let selectedCat='Todas';
let state=load();
function fresh(){return {xp:0,completed:0,streak:0,lastDay:null,done:{},custom:[],avatar:{...defaultAvatar}}}
function load(){try{let s=JSON.parse(localStorage.getItem(KEY));return s?{...fresh(),...s,avatar:{...defaultAvatar,...(s.avatar||{})}}:fresh()}catch{return fresh()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function all(){return [...defaultMissions,...state.custom]}
function today(){return new Date().toISOString().slice(0,10)}
function icon(cat){return ({Corpo:'⚔️',Mente:'📚',Casa:'🏠',Vida:'💰',Pessoal:'🎯'})[cat]||'🎯'}
function doneToday(id){return !!state.done[today()]?.includes(id)}
function ensureDay(){if(!state.done[today()])state.done[today()]=[]}
function level(){return Math.floor(state.xp/100)+1}
function rank(){let l=level();return l>=10?'Lenda':l>=7?'Mestre':l>=4?'Aventureiro':'Novato'}
function avatarSVG(a=state.avatar){
 const skin=a.skin, hair=a.hairColor, shirt=a.shirt, pants=a.pants, shoes=a.shoes;
 let hairShape=a.hair==='none'?'':a.hair==='long'?`<path d="M55 48 Q55 18 85 18 Q115 18 115 48 L110 78 Q100 70 95 55 Q85 65 75 55 Q68 68 58 74Z" fill="${hair}"/>`:a.hair==='spiky'?`<path d="M57 48 L60 28 68 34 76 20 83 32 93 18 98 33 110 25 112 48 Q85 60 57 48Z" fill="${hair}"/>`:`<path d="M56 48 Q58 19 85 19 Q112 19 114 48 Q105 39 98 40 Q87 28 75 41 Q65 39 56 48Z" fill="${hair}"/>`;
 let acc=a.accessory==='bandana'?`<path d="M55 46 Q85 54 115 46 L113 55 Q85 62 57 55Z" fill="#dc2626"/>`:a.accessory==='glasses'?`<g fill="none" stroke="#111827" stroke-width="4"><rect x="62" y="45" width="20" height="13" rx="5"/><rect x="88" y="45" width="20" height="13" rx="5"/><path d="M82 50h6"/></g>`:a.accessory==='scarf'?`<path d="M58 78 Q85 88 112 78 L108 96 Q85 105 62 96Z" fill="#7c3aed"/>`:a.accessory==='crown'?`<path d="M62 28 L68 12 84 25 94 10 102 27 110 18 112 38 62 38Z" fill="#facc15"/>`:'';
 return `<svg viewBox="0 0 170 190" xmlns="http://www.w3.org/2000/svg"><circle cx="85" cy="92" r="76" fill="#111827"/><path d="M52 116 Q85 98 118 116 L132 170H38Z" fill="${shirt}"/><rect x="58" y="143" width="22" height="35" rx="6" fill="${pants}"/><rect x="90" y="143" width="22" height="35" rx="6" fill="${pants}"/><rect x="52" y="174" width="32" height="9" rx="4" fill="${shoes}"/><rect x="86" y="174" width="32" height="9" rx="4" fill="${shoes}"/><circle cx="85" cy="60" r="31" fill="${skin}"/><circle cx="73" cy="60" r="3" fill="#111827"/><circle cx="97" cy="60" r="3" fill="#111827"/><path d="M76 73 Q85 79 94 73" fill="none" stroke="#7c2d12" stroke-width="3" stroke-linecap="round"/>${hairShape}${acc}</svg>`;
}
function renderAvatar(el,large=false){el.innerHTML=avatarSVG(state.avatar)}
function render(){
 document.getElementById('rank').textContent=rank();
 document.getElementById('level').textContent='Nível '+level();
 document.getElementById('xpText').textContent=`${state.xp%100} / 100 XP`;
 document.getElementById('xpFill').style.width=(state.xp%100)+'%';
 document.getElementById('streak').textContent=state.streak;
 document.getElementById('completed').textContent=state.completed;
 document.getElementById('totalXp').textContent=state.xp;
 document.getElementById('profileRank').textContent=rank();
 document.getElementById('profileLevel').textContent=level();
 document.getElementById('profileXp').textContent=state.xp;
 document.getElementById('profileCompleted').textContent=state.completed;
 renderAvatar(document.getElementById('homeAvatar'));renderAvatar(document.getElementById('profileAvatar'));
 renderMissions(document.getElementById('homeMissions'),all().filter(m=>!doneToday(m.id)).slice(0,4));
 renderMissions(document.getElementById('questList'),all().filter(m=>selectedCat==='Todas'||m.cat===selectedCat));
 renderAchievements();
}
function renderMissions(el,items){
 el.innerHTML=items.length?items.map(m=>`<div class="quest ${doneToday(m.id)?'done':''}"><div class="icon">${m.icon||icon(m.cat)}</div><div class="quest-info"><b>${escapeHTML(m.name)}</b><small>${m.cat} • +${m.xp} XP</small></div><button class="complete" data-id="${m.id}" ${doneToday(m.id)?'disabled':''}>${doneToday(m.id)?'✓':'Concluir'}</button></div>`).join(''):'<div class="card muted">Nenhuma missão por aqui.</div>';
 el.querySelectorAll('.complete').forEach(b=>b.onclick=()=>completeQuest(b.dataset.id));
}
function renderAchievements(){
 const el=document.getElementById('achievementList');
 el.innerHTML=achievements.map(a=>`<div class="card achievement ${a.ok(state)?'':'locked'}"><div class="icon">${a.icon}</div><div><b>${a.name}</b><div class="muted">${a.desc}</div></div><div>${a.ok(state)?'✅':'🔒'}</div></div>`).join('');
}
function completeQuest(id){
 ensureDay();if(doneToday(id))return;
 const m=all().find(x=>x.id===id);if(!m)return;
 state.done[today()].push(id);state.xp+=Number(m.xp);state.completed++;
 const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
 if(state.lastDay===yesterday)state.streak++;else if(state.lastDay!==today())state.streak=1;
 state.lastDay=today();save();render();
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showScreen(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
 document.getElementById(id).classList.add('active');
 document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.screen===id));
}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
document.getElementById('goQuests').onclick=()=>showScreen('quests');
const cats=['Todas','Corpo','Mente','Casa','Vida','Pessoal'];
document.getElementById('cats').innerHTML=cats.map(c=>`<button class="chip ${c==='Todas'?'active':''}" data-cat="${c}">${c}</button>`).join('');
document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{selectedCat=b.dataset.cat;document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
document.getElementById('addQuest').onclick=()=>document.getElementById('questDialog').showModal();
document.getElementById('questForm').addEventListener('submit',e=>{
 e.preventDefault();state.custom.push({id:'custom-'+Date.now(),name:document.getElementById('questName').value.trim(),cat:document.getElementById('questCat').value,xp:Math.max(1,Math.min(500,Number(document.getElementById('questXp').value)||1)),icon:icon(document.getElementById('questCat').value)});save();e.target.reset();document.getElementById('questDialog').close();render();
});
document.getElementById('customizeBtn').onclick=()=>{
 const a=state.avatar;
 document.getElementById('hairStyle').value=a.hair;document.getElementById('hairColor').value=a.hairColor;document.getElementById('shirtColor').value=a.shirt;document.getElementById('pantsColor').value=a.pants;document.getElementById('shoeColor').value=a.shoes;document.getElementById('accessory').value=a.accessory;
 renderSkinOptions();updateEditorPreview();document.getElementById('avatarDialog').showModal();
};
function renderSkinOptions(){document.getElementById('skinOptions').innerHTML=skinColors.map(c=>`<button type="button" class="swatch ${state.avatar.skin===c?'active':''}" style="background:${c}" data-skin="${c}"></button>`).join('');document.querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{state.avatar.skin=b.dataset.skin;renderSkinOptions();updateEditorPreview()})}
function updateEditorPreview(){const temp={...state.avatar,hair:document.getElementById('hairStyle').value,hairColor:document.getElementById('hairColor').value,shirt:document.getElementById('shirtColor').value,pants:document.getElementById('pantsColor').value,shoes:document.getElementById('shoeColor').value,accessory:document.getElementById('accessory').value};document.getElementById('editorPreview').innerHTML=avatarSVG(temp)}
['hairStyle','hairColor','shirtColor','pantsColor','shoeColor','accessory'].forEach(id=>document.getElementById(id).addEventListener('input',updateEditorPreview));
document.getElementById('saveAvatar').onclick=e=>{e.preventDefault();state.avatar={...state.avatar,hair:document.getElementById('hairStyle').value,hairColor:document.getElementById('hairColor').value,shirt:document.getElementById('shirtColor').value,pants:document.getElementById('pantsColor').value,shoes:document.getElementById('shoeColor').value,accessory:document.getElementById('accessory').value};save();document.getElementById('avatarDialog').close();render()};
document.getElementById('resetBtn').onclick=()=>{if(confirm('Resetar todo o progresso e personagem?')){state=fresh();save();render()}};
let deferredInstall;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;document.getElementById('installBtn').classList.remove('hidden')});
document.getElementById('installBtn').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
render();