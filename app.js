(function(){'use strict';
var KEY='mavis-pomodoro-v1';var trophies=[{n:1,name:'Primo passo',icon:'🥉',desc:'Completa 1 obiettivo'},{n:5,name:'Amica di Mavis',icon:'🐾',desc:'Completa 5 obiettivi'},{n:15,name:'Super concentrata',icon:'🥈',desc:'Completa 15 obiettivi'},{n:30,name:'Campionessa Pomodoro',icon:'🏆',desc:'Completa 30 obiettivi'},{n:50,name:'Regina dei pomodori',icon:'🍅',desc:'Completa 50 obiettivi'},{n:100,name:'Leggenda di Mavis',icon:'💎',desc:'Completa 100 obiettivi'}];
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
var defaults={goals:[],completed:0,sessions:0,minutes:0,durations:{focus:25,short:5,long:15},timer:{mode:'focus',remaining:1500,endAt:null,running:false}};var state;try{state=JSON.parse(localStorage.getItem(KEY))||defaults}catch(e){state=defaults}state.goals=Array.isArray(state.goals)?state.goals:[];state.durations=Object.assign({},defaults.durations,state.durations||{});state.timer=Object.assign({},defaults.timer,state.timer||{});state.completed=Number(state.completed)||0;state.sessions=Number(state.sessions)||0;state.minutes=Number(state.minutes)||0;
// Effetti audio locali. Il browser abilita la riproduzione dopo una prima interazione.
var soundEnabled=true;var soundUnlocked=false;
var sounds={ding:new Audio('assets/ding.wav'),whoosh:new Audio('assets/whoosh.wav'),pop:new Audio('assets/pop.wav')};
Object.keys(sounds).forEach(function(k){sounds[k].preload='auto';sounds[k].volume=k==='ding'?.8:.36});
function playSound(name){if(!soundEnabled||!soundUnlocked)return;try{var a=sounds[name];a.pause();a.currentTime=0;var p=a.play();if(p&&p.catch)p.catch(function(){})}catch(e){}}
function unlockSound(){soundUnlocked=true;}
document.addEventListener('pointerdown',unlockSound,{once:true});document.addEventListener('keydown',unlockSound,{once:true});
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast('Salvataggio non disponibile in questo browser')}}function $(id){return document.getElementById(id)}function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){$('toast').classList.remove('show')},3500)}function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function renderGoals(target,items,preview){target.textContent='';if(!items.length){target.appendChild(el('p','empty',preview?'Nessun obiettivo: aggiungine uno! 🐾':'La tua lista è vuota. Cosa vuoi fare oggi?'));return}items.forEach(function(g){var row=el('div','goal'+(g.done?' done':''));var check=el('input');check.type='checkbox';check.checked=!!g.done;check.setAttribute('aria-label','Completa '+g.text);check.addEventListener('change',function(){setGoal(g.id,check.checked)});row.appendChild(check);row.appendChild(el('span','',g.text));if(!preview){var del=el('button','delete','×');del.title='Elimina obiettivo';del.setAttribute('aria-label','Elimina '+g.text);del.onclick=function(){state.goals=state.goals.filter(function(x){return x.id!==g.id});save();render()};row.appendChild(del)}target.appendChild(row)})}
function setGoal(id,done){var g=state.goals.find(function(x){return x.id===id});if(!g)return;if(done&&!g.done){state.completed++;toast('Bravissima! Mavis festeggia con te! 🐶🎉');if(trophies.some(function(t){return t.n===state.completed}))setTimeout(function(){toast('🏆 Nuovo trofeo sbloccato! Guarda la collezione!')},1800)}else if(!done&&g.done){state.completed=Math.max(0,state.completed-1)}g.done=done;save();render()}
function render(){var day=today(),daily=state.goals.filter(function(g){return g.date===day}),done=daily.filter(function(g){return g.done}).length;$('goal-count').textContent=done+' / '+daily.length;$('progress-text').textContent=done+' di '+daily.length+' obiettivi completati oggi';$('daily-progress').style.width=(daily.length?Math.round(done/daily.length*100):0)+'%';renderGoals($('goal-preview'),daily.slice(0,4),true);renderGoals($('all-goals'),daily,false);var next=trophies.find(function(t){return state.completed<t.n});var n=$('next-trophy');n.textContent='';if(next){var box=el('div','trophy-mini');box.appendChild(el('span','symbol',next.icon));var info=el('div');info.appendChild(el('strong','',next.name));info.appendChild(el('small','',state.completed+' / '+next.n+' obiettivi'));box.appendChild(info);n.appendChild(box)}else{n.textContent='Hai sbloccato tutti i trofei! 🏆'}var grid=$('trophy-grid');grid.textContent='';trophies.forEach(function(t){var unlocked=state.completed>=t.n;var card=el('div','trophy'+(unlocked?'':' locked'));card.appendChild(el('div','symbol',unlocked?t.icon:'🔒'));card.appendChild(el('strong','',t.name));card.appendChild(el('small','',t.desc));grid.appendChild(card)});$('stat-sessions').textContent=state.sessions;$('stat-goals').textContent=state.completed;$('stat-minutes').textContent=state.minutes;$('stat-trophies').textContent=trophies.filter(function(t){return state.completed>=t.n}).length;$('stat-message').textContent=state.completed?'Hai già completato '+state.completed+' obiettivi! Mavis è fiera di te! 🐾':'Il primo passo è il più importante. Mavis fa il tifo per te!';['focus','short','long'].forEach(function(m){$(m+'-duration').textContent=state.durations[m]+' min';$('set-'+m).value=state.durations[m]});renderTimer()}
function addGoal(text){text=text.trim();if(!text)return;state.goals.push({id:String(Date.now())+Math.random(),date:today(),text:text,done:false});save();render();toast('Obiettivo aggiunto! 🍅')}
$('goal-form').addEventListener('submit',function(e){e.preventDefault();addGoal($('goal-input').value);$('goal-input').value=''});$('quick-add').onclick=function(){showPage('goals');$('goal-input').focus()};
var titles={timer:['È ora di concentrarsi!','Mavis è qui per farti compagnia 💗'],goals:['I tuoi piccoli grandi obiettivi','Ogni traguardo merita una zampetta 🐾'],collection:['La collezione dei trofei','Scopri tutte le ricompense di Mavis 🏆'],stats:['Quanto sei cresciuta!','Guarda tutti i tuoi progressi 🍅'],settings:['Rendila tua','Personalizza le sessioni come preferisci 💗']};function showPage(page){document.querySelectorAll('.page').forEach(function(p){p.classList.toggle('active',p.id===page)});document.querySelectorAll('[data-page]').forEach(function(b){b.classList.toggle('active',b.dataset.page===page)});$('page-title').textContent=titles[page][0];$('page-subtitle').textContent=titles[page][1];window.scrollTo(0,0)}document.querySelectorAll('[data-page]').forEach(function(b){b.onclick=function(){showPage(b.dataset.page)}});
// Il timer usa una scadenza assoluta: non dipende da setInterval in background.
function remaining(){if(state.timer.running&&state.timer.endAt)return Math.max(0,Math.ceil((state.timer.endAt-Date.now())/1000));return Math.max(0,state.timer.remaining)}
function fmt(sec){return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}
function renderTimer(){var t=state.timer;$('clock').textContent=fmt(remaining());$('start').textContent=t.running?'Ⅱ Pausa':'▶ Inizia';$('timer-label').textContent=t.mode==='focus'?'🍅 Tempo di studio':t.mode==='short'?'🌸 Pausa con Mavis!':'Riposati, te lo meriti!';document.querySelector('.timer-panel').classList.toggle('break-mode',t.mode!=='focus');$('timer-caption').textContent=t.running?'Mavis ti tiene compagnia ♡':'Mavis crede in te! ♡';document.querySelectorAll('[data-mode]').forEach(function(b){b.classList.toggle('selected',b.dataset.mode===t.mode)});renderReveal()}
function renderReveal(){var t=state.timer;var status=$('reveal-status');var mask=$('mavis-mask');if(t.mode!=='focus'){mask.style.clipPath='inset(0 0 0 0)';mask.style.webkitClipPath='inset(0 0 0 0)';status.textContent='🌸 Mavis si riposa con te!';return}var total=state.durations.focus*60;var elapsed=Math.max(0,total-remaining());var segments=Math.max(1,Math.ceil(state.durations.focus/5));var revealed=Math.min(segments,Math.floor(elapsed/300));var pct=revealed/segments*100;var cut='inset(0 0 '+pct+'% 0)';mask.style.clipPath=cut;mask.style.webkitClipPath=cut;status.textContent=revealed>=segments?'🐾 Ecco Mavis! Bravissima!':('🐾 Mavis si svela ogni 5 minuti: '+revealed+' / '+segments+' parti')}
function changeMode(mode,autoStart){var t=state.timer;t.mode=mode;t.running=!!autoStart;t.remaining=state.durations[mode]*60;t.endAt=autoStart?Date.now()+t.remaining*1000:null;save();renderTimer()}
// Recupera tutte le fasi scadute anche dopo ore con app sospesa o riaperta.
// Le scadenze successive partono dalla precedente, non dall'ora del risveglio.
function reconcileTimer(){
 var t=state.timer;if(!t.running||!Number.isFinite(Number(t.endAt)))return;
 var now=Date.now(),end=Number(t.endAt);
 if(end>now)return;
 var focusMs=Math.max(1,state.durations.focus)*60000;
 var breakMs=Math.max(1,state.durations.short)*60000;
 var elapsed=now-end,wasFocus=t.mode==='focus',completedFocus=0,transitions=0;
 // Prima transizione alla scadenza memorizzata.
 if(wasFocus){completedFocus++;t.mode='short';end+=breakMs}
 else{t.mode='focus';end+=focusMs}
 transitions++;
 // Avanza per cicli completi in tempo costante (anche dopo giorni).
 if(end<=now){
   var cycle=focusMs+breakMs;
   if(t.mode==='short'){
     var cycles=Math.floor((now-end)/cycle);
     if(cycles>0){completedFocus+=cycles;end+=cycles*cycle;transitions+=2*cycles}
   }else{
     var cycles2=Math.floor((now-end)/cycle);
     if(cycles2>0){completedFocus+=cycles2;end+=cycles2*cycle;transitions+=2*cycles2}
   }
   // Al massimo due passaggi residui.
   for(var i=0;i<3&&end<=now;i++){
     if(t.mode==='focus'){completedFocus++;t.mode='short';end+=breakMs}
     else{t.mode='focus';end+=focusMs}
     transitions++;
   }
 }
 t.endAt=end;t.remaining=Math.max(0,Math.ceil((end-now)/1000));
 state.sessions+=completedFocus;state.minutes+=completedFocus*state.durations.focus;
 save();render();
 // Un avviso solo al rientro, non tentare di riprodurre suoni a schermo bloccato.
 if(!document.hidden){
   toast(completedFocus?'🍅 Mavis ha recuperato il tempo trascorso! Ora '+(t.mode==='focus'?'si studia.':'è ora della pausa!'):'🐾 Pausa conclusa! Si riparte!');
   playSound('ding');
 }
}
function tick(){reconcileTimer();if(state.timer.running)renderTimer()}
setInterval(tick,500);
document.addEventListener('visibilitychange',function(){if(!document.hidden){reconcileTimer();renderTimer()}});
window.addEventListener('pageshow',function(){reconcileTimer();renderTimer()});
window.addEventListener('focus',function(){reconcileTimer();renderTimer()});
reconcileTimer();
tick();
$('start').onclick=function(){var t=state.timer;if(t.running){t.remaining=remaining();t.running=false;t.endAt=null}else{if(t.remaining<=0)t.remaining=state.durations[t.mode]*60;t.endAt=Date.now()+t.remaining*1000;t.running=true}save();renderTimer()};
$('reset').onclick=function(){var t=state.timer;t.running=false;t.endAt=null;t.remaining=state.durations[t.mode]*60;save();renderTimer()};
$('skip').onclick=function(){if(!confirm('Vuoi saltare questa fase e passare alla successiva?'))return;changeMode(state.timer.mode==='focus'?'short':'focus',true)};
document.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){var t=state.timer;if(t.running&&!confirm('Cambiare modalità interromperà il timer. Continuare?'))return;changeMode(b.dataset.mode,false)}});
$('welcome-start').onclick=function(){playSound('pop');$('welcome-first').hidden=true;$('session-setup').hidden=false};
$('setup-back').onclick=function(){$('welcome-first').hidden=false;$('session-setup').hidden=true};
$('session-setup').onsubmit=function(e){e.preventDefault();playSound('pop');var focus=Math.round(Number($('setup-focus').value)),rest=Math.round(Number($('setup-break').value));if(!(focus>=1&&focus<=180&&rest>=1&&rest<=60)){toast('Scegli durate valide');return}state.durations.focus=focus;state.durations.short=rest;changeMode('focus',true);$('welcome').classList.add('hidden');render();toast('Buono studio! Mavis fa il tifo per te 🐾')};
$('new-session').onclick=function(){playSound('pop');var t=state.timer;if(t.running&&!confirm('Vuoi interrompere la sessione attuale e sceglierne una nuova?'))return;t.remaining=remaining();t.running=false;t.endAt=null;save();$('setup-focus').value=state.durations.focus;$('setup-break').value=state.durations.short;$('welcome-first').hidden=false;$('session-setup').hidden=true;$('welcome').classList.remove('hidden');renderTimer()};
$('settings-form').onsubmit=function(e){e.preventDefault();['focus','short','long'].forEach(function(m){state.durations[m]=Math.max(1,Math.round(Number($('set-'+m).value)||defaults.durations[m]))});state.timer.running=false;state.timer.endAt=null;state.timer.remaining=state.durations[state.timer.mode]*60;save();render();toast('Impostazioni salvate! 💗')};$('clear-data').onclick=function(){if(!confirm('Cancellare tutti gli obiettivi, le statistiche e i trofei? Questa azione è irreversibile.'))return;state=JSON.parse(JSON.stringify(defaults));save();render();toast('Progressi azzerati')};var intro=$('intro');var introTimer=setTimeout(closeIntro,4300);function closeIntro(){playSound('whoosh');clearTimeout(introTimer);intro.classList.add('dismissed');setTimeout(function(){intro.hidden=true},750)}$('intro-skip').onclick=closeIntro;
// Suono delicato di movimento solo se l'utente ha già interagito.
setTimeout(function(){playSound('whoosh')},1100);
setTimeout(function(){playSound('pop')},2400);
if($('sound-toggle')){$('sound-toggle').onchange=function(){soundEnabled=this.checked};$('sound-preview').onclick=function(){unlockSound();playSound('ding')}}
$('today').textContent=new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});render();if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){})})}
})();
