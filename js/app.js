import {load,save,exportSave,importSave,blank,AV,wipeAll} from './managers/save.js';
import {genCustom,MODE_FA} from './engine/levelgen.js';
import {genClassic,growSeq,GRIDS} from './engine/sequence.js';
import {rules,adaptShow} from './engine/difficulty.js';
import {dayKey,dailySeed,dailySpec,recordDaily,streakNow} from './systems/daily.js';
import {nextAction,startupAction} from './systems/flow.js';
import {createAudio} from './systems/audio.js';
import {W,worldShow} from './data/worlds.js';
import {newRound,tap,cycle,check,summary,MAX_ERR} from './engine/engine.js';
import {levelInfo,record,derive,NEED,worldOpen} from './managers/stats.js';
import {ACH,evaluate} from './managers/achievements.js';
const $=s=>document.querySelector(s),app=$('#app'),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const SPEED={slow:1100,normal:750,fast:450};
let t0=0,S=load(),PR=false,PS={att:0,ok:0},R=null,T=[],tick=null,left=0,phase='idle',W_=1,L_=1;
const key=(w,l)=>w+'-'+l,done=(w,l)=>S.prog[key(w,l)],wOpen=w=>worldOpen(S,w),lOpen=(w,l)=>wOpen(w)&&(l===1||!!done(w,l-1));
let warned=false;
const nextL=w=>{let l=1;while(done(w,l))l++;return l},commit=()=>{if(!save(S)&&!warned){warned=true;toast('ذخیره‌سازی ممکن نیست (حافظه‌ی مرورگر بسته یا پر است). پیشرفت فقط تا بستن صفحه می‌ماند؛ از تنظیمات فایل ذخیره را دانلود کن.')}};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function prefs(){document.body.dataset.theme=S.settings.theme;document.body.classList.toggle('reduce',S.settings.reduce);document.body.classList.toggle('lowfx',S.settings.fx==='low')}
const {beep,music,unlock,halt,wake}=createAudio(()=>S.settings);
['pointerdown','touchend','click'].forEach(ev=>addEventListener(ev,unlock,{passive:true}));
const buzz=p=>{try{if(S.settings.vibrate&&typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(p)}catch{}};
const stop=()=>{T.forEach(clearTimeout);T=[];clearInterval(tick);tick=null},later=(f,ms)=>T.push(setTimeout(f,ms));
const head=back=>`<header>${back?`<button class="btn" data-go="${back}" aria-label="بازگشت">→</button>`:''}<h1>MIND GRID</h1><span class="pill">✨ ${fa(S.xp)}</span><span class="pill">🪙 ${fa(S.coins)}</span><button class="btn" data-go="settings" aria-label="تنظیمات">⚙</button></header>`;
function go(v,a){clearInterval(RUN?.iv);RUN=null;stop();$('#pause')?.remove();pz=null;phase='idle';prefs();({home,levels,settings,practice,grow,modes,profile,stats,achievements,records,daily})[v](a);}
app.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go,+g.dataset.a||undefined)});
function home(){
 const total=Object.keys(S.prog).length,r=S.resume;
 app.innerHTML=head()+`<section class="hero"><h2>جهان‌های جادویی</h2><p>پنج قلمرو، مراحل نامحدود و نگهبانانی که فقط با حافظه‌ات از آن‌ها عبور می‌کنی. ${fa(total)} مرحله تکمیل شده.</p><button class="btn main" id="cont">${r?'ادامه مرحله نیمه‌تمام':total?'ادامه ماجراجویی':'شروع ماجراجویی'}</button> <button class="btn" data-go="practice">حالت تمرین</button> <button class="btn" data-go="modes">🎮 حالت‌ها</button></section><div class="navrow"><button class="btn" data-go="profile">👤 پروفایل</button><button class="btn" data-go="stats">📊 آمار</button><button class="btn" data-go="achievements">🏆 دستاوردها</button><button class="btn" data-go="records">🥇 رکوردها</button><button class="btn" data-go="daily">📅 چالش روزانه</button></div><section class="worlds">${W.map((w,i)=>{const id=i+1,n=Object.keys(S.prog).filter(k=>k.startsWith(id+'-')).length;return `<button class="world" style="--a:${w[2]};--b:${w[3]}" data-go="levels" data-a="${id}" ${wOpen(id)?'':'disabled'}><span style="font-size:32px">${w[1]}</span><h3>${w[0]}</h3><small>${wOpen(id)?w[4]:'🔒 '+fa(NEED[id-2])+' مرحله از جهان قبلی را کامل کن'}</small><div class="bar"><i style="width:${Math.min(100,Math.round(n/(NEED[id-1]||50)*100))}%"></i></div><small>${fa(n)} / ${fa(NEED[id-1]||50)}${id<5?' تا باز شدن جهان بعد':''}</small></button>`}).join('')}</section><div class="panel"><div class="set"><span>بازی‌های انجام‌شده</span><b>${fa(S.games)}</b></div><div class="set"><span>پیروزی‌ها</span><b>${fa(S.wins)}</b></div><div class="set"><span>ستاره‌ها</span><b>${fa(Object.values(S.prog).reduce((a,p)=>a+p.stars,0))}</b></div></div>`;
 $('#cont').onclick=()=>{if(r)play(r.w,r.l,r);else{let w=S.lastW>=1&&wOpen(S.lastW)?S.lastW:1;if(!(S.lastW>=1)){while(w<5&&wOpen(w+1))w++}play(w,nextL(w))}};
}
function levels(w=W_){
 W_=w;const n=nextL(w),max=Math.ceil((n+4)/5)*5,wd=W[w-1];let h='';
 for(let l=1;l<=max;l++){const d=done(w,l);h+=`<button class="lv ${l===n?'cur':''}" data-l="${l}" ${lOpen(w,l)?'':'disabled'}>${l%10===0?'👑':''}${fa(l)}<small>${d?'⭐'.repeat(d.stars):l%10===0?'نگهبان':''}</small></button>`}
 app.innerHTML=head('home')+`<div class="world" style="--a:${wd[2]};--b:${wd[3]};min-height:0"><span style="font-size:30px">${wd[1]}</span><h3>${wd[0]}</h3><small>${wd[4]}</small></div><div class="panel"><div class="levels">${h}</div></div>`;
 app.querySelectorAll('.lv').forEach(b=>b.onclick=()=>play(w,+b.dataset.l));
}
function paint(lit=[]){const s=R.spec;app.querySelectorAll('.tile').forEach((t,i)=>{
 let c='tile';if(lit.includes(i))c+=' lit'+(s.mode==='color'?' c'+s.target[i]:'');
 else if(s.mode==='color'&&R.sel[i])c+=' c'+R.sel[i];else if(s.mode!=='color'&&(['sequence','reverse'].includes(s.mode)?R.sel[R.sel.length-1]===i&&R.status==='input':R.sel.includes?.(i)))c+=' ok';if(s.mode==='hidden'&&R.miss.includes(i)){c+=' miss';t.textContent=clue(s,i)}else t.textContent='';t.className=c})}
