// Difficulty manager: mistakes allowed + per-tile illumination time. Never changes sequence length.
export const PRESETS={easy:{err:3,show:700},normal:{err:2,show:550},hard:{err:1,show:400},expert:{err:0,show:300}};
export const DIFFS=['easy','normal','hard','expert','custom'];
export const clampN=(x,a,b,d)=>{x=Math.floor(+x);return Number.isFinite(x)?Math.min(b,Math.max(a,x)):d};
export function adaptShow(base,recent){ // adaptive: only presentation speed, never the sequence
 if(!recent||recent.length<4)return base;const rate=recent.reduce((a,b)=>a+b,0)/recent.length,f=rate>=.8?.85:rate<=.4?1.2:1;
 return Math.round(Math.min(1200,Math.max(Math.min(base,250),base*f)));
}
export const rules=st=>st.diff==='custom'?{err:clampN(st.cErr,0,5,2),show:clampN(st.cShow,200,1500,550)}:(PRESETS[st.diff]||PRESETS.normal);
