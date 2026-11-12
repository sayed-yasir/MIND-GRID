export const MAX_ERR=2;
const FREE=['pattern','moving','spatial','hidden'];
export const newRound=(spec,saved,max=MAX_ERR)=>({spec,max,taps:0,hits:0,miss:[],errors:saved?.errors||0,status:'input',
 sel:saved?.sel?.length?[...saved.sel]:(spec.mode==='color'?Array(spec.cells).fill(0):[])});
const verdict=r=>{if(r.errors>r.max)r.status='failed';return r};
export function tap(r,i){
 if(r.status!=='input'||r.spec.mode==='color')return r;
 const s=r.spec;
 if(s.mode==='hidden'&&(r.miss.includes(i)||r.sel.includes(i)))return r; // revealed cells are not re-tapped
 const ok=FREE.includes(s.mode)?s.targets.includes(i)&&!r.sel.includes(i):s.order[r.sel.length]===i;
 r.taps++;
 if(ok){r.hits++;r.sel.push(i);if(r.sel.length===s.count)r.status='won'}else{r.errors++;if(s.mode==='hidden')r.miss.push(i)}
 return verdict(r);
}
export function cycle(r,i){if(r.status==='input'&&r.spec.mode==='color')r.sel[i]=(r.sel[i]+1)%(r.spec.palette+1);return r}
export function check(r){
 if(r.status!=='input'||r.spec.mode!=='color')return r;
 r.taps++;if(r.sel.every((v,i)=>v===r.spec.target[i])){r.hits++;r.status='won'}else r.errors++;
 return verdict(r);
}
// Score: count*10*(1+d/10) - 5 per error. XP and coins are paid only on first clear (see app.js).
export function summary(r){
 const s=r.spec,won=r.status==='won',stars=!won?0:r.errors===0?3:r.errors===1?2:1;
 return {won,stars,score:won?Math.max(10,Math.round(s.count*10*(1+s.d/10))-5*r.errors):0,
  xp:won?20+s.count*3+(stars===3?10:0)+(s.boss?30:0):0,coins:won?(s.boss?30:stars):0};
}
