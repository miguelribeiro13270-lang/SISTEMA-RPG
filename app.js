const KEY='missao-real-v1';
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
let state=load(), selectedCat='Todas';

function load(){try{return JSON.parse(localStorage.getItem(KEY))||fresh()}catch{return fresh()}}
function fresh(){return {xp:0,completed:0,streak:0,lastDay:null,done:{},custom:[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function all(){return [...defaultMissions,...state.custom]}
function today(){return new Date().toISOString().slice(0,10)}
function icon(cat){return ({Corpo:'⚔️',Mente:'📚',Casa:'🏠',Vida:'💰',Pessoal:'🎯'})[cat]||'🎯'}
function level(){return Math.floor(state.xp/100)+1}
function rank(){let l=level();return l>=10?'Lenda':l>=7?'Mestre':l>=4?'Aventureiro':'Novato'}
function doneToday(id){return !!state.done[today()]?.includes(id)}
function ensureDay(){if(!state.done[today()])state.done[today()]=[]}
function render(){
 const l=level(), cur=state.xp%100;
 $('#level').textContent=l; $('#rank').textContent=rank(); $('#xp').textContent=cur;
 $('#xpFill').style.width=cur+'%'; $('#xpNext').textContent=`${cur} / 100 XP para o próximo nível`;
 $('#streak').textContent=state.streak; $('#completed').textContent=state.completed; $('#totalXp').textContent=state.xp;
 $('#profileRank').textContent=rank(); $('#pLevel').textContent=l; $('#pXp').textContent=state.xp; $('#pCompleted').textContent=state.completed;
 $('#todayLabel').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'});
 renderMissions($('#todayMissions'),all());
 renderMissions($('#allMissions'),all().filter(m=>selectedCat==='Todas'||m.cat===selectedCat));
 renderAchievements();
}
function renderMissions(el,list){
 el.innerHTML='';
 list.forEach(m=>{
  const done=doneToday(m.id);
  const d=document.createElement('div');d.className='mission'+(done?' done':'');
  d.innerHTML=`<div class="mission-icon">${m.icon||icon(m.cat)}</div><div class="mission-main"><div class="mission-name">${esc(m.name)}</div><div class="mission-meta">${esc(m.cat)} · <span class="xp">+${m.xp} XP</span></div></div><button class="complete" ${done?'disabled':''}>${done?'✓ Feita':'Concluir'}</button>`;
  d.querySelector('.complete').onclick=()=>complete(m.id);
  el.appendChild(d);
 });
}
function complete(id){
 ensureDay(); if(doneToday(id))return;
 const m=all().find(x=>x.id===id);if(!m)return;
 state.done[today()].push(id);state.xp+=Number(m.xp);state.completed++;
 const prev=state.lastDay;
 if(prev!==today()){
   const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
   const y=yesterday.toISOString().slice(0,10);
   state.streak=(prev===y)?state.streak+1:1;state.lastDay=today();
 }
 save();render();toast(`Quest concluída! +${m.xp} XP`);
}
function renderAchievements(){
 const el=$('#achievementsList');el.innerHTML='';
 achievements.forEach(a=>{
  const ok=a.ok(state),d=document.createElement('div');d.className='achievement'+(ok?'':' locked');
  d.innerHTML=`<div class="badge">${a.icon}</div><div><b>${a.name}</b><div class="muted">${a.desc}</div></div><div style="margin-left:auto">${ok?'✓':'🔒'}</div>`;
  el.appendChild(d);
 });
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function $(s){return document.querySelector(s)}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove('show'),1800)}

document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.screen).classList.add('active');window.scrollTo(0,0);
});
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');selectedCat=b.dataset.cat;render()});
$('#addQuestBtn').onclick=()=>$('#questDialog').showModal();
$('#cancelDialog').onclick=()=>$('#questDialog').close();
$('#questForm').onsubmit=e=>{
 e.preventDefault();state.custom.push({id:'custom-'+Date.now(),name:$('#qName').value.trim(),cat:$('#qCat').value,xp:Math.max(1,Math.min(500,Number($('#qXp').value))),icon:icon($('#qCat').value)});
 save();render();$('#questDialog').close();e.target.reset();toast('Nova quest criada!');
};
$('#resetBtn').onclick=()=>{if(confirm('Apagar todo o progresso?')){state=fresh();save();render();toast('Progresso resetado.')}};

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
render();
