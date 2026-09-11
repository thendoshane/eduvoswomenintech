let audioContext=null

export function primeAlertAudio(){
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext
    if(!Ctx)return false
    if(!audioContext)audioContext=new Ctx()
    if(audioContext.state==='suspended')audioContext.resume().catch(()=>{})
    return true
  }catch{return false}
}

export function playSoftChime(){
  try{
    if(!primeAlertAudio() || !audioContext)return
    const now=audioContext.currentTime
    const gain=audioContext.createGain()
    gain.gain.setValueAtTime(0.0001,now)
    gain.gain.exponentialRampToValueAtTime(0.055,now+0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001,now+0.42)
    gain.connect(audioContext.destination)

    const first=audioContext.createOscillator()
    const second=audioContext.createOscillator()
    first.type='sine'; second.type='sine'
    first.frequency.setValueAtTime(659.25,now)
    second.frequency.setValueAtTime(987.77,now+0.09)
    first.connect(gain); second.connect(gain)
    first.start(now); first.stop(now+0.22)
    second.start(now+0.09); second.stop(now+0.4)
  }catch{/* sound is optional */}
}
