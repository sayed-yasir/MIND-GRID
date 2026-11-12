import * as LG from '../js/engine/levelgen.js';
const {genCustom,growSeq}=LG;
import {genClassic} from '../js/engine/sequence.js';
import {rules,PRESETS,adaptShow} from '../js/engine/difficulty.js';
import {dayKey,dailySeed,dailyReward,recordDaily,streakNow,dailySpec} from '../js/systems/daily.js';
import {nextAction,startupAction} from '../js/systems/flow.js';
import {newRound,tap,cycle,check,summary} from '../js/engine/engine.js';
import {levelInfo,record,derive,worldOpen,NEED} from '../js/managers/stats.js';
import {evaluate,ACH} from '../js/managers/achievements.js';
import {load,save,validate,blank,importSave,exportSave,wipeAll,BACKUP_EVERY,MAX_LEVEL} from '../js/managers/save.js';
import {W,worldShow} from '../js/data/worlds.js';
import {GRIDS} from '../js/engine/sequence.js';
let pass=0,fail=0;const t=(m,c)=>{c?pass++:(fail++,console.log('FAIL',m))};
const mem=()=>{const m={};return{getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},m}};
let sets=0;
for(const mode of ['pattern','sequence','reverse','color'])for(let size=3;size<=7;size++)for(const count of [1,2,5,12,40,999]){
 const a=genCustom({mode,size,count,palette:3,show:750,time:0,seed:size*7+count});
 t('custom solvable',a.count>=2&&a.count<=Math.floor(size*size*.55)&&a.cells===size*size&&new Set(a.targets).size===a.count);
 const r=newRound(a,null,Infinity);
 if(mode==='color'){a.target.forEach((v,i)=>{for(let k=0;k<v;k++)cycle(r,i)});check(r)}else a.order.forEach(i=>tap(r,i));
 t('custom perfect play '+mode+size+count,r.status==='won');
}
{const a=genCustom({mode:'pattern',size:4,count:4,seed:1,show:750,time:0}),r=newRound(a,null,Infinity),bad=[...Array(a.cells).keys()].find(i=>!a.targets.includes(i));
 for(let k=0;k<50;k++)tap(r,bad);t('practice never fails on errors',r.status==='input'&&r.errors===50);
 const h=newRound(genClassic(1,3),null,1),b2=(h.spec.order[0]+1)%h.spec.cells;tap(h,b2);t('hard: 1 error ok',h.status==='input');tap(h,b2);t('hard: 2nd error fails',h.status==='failed');
 const e=newRound(genClassic(1,3),null,3);for(let k=0;k<3;k++)tap(e,b2);t('easy: 3 errors ok',e.status==='input');tap(e,b2);t('easy: 4th fails',e.status==='failed');
 const v=validate({v:1,prog:{},settings:{diff:'x',theme:'neon',sfx:900,mus:-3},practice:{mode:'zz',size:99,count:0,time:7}});
 t('settings sanitized',v.settings.diff==='normal'&&v.settings.theme==='dark'&&v.settings.sfx===100&&v.settings.mus===0&&v.practice.mode==='pattern'&&v.practice.size===7&&v.practice.count>=2&&v.practice.time===0);}
