// Web Audio: contexts must be resumed inside a user gesture (iOS), so unlock() runs on the first touch/click.
export function createAudio(get){
 let ac=null,mus=null;const N=[261.6,293.7,329.6,392,440,523.3];
 const ctx=()=>{ac=ac||new(window.AudioContext||window.webkitAudioContext)();return ac};
 function beep(f,d=.09){const s=get();if(!s.sound)return;try{const a=ctx();if(a.state==='suspended')a.resume();const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.07*s.sfx/100;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.stop(a.currentTime+d)}catch{}}
 function music(){clearInterval(mus);mus=null;if(!get().music)return;try{const a=ctx();a.resume();
  const note=()=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.frequency.value=N[Math.floor(Math.random()*6)]/(Math.random()<.3?2:1);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*get().mus/100,t+.6);g.gain.linearRampToValueAtTime(0,t+2.2);o.start(t);o.stop(t+2.3)};note();mus=setInterval(note,1700)}catch{}}
 function unlock(){try{const a=ctx();if(a.state!=='running')a.resume()}catch{}if(get().music&&!mus)music()}
 function halt(){clearInterval(mus);mus=null;try{if(ac&&ac.state==='running')ac.suspend()}catch{}}
 function wake(){try{if(ac&&ac.state==='suspended')ac.resume()}catch{}if(get().music&&!mus)music()}
 return {beep,music,unlock,halt,wake};
}
