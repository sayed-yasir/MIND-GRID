// [name, icon, colorA, colorB, description, show-time factor, pitch offset (Hz), lit tile color 1, lit tile color 2]
export const W=[['جنگل فراموش‌شده','🌳','#244b58','#31513f','شروع ملایم؛ خانه‌ها آرام و با سرعت عادی روشن می‌شوند.',1,0,'#d7ffb0','#7fd6a0'],
 ['غارهای پژواک','💎','#39335f','#563b70','پژواک‌ها کمی سریع‌ترند (۱۰٪ کوتاه‌تر).',.9,60,'#b8e6ff','#a08af0'],
 ['شهر ساعت‌گرد','🏰','#76502f','#5b3b58','ریتم ساعت؛ نمایش ۲۰٪ سریع‌تر.',.8,120,'#ffd9a0','#e08aa8'],
 ['آرشیو یخ‌زده','❄️','#31536e','#3e477b','یخ زودگذر؛ خانه‌ها ۳۰٪ زودتر خاموش می‌شوند.',.7,180,'#e0f4ff','#8fb8ff'],
 ['هسته ذهن','🌌','#49366d','#783d75','سریع‌ترین جهان؛ نمایش ۴۰٪ سریع‌تر.',.6,240,'#ffe0ff','#c77dff']];
// Per-world presentation speed. Only the display time changes, never the sequence. Floor 200 ms (same as the custom-difficulty minimum).
export const worldShow=(w,base)=>Math.max(200,Math.round(base*(W[w-1]?W[w-1][5]:1)));