for(const size of[6,8,10])for(let w=1;w<=5;w++)for(let l=1;l<=120;l++){
 const a=genClassic(w,l,size),b=genClassic(w,l,size);sets++;
 t('deterministic',JSON.stringify(a)===JSON.stringify(b));
 t('targets in range, no immediate repeat',a.targets.length===l&&a.targets.every((x,i)=>x>=0&&x<a.cells&&(i===0||x!==a.targets[i-1])));
 const r=newRound(a);a.order.forEach(i=>tap(r,i));
 t(`perfect play wins s${size}w${w}l${l}`,r.status==='won'&&summary(r).stars===3);
}
{const a=genClassic(1,3),r=newRound(a),bad=(a.order[0]+1)%a.cells;
 tap(r,bad);tap(r,bad);t('2 errors still playing',r.status==='input');tap(r,bad);t('3 errors fails',r.status==='failed'&&summary(r).xp===0);}
{const a=genCustom({mode:'reverse',size:4,count:4,seed:2,show:500,time:0}),r=newRound(a);tap(r,a.targets[0]);t('reverse rejects forward order',r.errors===1)}
t('later levels longer',genClassic(1,40).count>genClassic(1,1).count);
t('dead V5 generator removed',!('gen' in LG));
{const ls=mem(),s=blank();s.xp=50;s.prog['1-1']={stars:3,best:0};t('save ok',save(s,ls));s.xp=60;save(s,ls);
 t('backup holds previous',JSON.parse(ls.m.mindgrid5_bak).xp===50);
 ls.setItem('mindgrid5','{broken');t('corrupt falls back to backup',load(ls).xp===50);
 t('export/import roundtrip',importSave(exportSave(s)).xp===60);
 t('import rejects junk',importSave('nope')===null&&importSave('{"v":9}')===null);
 t('validate clamps',validate({v:1,cv:2,xp:-5,prog:{'9-9':{stars:3},'2-3':{stars:99}},resume:{w:9,l:1,sel:[]}}).prog['2-3'].stars===3);
 const l2=mem();l2.setItem('mind_grid_v4_save',JSON.stringify({xp:80,coins:20,completed:{'1-1':true,'1-2':true},stars:{'1-1':3},games:4}));
 const m=load(l2);t('v4 migration',m.xp===80&&Object.keys(m.prog).length===2&&m.prog['1-1'].stars===3);}
{const S=blank(),a=genClassic(3,1),R=newRound(a);a.order.forEach(i=>tap(R,i));const sum=summary(R);
 S.wins=1;S.games=1;S.prog['3-1']={stars:3,best:sum.score};record(S,a,R,sum,4000);
 t('record: accuracy 100',derive(S).accuracy===100&&S.stats.bestPerfect===1&&S.stats.modes.sequence.w===1);
 S.runs.speed=10;const n1=evaluate(S,{spec:a,R,sum,left:a.time});const ids=n1.map(x=>x.id);
 t('unlocks first/perfect/speed',['first_memory','perfect_focus','speed_master'].every(i=>ids.includes(i)));
 const c0=S.coins;t('no double reward',evaluate(S,{spec:a,R,sum,left:a.time}).length===0&&S.coins===c0);
 const R2=newRound(a);tap(R2,a.cells-1<0?0:[...Array(a.cells).keys()].find(i=>i!==a.order[0]));const s2=summary({...R2,status:'failed'});record(S,a,{...R2,status:'failed'},s2,2000);
 t('loss: not a win, streak reset',S.stats.modes.sequence.g===2&&S.stats.modes.sequence.w===1&&S.stats.perfect===0&&S.stats.bestPerfect===1);
 t('level formula',levelInfo(0).level===1&&levelInfo(50).level===2&&levelInfo(200).level===3&&levelInfo(49).level===1);
 const v=validate(JSON.parse(JSON.stringify(S)));t('stats survive save validation',v.stats.bestPerfect===1&&v.ach.first_memory>0&&v.stats.modes.sequence.g===2);
 const bad=validate({v:1,prog:{},profile:{name:'<b>x</b>'.repeat(9),avatar:'💀'},ach:{'BAD KEY':1},stats:{modes:{pattern:{g:2,w:9}}}});
 t('profile/ach/stats sanitized',!/[<>]/.test(bad.profile.name)&&bad.profile.name.length<=16&&bad.profile.avatar==='🧙'&&!('BAD KEY' in bad.ach)&&bad.stats.modes.pattern.w===2);
 t('mastery counted by wins',(()=>{const T=blank();T.stats.modes.sequence={g:12,w:10};return evaluate(T,null).some(x=>x.id==='sequence_master')})());}
{for(const size of [4,5,6,7,8]){const a=growSeq(12345,size,60),b=growSeq(12345,size,30);
 t('grow prefix-stable '+size,b.every((x,i)=>x===a[i]));t('grow valid '+size,a.length===60&&a.every((c,i)=>c>=0&&c<size*size&&(i===0||c!==a[i-1])))}
 const S=blank();for(let l=1;l<NEED[0];l++)S.prog['1-'+l]={stars:1,best:0};
 t('world 2 closed below threshold',!worldOpen(S,2)&&worldOpen(S,1));S.prog['1-'+NEED[0]]={stars:1,best:0};t('world 2 opens at threshold',worldOpen(S,2)&&!worldOpen(S,3));
 for(let l=1;l<=NEED[1];l++)S.prog['2-'+l]={stars:1,best:0};t('world 3 opens after its threshold',worldOpen(S,3));
 const g=validate({v:1,prog:{},grow:{best:-4,size:99,run:{seed:5,len:9999,errors:1,size:2}}}).grow;t('grow sanitized',g.best===0&&g.size===8&&g.run.len===200&&g.run.size===4);
 const T=blank();T.grow.best=15;t('endless_survivor at 15',evaluate(T,null).some(x=>x.id==='endless_survivor'))}
{for(const mode of['moving','hidden','spatial'])for(let size=3;size<=7;size++)for(let seed=1;seed<=20;seed++){
  const a=genCustom({mode,size,count:size*2,seed,show:700,time:0});
  t('new mode valid',a.count>=2&&new Set(a.targets).size===a.count&&a.targets.every(x=>x>=0&&x<a.cells));
  if(mode==='moving')t('moving frames keep count',a.frames.length===3&&a.frames.every(f=>f.length===a.count&&new Set(f).size===a.count&&f.every(x=>x>=0&&x<a.cells)));
  if(mode==='spatial'&&size>2){const m=c=>Math.floor(c/size)*size+(size-1-c%size);t('spatial = mirror',a.shown.map(m).every((c,i)=>c===a.targets[i]))}
  const r=newRound(a,null,0);a.targets.forEach(i=>tap(r,i));t('perfect '+mode,r.status==='won'&&r.errors===0)}
 const h=genCustom({mode:'hidden',size:4,count:4,seed:3,show:700,time:0}),r=newRound(h,null,2),bad=[...Array(16).keys()].find(i=>!h.targets.includes(i));
 tap(r,bad);tap(r,bad);t('hidden: miss counted once',r.errors===1&&r.miss.length===1);
 h.targets.forEach(i=>tap(r,i));t('hidden: still winnable after a miss',r.status==='won'&&summary(r).stars===2);
 t('save keeps new modes',validate({v:1,prog:{},practice:{mode:'hidden'},runs:{speed:12,perfect:99},stats:{modes:{moving:{g:3,w:2}}}}).practice.mode==='hidden');
 const vv=validate({v:1,prog:{},runs:{speed:12,perfect:99},stats:{modes:{moving:{g:3,w:2}}}});t('runs/modes sanitized',vv.runs.speed===12&&vv.runs.perfect===10&&vv.stats.modes.moving.w===2)}

