import {DIFFS,clampN} from '../engine/difficulty.js';
import {GRIDS} from '../engine/sequence.js';
const K='mindgrid5',B='mindgrid5_bak',BT='mindgrid5_bakt',V4='mind_grid_v4_save';
export const MAX_LEVEL=9999,BACKUP_EVERY=10*60*1000;
// localStorage itself can throw on access (blocked cookies, some iframes). Never let that stop the app.
export const lsGet=()=>{try{return localStorage}catch{return null}};
export const blank=()=>({v:1,cv:2,xp:0,coins:0,prog:{},games:0,wins:0,settings:{sound:true,music:false,sfx:80,mus:40,diff:'normal',theme:'dark',fx:'full',reduce:false,grid:8,autoNext:false,autoResume:false,cErr:2,cShow:550,adaptive:false,vibrate:true},lastW:0,practice:{mode:'pattern',size:4,count:4,speed:'normal',time:0,palette:2},stats:{taps:0,hits:0,time:0,winTime:0,scoreSum:0,bestScore:0,streak:0,bestStreak:0,perfect:0,bestPerfect:0,modes:{},best:{},recent:[]},daily:{hist:{},streak:0,bestStreak:0,total:0,last:''},ach:{},runs:{speed:0,perfect:0,reverse:0,pattern:0,spatial:0},grow:{best:0,size:8,run:null},profile:{name:'بازیکن',avatar:'🧙'},resume:null});
export const AV=['🧙','🦉','🦊','🐉','🧚','🦄','🐺','🔮'];
const n=x=>Math.max(0,Math.floor(+x)||0);
const nearGrid=x=>{x=n(x)||8;return GRIDS.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a)};
const score=o=>n(o?.xp)+1000*Object.keys(o?.prog||{}).length;
export function validate(o){
 if(!o||o.v!==1||typeof o.prog!=='object'||!o.prog)return null;
 const b=blank();b.xp=n(o.xp);b.coins=n(o.coins);b.games=n(o.games);b.wins=n(o.wins);
 for(const[k,p]of Object.entries(o.prog))if(/^[1-5]-[1-9]\d{0,3}$/.test(k)&&p)b.prog[k]={stars:Math.min(3,Math.max(1,n(p.stars)||1)),best:n(p.best)};
 const st=o.settings||{},pr=o.practice||{},pick=(v,a,d)=>a.includes(v)?v:d,rg=(v,d)=>v==null?d:Math.min(100,n(v));
 b.settings={sound:st.sound!==false,music:!!st.music,sfx:rg(st.sfx,80),mus:rg(st.mus,40),diff:pick(st.diff,DIFFS,'normal'),theme:pick(st.theme,['dark','light'],'dark'),fx:pick(st.fx,['full','low'],'full'),reduce:!!st.reduce,grid:nearGrid(st.grid),autoNext:!!st.autoNext,autoResume:!!st.autoResume,cErr:clampN(st.cErr,0,5,2),cShow:clampN(st.cShow,200,1500,550),adaptive:!!st.adaptive,vibrate:st.vibrate!==false};
 b.practice={mode:pick(pr.mode,['pattern','sequence','reverse','color','moving','hidden','spatial'],'pattern'),size:Math.min(7,Math.max(3,n(pr.size)||4)),count:Math.min(40,Math.max(2,n(pr.count)||4)),speed:pick(pr.speed,['slow','normal','fast'],'normal'),time:pick(n(pr.time),[0,10,20,30,60],0),palette:Math.min(4,Math.max(2,n(pr.palette)||2))};
 const ss=o.stats||{},MD=['pattern','sequence','reverse','color','moving','hidden','spatial'];
 for(const k of['taps','hits','time','winTime','scoreSum','bestScore','streak','bestStreak','perfect','bestPerfect'])b.stats[k]=n(ss[k]);
 b.stats.recent=Array.isArray(ss.recent)?ss.recent.slice(-8).map(x=>x?1:0):[];
 for(const m of MD){if(ss.modes?.[m])b.stats.modes[m]={g:n(ss.modes[m].g),w:Math.min(n(ss.modes[m].w),n(ss.modes[m].g))};if(ss.best?.[m])b.stats.best[m]={score:n(ss.best[m].score),ms:n(ss.best[m].ms)}}
 if(o.ach&&typeof o.ach==='object')for(const[k,v]of Object.entries(o.ach).slice(0,50))if(/^[a-z_]{1,30}$/.test(k))b.ach[k]=n(v);
 const pf=o.profile||{};b.profile={name:String(pf.name||'بازیکن').replace(/[<>&"'`]/g,'').trim().slice(0,16)||'بازیکن',avatar:AV.includes(pf.avatar)?pf.avatar:'🧙'};
 const gr=o.grow||{},gz=x=>Math.min(8,Math.max(4,n(x)||8));
 b.grow={best:n(gr.best),size:gz(gr.size),run:gr.run&&n(gr.run.len)>=1?{seed:n(gr.run.seed),len:Math.min(200,n(gr.run.len)),errors:n(gr.run.errors),size:gz(gr.run.size)}:null};
 b.runs={speed:n(o.runs?.speed),perfect:Math.min(10,n(o.runs?.perfect)),reverse:n(o.runs?.reverse),pattern:n(o.runs?.pattern),spatial:n(o.runs?.spatial)};
 const dl=o.daily||{},DK=/^\d{4}-\d{2}-\d{2}$/;b.daily={hist:{},streak:n(dl.streak),bestStreak:n(dl.bestStreak),total:n(dl.total),last:DK.test(dl.last)?dl.last:''};
 if(dl.hist&&typeof dl.hist==='object')for(const[k,v]of Object.entries(dl.hist).slice(-60))if(DK.test(k))b.daily.hist[k]=Math.min(500,n(v));
 const r=o.resume;
 if(r&&n(r.w)>=1&&n(r.w)<=5&&n(r.l)>=1&&n(r.l)<=MAX_LEVEL&&GRIDS.includes(n(r.size)||8)&&Array.isArray(r.sel)&&r.sel.length<=n(r.l)&&r.sel.every(x=>n(x)<(n(r.size)||8)**2))b.resume={w:n(r.w),l:n(r.l),size:n(r.size)||8,sel:r.sel.map(n),errors:n(r.errors),left:n(r.left)};
 b.lastW=Math.min(5,n(o.lastW));
 if(o.cv!==2){b.prog={};b.resume=null} // V5 campaign levels had other rules; XP, coins and stats are kept
 return b;
}
export function migrateV4(o){
 if(!o||typeof o!=='object')return null;const b=blank();b.xp=n(o.xp);b.coins=n(o.coins);b.games=n(o.games);
 for(const k of Object.keys(o.completed||{}))if(o.completed[k]&&/^[1-5]-[1-9]\d{0,3}$/.test(k))b.prog[k]={stars:Math.min(3,n(o.stars?.[k])||1),best:0};
 b.wins=Object.keys(b.prog).length;return b;
}
const read=(ls,k)=>{try{return JSON.parse(ls.getItem(k))}catch{return null}};
export function load(ls=lsGet()){
 if(!ls)return blank();
 return validate(read(ls,K))||validate(read(ls,B))||migrateV4(read(ls,V4))||blank();
}
// Backup rules: taken at most every 10 minutes, and only from a state that has at least as much progress as the current backup.
// So a wiped/blank save (or a bug) can never overwrite the last good backup, and the backup is not just "one tap behind".
export function save(s,ls=lsGet(),now=Date.now()){
 if(!ls)return false;
 try{
  const cur=ls.getItem(K);
  if(cur){let o=null;try{o=validate(JSON.parse(cur))}catch{}
   if(o){const last=+ls.getItem(BT)||0,bv=validate(read(ls,B));
    if(!bv||((now-last>=BACKUP_EVERY||now<last)&&score(o)>=score(bv))){ls.setItem(B,cur);ls.setItem(BT,String(now))}}}
  ls.setItem(K,JSON.stringify(s));return true;
 }catch{return false}
}
// Used by "erase progress": removes the save AND its backup, so the player's choice is respected.
export function wipeAll(ls=lsGet()){try{if(ls){ls.removeItem(K);ls.removeItem(B);ls.removeItem(BT)}}catch{}}
export const exportSave=s=>JSON.stringify(s,null,1);
export const importSave=t=>{try{return validate(JSON.parse(t))}catch{return null}};
