import {hash} from '../utils/rng.js';
// Daily Challenge: same growing sequence for everyone on a given local date. 3 rounds = completed.
export const dailySpec={size:6,errors:1,goal:3};
export const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const dailySeed=key=>hash('daily',key);
const dayNum=k=>{const[y,m,d]=k.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5)};
// Rewards only for improving today's best (no farming by replaying).
export const dailyReward=(prev,best)=>best>prev?{xp:(best-prev)*3,coins:Math.floor(best/5)-Math.floor(prev/5)}:{xp:0,coins:0};
export const streakNow=(d,key)=>d.last&&dayNum(key)-dayNum(d.last)<=1?d.streak:0;
export function recordDaily(d,key,best){
 const prev=d.hist[key]||0,rw=dailyReward(prev,best);
 if(best>prev)d.hist[key]=best;
 if(prev<dailySpec.goal&&best>=dailySpec.goal){
  d.total++;d.streak=d.last&&dayNum(key)-dayNum(d.last)===1?d.streak+1:(d.last===key?d.streak:1);d.last=key;d.bestStreak=Math.max(d.bestStreak,d.streak);
 }
 const ks=Object.keys(d.hist).sort();for(const k of ks.slice(0,Math.max(0,ks.length-60)))delete d.hist[k];
 return rw;
}