// ---- Classic Sequence (V6 spec acceptance) ----
for(const[lv,len]of[[1,1],[2,2],[3,3],[10,10],[50,50],[100,100],[200,200]]){const a=genClassic(1,lv,8);t('classic length '+lv,a.targets.length===len&&a.count===len&&a.level===lv&&a.size===8)}
for(const size of[6,8,10,12,15]){const a=genClassic(2,40,size),b=genClassic(2,41,size);
 t('classic +1 tile, prefix kept '+size,b.targets.length===a.targets.length+1&&a.targets.every((x,i)=>x===b.targets[i]));
 t('classic valid tiles '+size,b.cells===size*size&&b.targets.every((c,i)=>c>=0&&c<size*size&&(i===0||c!==b.targets[i-1])));
 t('grid size does not change level/length '+size,a.level===40&&a.count===40)}
t('restart keeps same sequence',JSON.stringify(genClassic(3,25,8))===JSON.stringify(genClassic(3,25,8)));
t('worlds differ',JSON.stringify(genClassic(1,20,8).targets)!==JSON.stringify(genClassic(2,20,8).targets));
for(let lv=1;lv<=60;lv++){const a=genClassic(1,lv,8),r=newRound(a,null,2);a.order.forEach(i=>tap(r,i));t('classic perfect play '+lv,r.status==='won'&&summary(r).stars===3)}
{const a=genClassic(5,200,15),r=newRound(a,null,2);a.order.forEach(i=>tap(r,i));t('level 200 on 15x15 completes',r.status==='won'&&a.order.length===200)}
{const a=genClassic(1,5,8),bad=[...Array(64).keys()].find(i=>i!==a.order[0]),r=newRound(a,null,0);tap(r,bad);t('wrong tile never wins',r.status==='failed'&&!summary(r).won&&summary(r).xp===0);
 const r2=newRound(a,null,2);tap(r2,a.order[0]);tap(r2,bad===a.order[1]?(bad+1)%64:bad);t('wrong tile counted, progress kept',r2.errors===1&&r2.sel.length===1&&r2.status==='input')}
{const a=genClassic(1,12,8),r=newRound(a,null,2);a.order.slice(0,5).forEach(i=>tap(r,i));
 const r2=newRound(genClassic(1,12,8),{sel:[...r.sel],errors:r.errors},2);t('resume restores position',JSON.stringify(r2.sel)===JSON.stringify(a.order.slice(0,5)));
 a.order.slice(5).forEach(i=>tap(r2,i));t('resumed round completes',r2.status==='won')}
{const v=validate({v:1,cv:2,prog:{},settings:{grid:12},resume:{w:2,l:200,size:10,sel:Array(150).fill(3),errors:0,left:0}});
 t('save keeps grid + resume size + long resume',v.settings.grid===10&&v.resume.size===10&&v.resume.sel.length===150);
 t('grid clamped',validate({v:1,cv:2,prog:{},settings:{grid:99}}).settings.grid===10&&validate({v:1,cv:2,prog:{},settings:{grid:1}}).settings.grid===6&&validate({v:1,cv:2,prog:{},settings:{grid:12}}).settings.grid===10&&validate({v:1,cv:2,prog:{}}).settings.grid===8);
 const o=validate({v:1,xp:120,coins:7,prog:{'1-3':{stars:3}},resume:{w:1,l:2,sel:[1]}});
 t('V5 campaign progress reset, XP/coins kept',o.xp===120&&o.coins===7&&Object.keys(o.prog).length===0&&o.resume===null&&o.cv===2)}

