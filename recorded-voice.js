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
 let active=false, generation=0;
 function cancel(){generation++;active=false;player.pause();try{player.currentTime=0;}catch{}window.speechSynthesis?.cancel();}
 function play(s){const file=files.get(normalize(s));if(!file)return false;cancel();const token=generation;player.src=file;active=true;
  player.onended=()=>{if(token===generation)active=false;};
  player.onerror=()=>{if(token===generation){active=false;toast('Recorded voice could not load. Follow the written prompts. Check your connection and tap Audio check again.');}};
  player.play().catch(()=>{if(token===generation){active=false;toast('Tap Audio check to enable the recorded instructor voice. Check your phone’s media volume.');}});
  return true;
 }
 return {play,cancel,get speaking(){return active;},files,prompts};
})();