const clue=(s,i)=>{const r=Math.floor(i/s.size),c=i%s.size;return s.targets.filter(t=>t!==i&&Math.abs(Math.floor(t/s.size)-r)<=1&&Math.abs(t%s.size-c)<=1).length};
const msg=(t,k='')=>{const m=$('#msg');if(m){m.textContent=t;m.className='msg '+k}};
function play(w,l,res){PR=false;W_=w;L_=l;S.lastW=w;begin(genClassic(w,l,res?.size||S.settings.grid,adaptShow(worldShow(w,rules(S.settings).show),S.settings.adaptive?S.stats.recent:null)),res)}
function pstart(){PR=true;begin(genCustom({...S.practice,seed:(Date.now()^Math.floor(Math.random()*1e9))>>>0,show:SPEED[S.practice.speed]}))}
function begin(s,res){
 stop();R=newRound(s,res,PR?Infinity:rules(S.settings).err);
 app.innerHTML=head(PR?'practice':'levels')+`<div class="panel"><div class="row"><span class="pill">${PR?'🧪 تمرین':W[W_-1][1]+' مرحله '+fa(L_)+(s.boss?' 👑':'')}</span><span class="pill">${MODE_FA[s.mode]}</span><span class="pill" id="t">${s.time?'⏱ '+fa(s.time):'⏱ —'}</span><button class="btn" id="pz" aria-label="توقف" style="min-height:40px;padding:8px 14px">⏸</button></div><div class="board${s.size>8?' big':''}" style="--n:${s.size};gap:${s.size>8?3:s.size>6?4:8}px;${PR?'':`--l1:${W[W_-1][7]};--l2:${W[W_-1][8]}`}">${Array.from({length:s.cells},(_,i)=>`<button class="tile" data-i="${i}" aria-label="خانه ${i+1}"></button>`).join('')}</div><div class="msg" id="msg" aria-live="polite"></div><div class="row"><button class="btn main" id="go">شروع</button><button class="btn" id="chk" style="display:${s.mode==='color'?'':'none'}">بررسی</button></div></div>`;
 app.querySelectorAll('.tile').forEach(t=>t.onclick=()=>press(+t.dataset.i));
 $('#pz').onclick=pause;$('#go').onclick=()=>show();$('#chk').onclick=()=>{if(phase==='input'){check(R);after()}};
 if(res){phase='input';t0=Date.now();$('#go').disabled=true;paint();msg('از همان‌جا که بودی ادامه بده. خانه‌ها را انتخاب کن.','good');if(s.time)clock(res.left||s.time)}else msg(s.mode==='reverse'?'ترتیب را ببین؛ باید از آخر به اول بزنی.':'آماده‌ای؟ شروع را بزن.');
}
let pz=null;
const hasG=()=>!!(G&&['show','input','wait'].includes(G.ph)&&$('#gl'));
function dlg(btns){const d=document.createElement('div');d.className='pause';d.id='pause';d.setAttribute('role','dialog');
 d.innerHTML='<div class="panel"><h2 style="text-align:center;margin-top:0">توقف</h2><div class="row" style="justify-content:center">'+btns.map(([id,t,c])=>`<button class="btn${c||''}" id="${id}">${t}</button>`).join('')+'</div></div>';
 document.body.appendChild(d);$('#pr').onclick=unpause;return d}