// ---- Phase 2: difficulty, Auto Continue, Auto Resume ----
t('difficulty presets',rules({diff:'easy'}).err===3&&rules({diff:'normal'}).err===2&&rules({diff:'hard'}).err===1&&rules({diff:'expert'}).err===0&&rules({diff:'zzz'}).err===2);
t('custom difficulty clamped',rules({diff:'custom',cErr:99,cShow:5}).err===5&&rules({diff:'custom',cErr:99,cShow:5}).show===200&&rules({diff:'custom',cErr:-3,cShow:9999}).show===1500&&rules({diff:'custom',cErr:1,cShow:640}).show===640);
t('expert is stricter and faster than hard',PRESETS.expert.err<PRESETS.hard.err&&PRESETS.expert.show<PRESETS.hard.show);
{const a=genClassic(1,9,8,rules({diff:'expert'}).show),b=genClassic(1,9,8,rules({diff:'easy'}).show);t('difficulty never changes sequence',JSON.stringify(a.targets)===JSON.stringify(b.targets)&&a.count===9&&b.count===9&&a.show<b.show);
 const r=newRound(a,null,rules({diff:'expert'}).err),bad=[...Array(64).keys()].find(i=>i!==a.order[0]);tap(r,bad);t('expert: first mistake fails',r.status==='failed')}
{const v=validate({v:1,cv:2,prog:{},settings:{diff:'custom',cErr:4,cShow:900,autoNext:1,autoResume:0}}).settings;
 t('settings keep difficulty/auto flags',v.diff==='custom'&&v.cErr===4&&v.cShow===900&&v.autoNext===true&&v.autoResume===false);
 t('bad difficulty falls back',validate({v:1,cv:2,prog:{},settings:{diff:'nope',cErr:'x'}}).settings.diff==='normal'&&validate({v:1,cv:2,prog:{}}).settings.autoNext===false)}
t('auto continue on: win -> auto',nextAction({autoNext:true},true)==='auto');
t('auto continue off: win -> manual button',nextAction({autoNext:false},true)==='manual');
t('loss never auto-continues',nextAction({autoNext:true},false)==='stay');
{const S=blank();S.resume={w:2,l:7,size:8,sel:[1],errors:0,left:0};
 t('auto resume off: nothing on startup',startupAction(S)===null);
 S.settings.autoResume=true;const a=startupAction(S);t('auto resume on: restores unfinished level',a.w===2&&a.l===7&&a.res===S.resume);
 S.resume=null;t('auto resume on, nothing saved',startupAction(S)===null);
 const A=blank();A.settings.autoNext=true;t('flags independent',startupAction(A)===null&&nextAction(A.settings,true)==='auto')}

