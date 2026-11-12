import {rng} from '../utils/rng.js';
export const MODE_FA={pattern:'الگو',sequence:'ترتیب',reverse:'معکوس',color:'رنگ',moving:'متحرک',hidden:'پنهان',spatial:'مکانی'};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,Math.floor(+x)||a));
function build(r,p){
 const size=p.size,cells=size*size,idx=[...Array(cells).keys()],extra={};
 for(let i=cells-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
 let targets=idx.slice(0,p.count);
 if(p.mode==='spatial'){ // player must tap the left-right mirror image of the shown pattern
  const mir=c=>Math.floor(c/size)*size+(size-1-c%size);
  for(let k=0;k+p.count<=cells;k++){const sh=idx.slice(k,k+p.count),m=sh.map(mir);if(m.some(c=>!sh.includes(c))||k+p.count===cells){extra.shown=sh;targets=m;break}}
 }
 if(p.mode==='moving'){ // shown cells step to a neighbour each frame; player taps the final positions
  const frames=[targets];
  for(let m=0;m<(p.moves||2);m++){const next=new Set(),arr=[];
   for(const t of frames[frames.length-1]){const a=Math.floor(t/size),b=t%size;
    const nb=[[a-1,b],[a+1,b],[a,b-1],[a,b+1]].filter(([x,y])=>x>=0&&x<size&&y>=0&&y<size).map(([x,y])=>x*size+y).filter(c=>!next.has(c));
    const c=nb.length?nb[Math.floor(r()*nb.length)]:idx.find(c=>!next.has(c));next.add(c);arr.push(c)}
   frames.push(arr)}
  targets=frames[frames.length-1];extra.frames=frames;
 }
 const palette=p.mode==='color'?p.palette:0,colors=targets.map(()=>palette?1+Math.floor(r()*palette):0);
 if(palette>1&&colors.every(c=>c===colors[0]))colors[1]=colors[0]%palette+1;
 const target=Array(cells).fill(0);targets.forEach((t,i)=>target[t]=colors[i]);
 return {world:0,level:0,d:0,boss:false,practice:false,...p,...extra,cells,targets,palette,target,order:p.mode==='reverse'?[...targets].reverse():targets};
}
// Practice: fully custom, clamped so the round is always solvable (count <= 55% of cells).
export function genCustom(o){
 const size=clamp(o.size,3,7),cap=Math.floor(size*size*.55),mode=MODE_FA[o.mode]?o.mode:'pattern';
 return build(rng(o.seed>>>0),{practice:true,mode,size,count:clamp(o.count,2,cap),moves:2,palette:clamp(o.palette,2,4),show:clamp(o.show,300,1500),time:clamp(o.time||0,0,120)===0?0:clamp(o.time,5,120)});
}
export {growSeq} from './sequence.js';
