import {rng,hash} from '../utils/rng.js';
// Playable sizes. 12 and 15 were removed: on a 390px phone their tiles are only 20-27px, too small to tap reliably.
export const GRIDS=[6,8,10],DEFAULT_GRID=8;
// Growing sequence (Simon style): prefix-stable, so level n+1 replays level n plus exactly one new cell. No cell repeats twice in a row.
export function growSeq(seed,size,n){const r=rng(seed>>>0),cells=size*size,s=[];let p=-1;while(s.length<n){const c=Math.floor(r()*cells);if(c!==p){s.push(c);p=c}}return s}
export const classicSeed=(world,size)=>hash('mg6',world,size);
// Classic Sequence: sequence length === level. Grid size is independent of level and length.
export function genClassic(world,level,size=DEFAULT_GRID,show=550){
 level=Math.max(1,Math.floor(+level)||1);size=Math.min(15,Math.max(3,Math.floor(+size)||DEFAULT_GRID));
 const cells=size*size,seq=growSeq(classicSeed(world,size),size,level);
 return {world,level,d:level-1,boss:level%10===0,practice:false,mode:'sequence',size,cells,count:level,targets:seq,order:seq,palette:0,target:Array(cells).fill(0),show,time:0,moves:2,classic:true};
}