// ---- Phase 3: Daily Challenge, Adaptive, ladder modes ----
t('dayKey format',dayKey(new Date(2026,10,12))==='2026-11-12'&&dayKey(new Date(2026,0,5))==='2026-01-05');
t('daily seed: same day same, other day differs',dailySeed('2026-11-12')===dailySeed('2026-11-12')&&dailySeed('2026-11-12')!==dailySeed('2026-11-13'));
{const a=growSeq(dailySeed('2026-11-12'),dailySpec.size,12),b=growSeq(dailySeed('2026-11-12'),dailySpec.size,13);t('daily sequence grows by one, stable',b.length===13&&a.every((x,i)=>x===b[i]))}
t('daily reward only for improvement',dailyReward(3,3).xp===0&&dailyReward(5,3).xp===0&&dailyReward(0,5).xp===15&&dailyReward(0,5).coins===1&&dailyReward(5,10).coins===1);
{const d=blank().daily;let rw=recordDaily(d,'2026-11-10',2);t('daily <goal: no completion',d.total===0&&d.streak===0&&rw.xp===6);
 recordDaily(d,'2026-11-10',4);t('daily completed once',d.total===1&&d.streak===1&&d.hist['2026-11-10']===4);
 recordDaily(d,'2026-11-10',6);t('same day improve does not double-count',d.total===1&&d.streak===1);
 recordDaily(d,'2026-11-11',3);t('next day streak 2',d.streak===2&&d.bestStreak===2&&d.total===2);
 recordDaily(d,'2026-11-13',3);t('gap resets streak, best kept',d.streak===1&&d.bestStreak===2);
 t('streakNow expires',streakNow(d,'2026-11-14')===1&&streakNow(d,'2026-11-16')===0);
 for(let i=1;i<=70;i++)recordDaily(d,'2027-01-'+String(i%28+1).padStart(2,'0')+'x'.slice(1),1);
 const S2=blank();S2.daily={hist:{'2026-11-10':4,'bad':9},streak:2,bestStreak:7,total:9,last:'2026-11-10'};const v=validate(JSON.parse(JSON.stringify({...S2,v:1,cv:2,prog:{}}))).daily;
 t('daily save sanitized',v.hist['2026-11-10']===4&&!('bad' in v.hist)&&v.bestStreak===7&&v.total===9)}
{const S=blank();S.daily.total=1;S.daily.bestStreak=7;const ids=evaluate(S,null).map(a=>a.id);t('daily achievements',ids.includes('daily_first')&&ids.includes('daily_streak'))}
t('adaptive: needs history',adaptShow(550,[1,1,1])===550&&adaptShow(550,null)===550);
t('adaptive: winning -> faster, losing -> slower',adaptShow(550,[1,1,1,1,1])<550&&adaptShow(550,[0,0,1,0,0])>550&&adaptShow(550,[1,0,1,0])===550);
t('adaptive stays in bounds',adaptShow(250,[1,1,1,1])>=250&&adaptShow(1200,[0,0,0,0])<=1200&&adaptShow(200,[1,1,1,1])>=200);
{const a=genClassic(1,9,8,adaptShow(550,[1,1,1,1])),b=genClassic(1,9,8,550);t('adaptive never changes sequence',JSON.stringify(a.targets)===JSON.stringify(b.targets)&&a.show<b.show)}
{const S=blank(),a=genClassic(1,3,8),R=newRound(a,null,2);a.order.forEach(i=>tap(R,i));const sum=summary(R);for(let k=0;k<10;k++)record(S,a,R,sum,1000);t('recent keeps last 8',S.stats.recent.length===8&&S.stats.recent.every(x=>x===1))}
{const v=validate({v:1,cv:2,prog:{},settings:{adaptive:1,vibrate:false},runs:{reverse:12,pattern:5,spatial:-4},stats:{recent:[1,0,true,0,1,1,0,1,1,0,1]}});
 t('settings adaptive/vibrate + runs saved',v.settings.adaptive===true&&v.settings.vibrate===false&&v.runs.reverse===12&&v.runs.pattern===5&&v.runs.spatial===0&&v.stats.recent.length===8);
 t('vibrate defaults on',validate({v:1,cv:2,prog:{}}).settings.vibrate===true)}
for(const mode of['reverse','pattern','spatial'])for(let n=0;n<12;n++){const size=Math.min(6,4+Math.floor(n/4)),a=genCustom({mode,size,count:2+n,seed:1000+n,show:500,time:0}),r=newRound(a,null,0);
 a.order.forEach(i=>tap(r,i));t('ladder '+mode+' round '+n+' solvable',r.status==='won'&&a.count>=2)}
{const a=genCustom({mode:'reverse',size:4,count:4,seed:5,show:500,time:0}),r=newRound(a,null,0);t('reverse order is reversed',JSON.stringify(a.order)===JSON.stringify([...a.targets].reverse()));tap(r,a.targets[0]);t('reverse: forward tap is wrong',r.status==='failed')}

