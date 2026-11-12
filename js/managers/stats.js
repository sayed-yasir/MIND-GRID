// Level formula: level = floor(sqrt(xp/50))+1  (level n starts at 50*(n-1)^2 XP)
const base=n=>50*(n-1)**2;
export function levelInfo(xp){const level=Math.floor(Math.sqrt(xp/50))+1,a=base(level),b=base(level+1);return{level,into:xp-a,need:b-a}}
const mx=(a,b)=>Math.max(a||0,b||0);
// Called once per finished campaign round (never for practice, never for unfinished rounds).
export function record(S,spec,R,sum,ms){
 const st=S.stats,m=st.modes[spec.mode]||(st.modes[spec.mode]={g:0,w:0}),t=Math.min(ms,600000);
 st.recent=[...(st.recent||[]),sum.won?1:0].slice(-8);st.taps+=R.taps||0;st.hits+=R.hits||0;st.time+=t;m.g++;
 if(sum.won){m.w++;st.winTime+=t;st.scoreSum+=sum.score;st.bestScore=mx(st.bestScore,sum.score);st.streak++;
  if(R.errors===0){st.perfect++;st.bestPerfect=mx(st.bestPerfect,st.perfect)}else st.perfect=0;
  const b=st.best[spec.mode]||(st.best[spec.mode]={score:0,ms:0});b.score=mx(b.score,sum.score);if(!b.ms||t<b.ms)b.ms=t;
 }else{st.streak=0;st.perfect=0}
 st.bestStreak=mx(st.bestStreak,st.streak);
}
export function derive(S){
 const st=S.stats,cleared=w=>Object.keys(S.prog).filter(k=>k.startsWith(w+'-')).length;
 let bestMode=null,br=-1;for(const[k,m]of Object.entries(st.modes))if(m.g>=3&&m.w/m.g>br){br=m.w/m.g;bestMode=k}
 return{accuracy:st.taps?Math.round(st.hits/st.taps*100):0,avgScore:S.wins?Math.round(st.scoreSum/S.wins):0,
  avgTime:S.wins?st.winTime/S.wins:0,bestMode,cleared:[1,2,3,4,5].map(cleared),
  stars:Object.values(S.prog).reduce((a,p)=>a+p.stars,0)};
}
// World unlock: the next world opens after this many cleared levels in the previous world (levels continue forever after that).
export const NEED=[10,12,15,18];
export const worldOpen=(S,w)=>w===1||Object.keys(S.prog).filter(k=>k.startsWith((w-1)+'-')).length>=NEED[w-2];
