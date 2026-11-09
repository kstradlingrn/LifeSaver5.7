'use strict';
// Direct playback of selected instructor recordings.
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
 const files = new Map(prompts.map(([id,s])=>[normalize(s),`instructor-voice-${id}.mp3?v=55`]));
 const player=document.getElementById('coachAudio');
 const buffers=new WeakMap();
 let active=false,generation=0,source=null,utterance=null;
 function status(s){const e=document.getElementById('voiceStatus');if(e)e.textContent=s;}
 function cancel(){
  generation++;active=false;
  if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}
  player.pause();player.onended=player.onerror=null;try{player.currentTime=0;}catch{}
  window.speechSynthesis?.cancel();utterance=null;
 }
 function bufferFor(context,file){
  let map=buffers.get(context);if(!map){map=new Map();buffers.set(context,map);}
  if(!map.has(file)){
   const pending=fetch(new URL(file,document.baseURI)).then(r=>{if(!r.ok)throw Error('Audio file unavailable');return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes));
   map.set(file,pending);pending.catch(()=>{if(map.get(file)===pending)map.delete(file);});
  }
  return map.get(file);
 }
 function deviceVoice(s,token){
  if(!window.speechSynthesis){active=false;status('No recording for this prompt. Follow the displayed text.');return false;}
  utterance=new SpeechSynthesisUtterance(s);utterance.lang='en-US';utterance.rate=.98;utterance.volume=1;
  utterance.onend=()=>{if(token===generation)active=false;};
  utterance.onerror=()=>{if(token===generation){active=false;status('Device voice unavailable for this prompt. Follow the displayed text.');}};
  speechSynthesis.speak(utterance);return true;
 }
 function play(s,context){
  cancel();const token=generation;const file=files.get(normalize(s));active=true;
  if(!file)return deviceVoice(s,token);
  player.src=new URL(file,document.baseURI).href;player.load();
  if(context&&context.state!=='closed'){
   const resumed=context.resume();
   status('Loading spoken guidance…');
   Promise.all([resumed,bufferFor(context,file)]).then(([,buffer])=>{
    if(token!==generation)return;
    if(context.state!=='running')throw Error('Audio channel paused');
    const node=context.createBufferSource();node.buffer=buffer;node.connect(context.destination);source=node;
    node.onended=()=>{node.disconnect();if(token===generation){source=null;active=false;status('Spoken guidance finished · tap Test voice to replay');}};
    node.start();status('Recorded guidance playing · same audio channel as metronome');
   }).catch(()=>{if(token===generation){active=false;status('Tap Play on the voice player below to hear guidance.');}});
  }else{
   player.onended=()=>{if(token===generation){active=false;status('Spoken guidance finished');}};
   player.onerror=()=>{if(token===generation){active=false;status('Voice file could not load. Retry with a connection.');}};
   try{player.play().then(()=>{if(token===generation)status('Recorded guidance playing');}).catch(()=>{if(token===generation){active=false;status('Tap Play on the voice player below.');}});}catch{active=false;}
  }
  return true;
 }
 player.addEventListener('play',()=>{
  generation++;if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}
  window.speechSynthesis?.cancel();active=true;status('Voice player playing');
 });
 player.addEventListener('ended',()=>{active=false;});
 return {play,cancel,get speaking(){return active;},files,prompts};
})();