// ---- Post-review fixes ----
{ // backup is time-based and never replaced by a worse (e.g. wiped) state
 const ls=mem(),T=1e9,good=blank();good.xp=5000;good.prog['1-1']={stars:3,best:0};
 save(good,ls,T);good.xp=5001;save(good,ls,T+1);t('first backup taken',JSON.parse(ls.m.mindgrid5_bak).xp===5000);
 good.xp=5002;save(good,ls,T+2);t('no backup churn inside the interval',JSON.parse(ls.m.mindgrid5_bak).xp===5000);
 save(blank(),ls,T+BACKUP_EVERY+10);save(blank(),ls,T+2*BACKUP_EVERY+20);save(blank(),ls,T+3*BACKUP_EVERY+30);
 t('wiped state never overwrites good backup',JSON.parse(ls.m.mindgrid5_bak).xp===5002);
 ls.setItem('mindgrid5','{broken');t('corrupt save restores the good backup',load(ls).xp===5002);
 const l2=mem(),g2=blank();g2.xp=100;save(g2,l2,T);g2.xp=200;save(g2,l2,T+1);g2.xp=300;save(g2,l2,T+2*BACKUP_EVERY);g2.xp=400;save(g2,l2,T+3*BACKUP_EVERY);
 t('backup advances when progress grows',JSON.parse(l2.m.mindgrid5_bak).xp===300);
 wipeAll(l2);t('wipeAll removes save and backup',load(l2).xp===0&&l2.getItem('mindgrid5')===null&&l2.getItem('mindgrid5_bak')===null);
}
{ // localStorage that throws (blocked cookies) must not crash load/save
 Object.defineProperty(globalThis,'localStorage',{get(){throw new Error('SecurityError')},configurable:true});
 let ok=true,r1,r2;try{r1=load();r2=save(blank())}catch{ok=false}
 delete globalThis.localStorage;
 t('throwing localStorage: no crash, blank state, save reports false',ok&&r1.xp===0&&r2===false&&load(null).xp===0&&save(blank(),null)===false);
}
{ // hostile / stale saves
 const base={v:1,cv:2,prog:{}};
 t('huge resume level rejected',validate({...base,resume:{w:1,l:5e7,size:8,sel:[]}}).resume===null);
 t('resume at the cap accepted',validate({...base,resume:{w:1,l:MAX_LEVEL,size:8,sel:[1]}}).resume?.l===MAX_LEVEL);
 t('old 12x12/15x15 resume dropped (size no longer playable)',validate({...base,resume:{w:1,l:5,size:15,sel:[]}}).resume===null&&validate({...base,resume:{w:1,l:5,size:12,sel:[]}}).resume===null);
 t('resume selection longer than the level rejected',validate({...base,resume:{w:1,l:3,size:8,sel:[1,2,3,4]}}).resume===null);
 t('resume tile index outside the grid rejected',validate({...base,resume:{w:1,l:3,size:6,sel:[99]}}).resume===null);
 const p=validate({...base,prog:{'1-0':{stars:1},'1-99999':{stars:1},'1-9999':{stars:1},'1-5':{stars:2}}}).prog;
 t('level keys bounded',!('1-0' in p)&&!('1-99999' in p)&&('1-9999' in p)&&('1-5' in p));
 t('lastW sanitized',validate({...base,lastW:9}).lastW===5&&validate(base).lastW===0&&validate({...base,lastW:3}).lastW===3);
 t('grid options are only phone-friendly sizes',JSON.stringify(GRIDS)==='[6,8,10]');
}
{ // worlds are no longer cosmetic: faster display each world, sequence untouched
 const base=550,sh=[1,2,3,4,5].map(w=>worldShow(w,base));
 t('each world is faster than the previous',sh.every((x,i)=>i===0||x<sh[i-1])&&sh[0]===550);
 t('world show never below 200ms',[1,2,3,4,5].every(w=>worldShow(w,300)>=200)&&worldShow(5,200)===200);
 t('world descriptions unique',new Set(W.map(w=>w[4])).size===5&&W.every(w=>w.length===9));
 t('world speed does not change the sequence',JSON.stringify(genClassic(3,30,8,worldShow(3,550)).targets)===JSON.stringify(genClassic(3,30,8,550).targets));
}
console.log(`levels generated: ${sets}\npassed: ${pass}\nfailed: ${fail}`);process.exit(fail?1:0);
