'use strict';
// Direct playback of the instructor's own recordings; no generated voice.
const LifeSaverVoice = (() => {
 const normalize = s => s.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const prompts = [
 ['01','LifeSaver audio check. Call 911 and send someone for an AED. Start compressions promptly.'],
 ['02','Call 911 on speakerphone. Send someone for an AED. If the adult is unresponsive and not breathing normally, start CPR now. Use a firm, flat surface without delaying compressions. Put your hands on the lower half of the breastbone. Push hard, at least two inches, avoiding more than two point four inches. Follow the beat and let the chest return fully.'],
 ['03','Training only. Put the phone beside the manikin and begin CPR now. Practice adult hands-only CPR with continuous chest compressions. Follow dispatcher and AED instructions. The beat guides compression rate. Camera feedback is experimental.'],
 ['04','If another rescuer is available, switch compressors with minimal interruption.'],
 ['05','Speed up toward one hundred to one hundred twenty per minute.'],
 ['06','Slow down toward one hundred to one hundred twenty per minute.'],
 ['07','Your estimated pace is on target. Keep going. Allow full chest recoil.'],
 ['08','The practice interval is complete. View your summary or continue another two minutes.'],
 ['09','A helper brings an AED. Keep compressing while the helper turns it on and applies pads.'],
 ['10','Apply pads to the exposed, dry chest on the manikin. If a second rescuer is available, continue CPR while they apply pads.'],
 ['11','Follow the AED instructions. Make sure everyone is clear for analysis.'],
 ['12','Everyone clear. Analyzing. Do not touch the manikin.'],
 ['13','Shock advised. Make sure everyone is clear.'],
 ['14','Everyone clear. Press the shock button.'],
 ['15','Shock delivered. Resume CPR now, starting with compressions.'],
 ['16','No shock advised. Resume CPR now, starting with compressions.'],
 ['17','Continue until ready, then follow AED instructions. Everyone clear for analysis.'],
 ['18','Follow AED instructions.'],
 ['19','Resume CPR. If an AED is present, follow the AED’s instructions.'],
 ['20','Speed up toward one hundred to one hundred twenty compressions per minute.'],
 ['21','Slow down toward one hundred to one hundred twenty compressions per minute.'],
 ['22','Your compressions have slowed. If someone else is available, switch compressors and immediately return to CPR.'],
 ['23','Switch compressors if available and immediately return to CPR. Once an AED becomes available, use it and follow its instructions.'],
 ['24','Push hard and let the chest return fully. Once an AED becomes available, use it and follow its instructions.'],
 ['25','Your compression rate is good. Keep going—you are helping save this person’s life.'],
 ['phone','Put your phone flat on the floor at the manikin’s left shoulder, screen facing up with the camera end closest to the shoulder.']
 ];
 const files = new Map(prompts.map(([id,s])=>[normalize(s),`instructor-voice-${id}.mp3`]));
 const player = new Audio(); player.preload='auto'; player.volume=1;
 player.setAttribute('playsinline','');
 let active=false, generation=0, watchdog=0;
 function status(message){const el=document.getElementById('voiceStatus');if(el)el.textContent=message;}
 function cancel(){generation++;active=false;clearTimeout(watchdog);player.onended=player.onerror=player.onplaying=null;player.pause();try{player.currentTime=0;}catch{}window.speechSynthesis?.cancel();}
 function fallback(s,token){
  if(token!==generation)return;
  clearTimeout(watchdog);player.onended=player.onerror=player.onplaying=null;player.pause();
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){active=false;status('Audio unavailable. Tap Test voice again and check media volume.');return;}
  const u=new SpeechSynthesisUtterance(s);u.lang='en-US';u.rate=.98;u.volume=1;
  const voices=speechSynthesis.getVoices();
  u.voice=voices.find(v=>v.lang==='en-US'&&/Samantha|Google US English|Daniel/i.test(v.name))||voices.find(v=>v.lang.startsWith('en'))||null;
  u.onstart=()=>{if(token===generation)status('Device voice playing · instructor recording unavailable');};
  u.onend=()=>{if(token===generation)active=false;};
  u.onerror=()=>{if(token===generation){active=false;status('Tap Test voice to enable sound. Check your phone’s media volume.');}};
  try{speechSynthesis.speak(u);}catch{active=false;status('Tap Test voice again to enable sound.');}
 }
 function play(s){
  cancel();const token=generation;active=true;
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
  const file=files.get(normalize(s));
  if(!file){fallback(s,token);return true;}
  player.src=new URL(file,document.baseURI).href;
  let started=false, failed=false;
  const fail=()=>{if(!failed&&token===generation){failed=true;fallback(s,token);}};
  player.onplaying=()=>{if(token===generation){started=true;clearTimeout(watchdog);status('Instructor recording playing');}};
  player.onended=()=>{if(token===generation){active=false;clearTimeout(watchdog);status('Instructor recording finished · tap Test voice to replay');}};
  player.onerror=fail;
  watchdog=setTimeout(()=>{if(!started)fail();},4000);
  try{const result=player.play();result?.catch(fail);}catch{fail();}
  return true;
 }
 return {play,cancel,get speaking(){return active;},files,prompts};
})();