function pause(){
 if($('#pause'))return;
 if(RUN&&$('#rb')){ // speed / ladder / perfect runs: freeze the clock too
  const rem=RUN.kind==='speed'?Math.max(0,RUN.end-Date.now()):0;clearInterval(RUN.iv);stop();phase='paused';pz={m:'run',rem};
  dlg([['pr','ادامه',' main'],['pex','خروج']]);$('#pex').onclick=()=>{$('#pause')?.remove();pz=null;go('modes')};return}
 if(hasG()){ // endless / daily
  stop();G.ph='paused';pz={m:'g'};dlg([['pr','ادامه',' main'],['pex','خروج']]);
  $('#pex').onclick=()=>{const d=G.daily;$('#pause')?.remove();pz=null;go(d?'daily':'grow')};return}
 if((phase!=='input'&&phase!=='show')||!R||RUN)return;
 pz={m:'r',ph:phase,at:Date.now()};if(phase==='input'&&!PR)persist();stop();phase='paused';
 dlg([['pr','ادامه',' main'],['prs','شروع دوباره‌ی مرحله'],['pex','خروج']]);
 $('#prs').onclick=()=>{$('#pause')?.remove();pz=null;PR?pstart():play(W_,L_)};$('#pex').onclick=()=>{$('#pause')?.remove();pz=null;go(PR?'practice':'levels')};
}
function unpause(){
 $('#pause')?.remove();if(!pz)return;const p=pz;pz=null;
 if(p.m==='run'){if(RUN){if(RUN.kind==='speed'){RUN.end=Date.now()+p.rem;speedTimer()}phase='idle';runRound()}return}
 if(p.m==='g'){if(G)ground();return}
 if(p.ph==='show'){phase='idle';show();return}
 phase='input';t0+=Date.now()-p.at;if(R.spec.time&&left>0)clock(left);
}
addEventListener('keydown',e=>{if(e.key==='Escape')$('#pause')?unpause():pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();halt()}else wake()});
function show(){
 const s=R.spec;stop();R=newRound(s,null,R.max);phase='show';const g=$('#go');if(g)g.disabled=true;if(!RUN)S.resume=null;paint();
 if(s.mode==='hidden'){msg('خانه‌های پنهان را پیدا کن. عدد روی هر خانه‌ی خالی، تعداد همسایه‌های پنهان آن است.');phase='input';t0=Date.now();if(s.time)clock(s.time);persist();return}
 msg('با دقت نگاه کن…');
 const flash=(arr,at,ms)=>{later(()=>{paint(arr);beep(520)},at);later(()=>paint(),at+ms)};
 if(s.mode==='moving'){const st=Math.round(s.show*1.6);s.frames.forEach((f,i)=>flash(f,400+i*st,st-150));later(ready,400+s.frames.length*st+100)}
 else if(['pattern','color','spatial'].includes(s.mode)){const ms=RUN?.kind==='speed'?700:Math.max(1400,s.count*450);flash(s.mode==='spatial'?s.shown:s.targets,400,ms);later(ready,400+ms+100)}
 else{s.targets.forEach((n,i)=>{later(()=>{paint([n]);beep(440+(PR||RUN?0:W[W_-1][6])+(i%16)*25)},400+i*s.show);later(()=>paint(),400+i*s.show+s.show*.6)});later(ready,400+s.count*s.show+200)}
}
function ready(){phase='input';t0=Date.now();msg({color:'رنگ خانه‌ها را بازسازی کن و بررسی را بزن.',spatial:'نسخه‌ی آینه‌ای (چپ↔راست) الگو را بزن!',moving:'جای نهایی خانه‌ها را بزن!',reverse:'از آخر به اول بزن!'}[R.spec.mode]||'حالا تکرار کن!','good');if(R.spec.time)clock(R.spec.time);persist()}
function clock(n){left=n;$('#t').textContent='⏱ '+fa(left);clearInterval(tick);tick=setInterval(()=>{left--;$('#t').textContent='⏱ '+fa(Math.max(left,0));if(left<=0){R.status='failed';after(true)}},1000)}
function persist(){if(PR||RUN)return;S.resume={w:W_,l:L_,size:R.spec.size,sel:[...R.sel],errors:R.errors,left:R.spec.time?left:0};commit()}
function press(i){
 if(phase!=='input')return;const before=R.errors;
 if(R.spec.mode==='color'){cycle(R,i);beep(500);paint();persist();return}
 tap(R,i);paint();beep(R.errors>before?180:620);if(R.errors>before)buzz(80);after();
 if(R.errors>before&&R.spec.mode!=='hidden'){const el=tl(i);if(el){el.classList.add('wrong');setTimeout(()=>el.classList.remove('wrong'),300)}}
}
function after(timeout){
 if(R.status==='input'){paint();const pg=['sequence','reverse'].includes(R.spec.mode)?fa(R.sel.length)+' از '+fa(R.spec.count):'',er=R.errors?(PR?`اشتباه: ${fa(R.errors)}`:`اشتباه ${fa(R.errors)} از ${fa(R.max+1)}`):'';msg([pg,er].filter(Boolean).join(' · '),R.errors?'bad':'');persist();return}
 stop();phase='end';if(RUN)return runAfter();const s=R.spec,r=summary(R),k=key(W_,L_),first=!S.prog[k];
 if(PR){PS.att++;if(r.won)PS.ok++;beep(r.won?780:150,.25);app.innerHTML=head('practice')+`<div class="panel"><div class="stars">${r.won?'✓':'✗'}</div><h2 style="text-align:center">${r.won?'درست بود':timeout?'زمان تمام شد':'این‌بار نشد'}</h2><p class="msg">اشتباه در این دور: ${fa(R.errors)} · تمرین‌های درست: ${fa(PS.ok)} از ${fa(PS.att)}</p><div class="row"><button class="btn main" id="again">الگوی جدید</button><button class="btn" data-go="practice">تنظیمات تمرین</button></div></div>`;$('#again').onclick=pstart;return}
 const lv0=levelInfo(S.xp).level,ms=Date.now()-t0;S.games++;S.resume=null;
 if(r.won){S.wins++;if(first){S.xp+=r.xp;S.coins+=r.coins}const p=S.prog[k]||{stars:0,best:0};S.prog[k]={stars:Math.max(p.stars,r.stars),best:Math.max(p.best,r.score)};beep(780,.25);buzz([40,40,40])}else{beep(150,.3);buzz(200)}
 record(S,s,R,r,ms);const news=evaluate(S,{spec:s,R,sum:r,left}),lv1=levelInfo(S.xp).level;commit();popups(news,lv1>lv0?lv1:0);
 app.innerHTML=head('levels')+`<div class="panel"><div class="stars">${'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)}</div><h2 style="text-align:center">${r.won?(s.boss?'نگهبان گشوده شد!':'مرحله کامل شد'):timeout?'زمان تمام شد':'این‌بار نشد'}</h2><p class="msg">${r.won?`امتیاز ${fa(r.score)}`+(first?` · +${fa(r.xp)} XP · +${fa(r.coins)} سکه`:' · پاداش این مرحله قبلاً گرفته شده'):'می‌توانی همان مرحله را دوباره امتحان کنی.'}</p><div class="row"><button class="btn" id="again">تلاش دوباره</button>${r.won?`<button class="btn main" id="nx">مرحله بعد</button>`:''}</div></div>`;
 $('#again').onclick=()=>play(W_,L_);if(r.won)$('#nx').onclick=()=>play(W_,L_+1);
 if(nextAction(S.settings,r.won)==='auto'){const m=$('.msg');if(m)m.textContent+=' · مرحله‌ی بعد تا لحظه‌ای دیگر شروع می‌شود';later(()=>play(W_,L_+1),2000)}
}
function popups(list,lvl){const q=[...list.map(a=>['🏆 '+a.t,'+'+fa(a.coin)+' سکه']),...(lvl?[['⬆ سطح '+fa(lvl),'']]:[])];
 q.forEach((p,i)=>setTimeout(()=>{const e=document.createElement('div');e.className='pop';e.setAttribute('role','status');e.innerHTML=`<b>${p[0]}</b><small>${p[1]}</small>`;document.body.appendChild(e);beep(880,.3);setTimeout(()=>e.remove(),3200)},i*3300))}
