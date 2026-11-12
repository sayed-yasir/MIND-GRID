export const rng=s=>{let a=s>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
export const hash=(...p)=>{let h=2166136261;for(const c of p.join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
