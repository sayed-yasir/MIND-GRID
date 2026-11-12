const modeW=m=>S=>(S.stats.modes[m]?.w||0)>=10,lv=S=>Object.keys(S.prog);
export const ACH=[
 {id:'first_memory',t:'اولین خاطره',d:'اولین مرحله را کامل کن.',coin:10,c:S=>S.wins>=1},
 {id:'perfect_focus',t:'تمرکز کامل',d:'یک مرحله را بدون اشتباه (۳ ستاره) کامل کن.',coin:10,c:S=>Object.values(S.prog).some(p=>p.stars===3)},
 {id:'speed_master',t:'استاد سرعت',d:'در چالش سرعت به امتیاز ۱۰ برس.',coin:20,c:S=>S.runs.speed>=10},
 {id:'pattern_expert',t:'خبره‌ی الگو',d:'در مسیر بی‌نقص ۵ الگوی پشت‌سرهم را درست بزن.',coin:20,c:S=>S.runs.perfect>=5},
 {id:'sequence_master',t:'استاد ترتیب',d:'۱۰ مرحله‌ی ترتیب را ببر.',coin:20,c:modeW('sequence')},
 {id:'world_explorer',t:'کاوشگر جهان‌ها',d:'در ۳ جهان مختلف مرحله کامل کن.',coin:25,c:S=>new Set(lv(S).map(k=>k.split('-')[0])).size>=3},
 {id:'perfect_run',t:'مسیر بی‌نقص',d:'۵ مرحله‌ی پشت‌سرهم را بدون اشتباه ببر.',coin:30,c:S=>S.stats.bestPerfect>=5},
 {id:'guardian_breaker',t:'گشاینده‌ی نگهبان',d:'یک نگهبان را شکست بده.',coin:30,c:S=>lv(S).some(k=>+k.split('-')[1]%10===0)},
 {id:'endless_survivor',t:'بازمانده‌ی بی‌پایان',d:'در حالت رشدی به دور ۱۵ برس.',coin:40,c:S=>(S.grow?.best||0)>=15},
 {id:'memory_legend',t:'افسانه‌ی حافظه',d:'۵۰ مرحله را کامل کن.',coin:100,c:S=>lv(S).length>=50},
 {id:'daily_first',t:'چالش روزانه',d:'یک چالش روزانه را کامل کن (۳ دور).',coin:15,c:S=>S.daily.total>=1},
 {id:'daily_streak',t:'هفته‌ی روزانه',d:'۷ روز پشت‌سرهم چالش روزانه را کامل کن.',coin:40,c:S=>S.daily.bestStreak>=7}];
// Each achievement unlocks once (S.ach[id] guard) and pays its coins once.
export function evaluate(S,x){const out=[];for(const a of ACH)if(!S.ach[a.id]&&a.c(S,x)){S.ach[a.id]=Date.now();S.coins+=a.coin;out.push(a)}return out}