const dur=ms=>{const s=Math.round(ms/1000);return s>=3600?fa(Math.floor(s/3600))+' ساعت و '+fa(Math.floor(s%3600/60))+' دقیقه':fa(Math.floor(s/60))+':'+fa(String(s%60).padStart(2,'0'))};
const row=(t,v,h='')=>`<div class="set"><span>${t}${h?`<small>${h}</small>`:''}</span><b>${v}</b></div>`;
function profile(){
 const li=levelInfo(S.xp),d=derive(S),p=S.profile;
 app.innerHTML=head('home')+`<div class="panel"><div class="av">${AV.map(a=>`<button data-av="${a}" class="${a===p.avatar?'on':''}" aria-label="آواتار">${a}</button>`).join('')}</div><div class="set"><span>نام</span><input type="text" id="nm" maxlength="16" value="${p.name}" style="width:60%"></div><h3>سطح ${fa(li.level)}</h3><div class="xpbar"><i style="width:${Math.round(li.into/li.need*100)}%"></i></div><p class="hint">${fa(li.into)} از ${fa(li.need)} XP تا سطح بعد</p>${row('بازی‌ها',fa(S.games))}${row('پیروزی‌ها',fa(S.wins))}${row('بهترین امتیاز',fa(S.stats.bestScore))}${row('ستاره‌ها',fa(d.stars))}${row('دستاوردها',fa(Object.keys(S.ach).length)+' از '+fa(ACH.length))}${row('پیشرفت جهان‌ها',d.cleared.map(fa).join(' · '),'تعداد مرحله‌ی کامل‌شده در هر جهان')}</div>`;
 app.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{S.profile.avatar=b.dataset.av;commit();profile()});
 $('#nm').onchange=e=>{S.profile.name=e.target.value.replace(/[<>&"'`]/g,'').trim().slice(0,16)||'بازیکن';commit();profile()};
}
function stats(){
 const st=S.stats,d=derive(S),MF={...MODE_FA};
 app.innerHTML=head('home')+`<div class="panel">${row('کل بازی‌ها',fa(S.games),'فقط دورهای تمام‌شده')}${row('پیروزی‌ها',fa(S.wins))}${row('دقت',fa(d.accuracy)+'٪','ضربه‌های درست ÷ کل ضربه‌ها')}${row('میانگین امتیاز',fa(d.avgScore),'مجموع امتیاز بردها ÷ تعداد برد')}${row('بهترین امتیاز',fa(st.bestScore))}${row('میانگین زمان حل',S.wins?dur(d.avgTime):'—','زمان پاسخ‌دهی بردها')}${row('کل زمان بازی',dur(st.time),'مجموع زمان پاسخ‌دهی')}${row('پیشرفت جهان‌ها',d.cleared.map(fa).join(' · '))}${row('بهترین حالت حافظه',d.bestMode?MF[d.bestMode]:'—','بیشترین نرخ برد، حداقل ۳ بازی')}${row('طولانی‌ترین مسیر بی‌نقص',fa(st.bestPerfect),'برد پشت‌سرهم بدون اشتباه')}${row('چالش‌های روزانه‌ی کامل',fa(S.daily.total),'روزهایی که ۳ دور یا بیشتر رسیدی')}${row('بیشترین روز پیاپی روزانه',fa(S.daily.bestStreak))}</div>`;
}
function records(){
 const st=S.stats,d=derive(S);
 app.innerHTML=head('home')+`<div class="panel">${Object.keys(MODE_FA).map(m=>{const b=st.best[m];return row('رکورد '+MODE_FA[m],b?fa(b.score)+' امتیاز · '+dur(b.ms):'—','بهترین امتیاز و سریع‌ترین حل')}).join('')}${row('طولانی‌ترین مسیر بی‌نقص',fa(st.bestPerfect))}${row('بیشترین برد پشت‌سرهم',fa(st.bestStreak))}${row('بهترین دور حالت رشدی',fa(S.grow.best))}${row('رکورد چالش سرعت',fa(S.runs.speed))}${row('رکورد مسیر بی‌نقص',fa(S.runs.perfect))}${row('رکورد معکوس',fa(S.runs.reverse))}${row('رکورد الگو',fa(S.runs.pattern))}${row('رکورد مکانی',fa(S.runs.spatial))}${[1,2,3,4,5].map(w=>row('بالاترین مرحله‌ی جهان '+fa(w),fa(Math.max(0,...Object.keys(S.prog).filter(k=>k.startsWith(w+'-')).map(k=>+k.split('-')[1]))))).join('')}</div>`;
}
function achievements(){
 app.innerHTML=head('home')+`<div class="panel">${ACH.map(a=>{const u=S.ach[a.id];return `<div class="ach ${u?'':'lock'}"><span class="ic">${u?'🏆':'🔒'}</span><div><b>${a.t}</b><small>${a.d}</small><small>پاداش: ${fa(a.coin)} سکه${u?' · گرفته شد':''}</small></div></div>`}).join('')}</div>`;
}
let RUN=null;
function modes(){
 const card=(ic,t,d,id,go)=>`<div class="ach"><span class="ic">${ic}</span><div><b>${t}</b><small>${d}</small></div><button class="btn" ${go?`data-go="${go}"`:`id="${id}"`}>بازی</button></div>`;
 app.innerHTML=head('home')+`<div class="panel">${card('🧩','رشدی (بی‌پایان)','هر دور یک خانه اضافه می‌شود. رکورد: '+fa(S.grow.best),'','grow')}${card('⚡','چالش سرعت','۶۰ ثانیه؛ تا می‌توانی الگو را درست بزن. رکورد: '+fa(S.runs.speed),'rs')}${card('📅','چالش روزانه','هر روز یک دنباله‌ی یکسان برای همه؛ ۳ دور = کامل. روزهای پیاپی: '+fa(streakNow(S.daily,dayKey())),'','daily')}${card('↩','حافظه‌ی معکوس','دنباله را ببین و از آخر به اول بزن؛ با اولین اشتباه تمام می‌شود. رکورد: '+fa(S.runs.reverse),'rr')}${card('🔷','حافظه‌ی الگو','الگوی روشن‌شده را (بدون ترتیب) بازسازی کن. رکورد: '+fa(S.runs.pattern),'rpt')}${card('🪞','حافظه‌ی مکانی','نسخه‌ی آینه‌ای (چپ↔راست) الگو را بزن. رکورد: '+fa(S.runs.spatial),'rsp')}${card('🎯','مسیر بی‌نقص','تا ۱۰ الگوی پشت‌سرهم؛ با اولین اشتباه تمام می‌شود. رکورد: '+fa(S.runs.perfect),'rp')}<p class="hint">حالت‌های متحرک، پنهان و رنگ در «تمرین» هستند.</p></div>`;
 $('#rs').onclick=()=>runStart('speed');$('#rp').onclick=()=>runStart('perfect');$('#rr').onclick=()=>runStart('reverse');$('#rpt').onclick=()=>runStart('pattern');$('#rsp').onclick=()=>runStart('spatial');
}
const RK={speed:'⚡ سرعت',perfect:'🎯 بی‌نقص',reverse:'↩ معکوس',pattern:'🔷 الگو',spatial:'🪞 مکانی'},LADDER=['reverse','pattern','spatial'];
function runStart(kind){
 stop();PR=false;RUN={kind,n:0,score:0,seed:(Date.now()^Math.floor(Math.random()*1e9))>>>0,iv:null,end:0};
 app.innerHTML=head('modes')+`<div class="panel"><div class="row"><span class="pill">${RK[kind]}</span><span class="pill">امتیاز <b id="rsc">۰</b></span><span class="pill" id="t">${kind==='speed'?'⏱ ۶۰':'—'}</span></div><div class="board" id="rb"></div><div class="msg" id="msg" aria-live="polite"></div></div>`;
 if(kind==='speed'){RUN.end=Date.now()+60000;speedTimer()}
 runRound();
}
function speedTimer(){RUN.iv=setInterval(()=>{if(!RUN)return;const l=Math.ceil((RUN.end-Date.now())/1000),e=$('#t');if(e)e.textContent='⏱ '+fa(Math.max(l,0));if(l<=0)runEnd()},250)}
function runRound(){
 if(!RUN)return;const k=RUN.kind,n=RUN.n;
 const lad=LADDER.includes(k),spec=genCustom({mode:lad?k:'pattern',size:k==='speed'?4:lad?Math.min(6,4+Math.floor(n/4)):Math.min(6,4+Math.floor(n/3)),count:k==='speed'?Math.min(6,3+Math.floor(RUN.score/4)):lad?2+n:Math.min(10,3+n),seed:RUN.seed+n,show:500,time:0});
 R=newRound(spec,null,0);const b=$('#rb');b.style.setProperty('--n',spec.size);
 b.innerHTML=Array.from({length:spec.cells},(_,i)=>`<button class="tile" data-i="${i}" aria-label="خانه ${i+1}"></button>`).join('');
 b.querySelectorAll('.tile').forEach(t=>t.onclick=()=>press(+t.dataset.i));$('#rsc').textContent=fa(RUN.score);show();
}
function runAfter(){
 const won=R.status==='won';if(won){RUN.score++;beep(780,.15);$('#rsc').textContent=fa(RUN.score)}else beep(150,.25);
 if(RUN.kind==='perfect'&&(!won||RUN.score>=10)||LADDER.includes(RUN.kind)&&!won)return runEnd();
 RUN.n++;msg(won?'درست!':'اشتباه؛ الگوی بعدی',won?'good':'bad');later(runRound,600);
}
function runEnd(){
 if(!RUN)return;clearInterval(RUN.iv);stop();phase='end';const k=RUN.kind,sc=RUN.score,prev=S.runs[k],lv0=levelInfo(S.xp).level;RUN=null;S.games++;
 let txt='رکورد قبلی را نشکستی؛ پاداشی ثبت نشد.';
 if(sc>prev){const dx=(sc-prev)*(k==='speed'?3:k==='perfect'?10:4);S.xp+=dx;S.coins+=k==='perfect'?(sc-prev)*2:Math.floor(sc/5)-Math.floor(prev/5);S.runs[k]=sc;txt=`رکورد جدید! +${fa(dx)} XP`}
 const news=evaluate(S,null),lv1=levelInfo(S.xp).level;commit();popups(news,lv1>lv0?lv1:0);
 app.innerHTML=head('modes')+`<div class="panel"><div class="stars">${fa(sc)}</div><h2 style="text-align:center">${k==='perfect'&&sc>=10?'مسیر کامل شد!':'پایان'}</h2><p class="msg">${txt}</p><div class="row"><button class="btn main" id="again">دوباره</button><button class="btn" data-go="modes">حالت‌ها</button></div></div>`;$('#again').onclick=()=>runStart(k);
}
let G=null;const tl=i=>app.querySelectorAll('.tile')[i];
function grow(){
 const g=S.grow;app.innerHTML=head('modes')+`<div class="panel"><h3 style="margin-top:0">حالت رشدی</h3><p class="hint">هر دور یک خانه به ردیف اضافه می‌شود. کل ردیف را ببین و به همان ترتیب بزن. بهترین دور تو: ${fa(g.best)}</p><div class="set"><span>اندازه‌ی شبکه</span><select id="gs">${opt([4,5,6,7,8].map(x=>[x,fa(x)+'×'+fa(x)]),g.size)}</select></div><div class="row" style="margin-top:12px"><button class="btn main" id="gnew">شروع تازه</button>${g.run?`<button class="btn" id="gcont">ادامه از دور ${fa(g.run.len)}</button>`:''}</div></div>`;
 $('#gs').onchange=e=>{g.size=+e.target.value;commit();grow()};$('#gnew').onclick=()=>gstart(true);const c=$('#gcont');if(c)c.onclick=()=>gstart(false);
}
function gstart(fresh){
 stop();const g=S.grow;if(fresh||!g.run){g.run={seed:(Date.now()^Math.floor(Math.random()*1e9))>>>0,len:1,errors:0,size:g.size};commit()}
 G={...g.run,pos:0,seq:[],ph:'idle'};
 app.innerHTML=head('grow')+`<div class="panel"><div class="row"><span class="pill">🧩 دور <b id="gl"></b></span><span class="pill">رکورد ${fa(g.best)}</span></div><div class="board" style="--n:${G.size};gap:${G.size>6?4:8}px">${Array.from({length:G.size**2},(_,i)=>`<button class="tile" data-i="${i}" aria-label="خانه ${i+1}"></button>`).join('')}</div><div class="msg" id="msg" aria-live="polite"></div></div>`;
 app.querySelectorAll('.tile').forEach(t=>t.onclick=()=>gtap(+t.dataset.i));ground();
}
function ground(){
 stop();G.seq=growSeq(G.seed,G.size,G.len);G.pos=0;G.ph='show';$('#gl').textContent=fa(G.len);msg('نگاه کن…');
 const sp=Math.max(300,650-G.len*8);G.seq.forEach((c,i)=>{later(()=>{tl(c).classList.add('lit');beep(300+(c%12)*30,.1)},500+i*sp);later(()=>tl(c).classList.remove('lit'),500+i*sp+sp*.6)});
 later(()=>{G.ph='input';msg('حالا تکرار کن!','good')},500+G.len*sp+100);
}
function gtap(i){
 if(G?.ph!=='input')return;const t=tl(i),lim=G.daily?dailySpec.errors:rules(S.settings).err;
 if(G.seq[G.pos]===i){t.classList.add('ok');later(()=>t.classList.remove('ok'),200);beep(620);G.pos++;
  if(G.pos===G.len){G.ph='wait';G.len++;if(!G.daily){S.grow.run={seed:G.seed,len:G.len,errors:G.errors,size:G.size};commit()}msg('درست! یک خانه اضافه شد.','good');later(ground,900)}}
 else{G.errors++;beep(160,.25);buzz(80);t.classList.add('wrong');setTimeout(()=>t.classList.remove('wrong'),300);if(G.errors>lim)return gend();G.ph='wait';if(!G.daily){S.grow.run.errors=G.errors;commit()}msg(`اشتباه ${fa(G.errors)} از ${fa(lim+1)}؛ همین دور دوباره نشان داده می‌شود.`,'bad');later(ground,1300)}
}
function gend(){if(G.daily)return dend();
 stop();G.ph='end';const r=G.len-1,g=S.grow,prev=g.best,lv0=levelInfo(S.xp).level;S.games++;
 if(r>prev){S.xp+=(r-prev)*4;S.coins+=Math.floor(r/5)-Math.floor(prev/5);g.best=r}
 g.run=null;const news=evaluate(S,null),lv1=levelInfo(S.xp).level;commit();popups(news,lv1>lv0?lv1:0);
 app.innerHTML=head('grow')+`<div class="panel"><div class="stars">${fa(r)}</div><h2 style="text-align:center">به دور ${fa(r)} رسیدی</h2><p class="msg">${r>prev?`رکورد جدید! +${fa((r-prev)*4)} XP`:'رکورد قبلی را نشکستی؛ پاداشی ثبت نشد.'}</p><div class="row"><button class="btn main" id="again">دوباره</button><button class="btn" data-go="home">خانه</button></div></div>`;$('#again').onclick=()=>gstart(true);
}
function daily(){
 const d=S.daily,key=dayKey(),best=d.hist[key]||0,days=Object.keys(d.hist).sort().slice(-7).reverse();
 app.innerHTML=head('home')+`<div class="panel"><h3 style="margin-top:0">📅 چالش روزانه</h3><p class="hint">امروز (${fa(key)}) همه یک دنباله‌ی یکسان ${fa(dailySpec.size)}×${fa(dailySpec.size)} می‌بینند. هر دور یک خانه اضافه می‌شود و فقط ${fa(dailySpec.errors)} اشتباه مجاز است. ${fa(dailySpec.goal)} دور = چالش کامل. پاداش فقط برای بهتر کردن نتیجه‌ی همان روز است.</p>${row('بهترین امروز',fa(best))}${row('وضعیت امروز',best>=dailySpec.goal?'کامل ✓':'کامل نشده')}${row('روزهای پیاپی',fa(streakNow(d,key)))}${row('بیشترین روز پیاپی',fa(d.bestStreak))}${row('کل روزهای کامل',fa(d.total))}<div class="row" style="margin-top:12px"><button class="btn main" id="dgo">${best?'دوباره':'شروع'}</button></div>${days.length?'<h4>روزهای اخیر</h4>'+days.map(k=>row(fa(k),fa(d.hist[k])+' دور')).join(''):''}</div>`;
 $('#dgo').onclick=dstart;
}
function dstart(){
 stop();PR=false;const key=dayKey();
 G={seed:dailySeed(key),len:1,errors:0,size:dailySpec.size,pos:0,seq:[],ph:'idle',daily:true,key};
 app.innerHTML=head('daily')+`<div class="panel"><div class="row"><span class="pill">📅 دور <b id="gl"></b></span><span class="pill">بهترین امروز ${fa(S.daily.hist[key]||0)}</span></div><div class="board" style="--n:${G.size};gap:8px">${Array.from({length:G.size**2},(_,i)=>`<button class="tile" data-i="${i}" aria-label="خانه ${i+1}"></button>`).join('')}</div><div class="msg" id="msg" aria-live="polite"></div></div>`;
 app.querySelectorAll('.tile').forEach(t=>t.onclick=()=>gtap(+t.dataset.i));ground();
}
function dend(){
 stop();G.ph='end';const r=G.len-1,key=G.key,lv0=levelInfo(S.xp).level;S.games++;
 const rw=recordDaily(S.daily,key,r);S.xp+=rw.xp;S.coins+=rw.coins;
 const news=evaluate(S,null),lv1=levelInfo(S.xp).level;commit();popups(news,lv1>lv0?lv1:0);
 app.innerHTML=head('daily')+`<div class="panel"><div class="stars">${fa(r)}</div><h2 style="text-align:center">نتیجه‌ی امروز: ${fa(r)} دور</h2><p class="msg">${rw.xp?`بهترین امروز بهتر شد! +${fa(rw.xp)} XP`+(rw.coins?` · +${fa(rw.coins)} سکه`:''):'بهترین امروز بهتر نشد؛ پاداشی ثبت نشد.'}</p><div class="row"><button class="btn main" id="again">دوباره</button><button class="btn" data-go="daily">صفحه‌ی چالش</button></div></div>`;$('#again').onclick=dstart;
}
const opt=(a,v)=>a.map(([k,t])=>`<option value="${k}" ${String(k)===String(v)?'selected':''}>${t}</option>`).join('');
function practice(){
 const p=S.practice,cap=Math.floor(p.size*p.size*.55),tg=(id,t,a,v)=>`<div class="set"><span>${t}</span><select id="${id}">${opt(a,v)}</select></div>`;
 app.innerHTML=head('home')+`<div class="panel"><h3 style="margin-top:0">حالت تمرین</h3><p class="hint">بدون محدودیت تلاش، بدون پاداش و بدون ثبت در آمار. حداکثر خانه‌ی روشن برای این شبکه: ${fa(cap)}.</p>`+
 tg('mode','نوع حافظه',Object.entries(MODE_FA),p.mode)+
 tg('size','اندازه‌ی شبکه',[3,4,5,6,7].map(x=>[x,fa(x)+'×'+fa(x)]),p.size)+
 tg('count','تعداد خانه‌ها (پیچیدگی)',Array.from({length:11},(_,i)=>[i+2,fa(i+2)]),Math.min(p.count,cap))+
 tg('speed','سرعت نمایش',[['slow','کند'],['normal','متوسط'],['fast','سریع']],p.speed)+
 tg('time','محدودیت زمان',[[0,'بدون محدودیت'],[10,'۱۰ ثانیه'],[20,'۲۰ ثانیه'],[30,'۳۰ ثانیه'],[60,'۶۰ ثانیه']],p.time)+
 (p.mode==='color'?tg('palette','تعداد رنگ',[2,3,4].map(x=>[x,fa(x)]),p.palette):'')+
 `<div class="row" style="margin-top:14px"><button class="btn main" id="ps">شروع تمرین</button></div></div>`;
 for(const k of ['mode','size','count','speed','time','palette']){const e=$('#'+k);if(e)e.onchange=()=>{const v=e.value;S.practice[k]=['mode','speed'].includes(k)?v:+v;if(k==='size')S.practice.count=Math.min(S.practice.count,Math.floor(S.practice.size**2*.55));commit();practice()}}
 $('#ps').onclick=pstart;
}
const tilePx=n=>{const w=Math.min(innerWidth-58,560),g=n>8?3:n>6?4:8;return (w-(n-1)*g)/n};
function settings(){
 const st=S.settings,tgl=(id,t,v)=>`<div class="set"><span>${t}</span><button class="btn" id="${id}">${v?'روشن':'خاموش'}</button></div>`,rng_=(id,t,v)=>`<div class="set"><span>${t}</span><input type="range" id="${id}" min="0" max="100" value="${v}" aria-label="${t}"></div>`,sel=(id,t,a,v)=>`<div class="set"><span>${t}</span><select id="${id}">${opt(a,v)}</select></div>`;
 app.innerHTML=head('home')+`<div class="panel">${tgl('snd','افکت صوتی',st.sound)}${rng_('sfx','حجم افکت',st.sfx)}${tgl('mus','موسیقی',st.music)}${rng_('musv','حجم موسیقی',st.mus)}${sel('diff','سختی (تعداد اشتباه مجاز)',[['easy','آسان: ۳ اشتباه'],['normal','معمولی: ۲'],['hard','سخت: ۱'],['expert','استاد: بدون اشتباه'],['custom','سفارشی']],st.diff)}${st.diff==='custom'?sel('cerr','اشتباه مجاز (سفارشی)',[0,1,2,3,4,5].map(x=>[x,fa(x)]),st.cErr)+sel('cshow','زمان روشن‌بودن هر خانه (سفارشی)',[200,300,400,550,700,900,1200,1500].map(x=>[x,fa(x)+' میلی‌ثانیه']),st.cShow):''}${tgl('an','ادامه‌ی خودکار به مرحله‌ی بعد',st.autoNext)}${tgl('ar','ازسرگیری خودکار مرحله‌ی نیمه‌تمام هنگام باز شدن',st.autoResume)}${tgl('ad','سختی تطبیقی (فقط سرعت نمایش، نه دنباله)',st.adaptive)}${typeof navigator!=='undefined'&&navigator.vibrate?tgl('vb','لرزش',st.vibrate):''}${document.documentElement.requestFullscreen?`<div class="set"><span>تمام‌صفحه</span><button class="btn" id="fs">${document.fullscreenElement?'خروج':'ورود'}</button></div>`:''}${sel('grid','اندازه‌ی شبکه (از مرحله‌ی بعد)',GRIDS.map(x=>[x,fa(x)+'×'+fa(x)]),st.grid)}${tilePx(st.grid)<32?`<p class="hint">روی این صفحه خانه‌ها حدود ${fa(Math.round(tilePx(st.grid)))} پیکسل می‌شوند و زدنشان سخت است؛ ۸×۸ یا ۶×۶ راحت‌تر است.</p>`:''}${sel('theme','تم',[['dark','تیره'],['light','روشن']],st.theme)}${sel('fx','کیفیت انیمیشن',[['full','کامل'],['low','کم']],st.fx)}${tgl('red','کاهش حرکت',st.reduce)}<div class="set"><span>خروجی فایل ذخیره</span><button class="btn" id="exp">دانلود</button></div><div class="set"><span>ورود فایل ذخیره</span><button class="btn" id="imp">انتخاب فایل</button><input type="file" id="file" accept=".json" hidden></div><div class="set"><span>پاک‌کردن پیشرفت</span><button class="btn" id="rst">پاک‌کردن</button></div></div>`;
 const flip=(id,k,after)=>$('#'+id).onclick=()=>{st[k]=!st[k];commit();prefs();after?.();settings()};
 flip('snd','sound');flip('an','autoNext');flip('ar','autoResume');flip('ad','adaptive');if($('#vb'))flip('vb','vibrate');if($('#fs'))$('#fs').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}setTimeout(settings,400)};flip('mus','music',music);flip('red','reduce');
 $('#sfx').onchange=e=>{st.sfx=+e.target.value;commit();beep(600)};$('#musv').onchange=e=>{st.mus=+e.target.value;commit()};
 for(const[id,k]of[['diff','diff'],['grid','grid'],['cerr','cErr'],['cshow','cShow'],['theme','theme'],['fx','fx']])if($('#'+id))$('#'+id).onchange=e=>{st[k]=['grid','cErr','cShow'].includes(k)?+e.target.value:e.target.value;commit();prefs();if(k==='diff'||k==='grid')settings()};
 $('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([exportSave(S)],{type:'application/json'}));a.download='mindgrid-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
 $('#imp').onclick=()=>$('#file').click();
 $('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;const v=importSave(await f.text());if(!v)return toast('فایل ذخیره معتبر نیست؛ چیزی تغییر نکرد.');S=v;commit();music();toast('ذخیره وارد شد.');go('home')};
 $('#rst').onclick=()=>{if(confirm('همه پیشرفت پاک می‌شود. ادامه می‌دهی؟')&&confirm('تأیید نهایی: این کار قابل بازگشت نیست.')){wipeAll();S=blank();commit();music();toast('پیشرفت پاک شد.');go('home')}};
}
const crash=()=>toast('خطایی رخ داد. اگر بازی درست کار نکرد صفحه را دوباره باز کن؛ از تنظیمات هم می‌توانی فایل ذخیره را دانلود کنی.');
addEventListener('error',e=>{if(!/ResizeObserver/.test(e.message||''))crash()});addEventListener('unhandledrejection',crash);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('service-worker.js').catch(()=>{});
go('home');{const a=startupAction(S);if(a)play(a.w,a.l,a.res)}
