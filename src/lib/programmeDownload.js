import { formatDate, formatTime } from './utils'

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

export function downloadProgramme(event,sessions,speakerMap={}){
  const rows=sessions.map(s=>{
    const people=(s.speakerIds||[]).map(id=>speakerMap[id]?.name).filter(Boolean).join(', ')
    return `<article class="session"><div class="time">${esc(formatTime(s.startAt))}<span>${esc(formatTime(s.endAt))}</span></div><div><div class="type">${esc(s.type||'Session')}</div><h2>${esc(s.title)}</h2>${people?`<p class="speaker">${esc(people)}</p>`:''}${s.room?`<p class="room">${esc(s.room)}</p>`:''}${s.description?`<p class="desc">${esc(s.description)}</p>`:''}</div></article>`
  }).join('')
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(event?.name||'Women in Tech Summit')} Programme</title><style>
  *{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#173a67;background:#f7f5f0}header{background:#173a67;color:white;padding:42px 48px;position:relative;overflow:hidden}header:after{content:'';position:absolute;right:-60px;top:-90px;width:260px;height:260px;border-radius:50%;background:#2c59c7}header:before{content:'';position:absolute;right:100px;bottom:-110px;width:220px;height:220px;border-radius:50%;background:#d5b27f}.kicker{letter-spacing:.14em;text-transform:uppercase;font-size:11px;font-weight:800;position:relative;z-index:1}h1{font-family:Georgia,serif;font-size:48px;line-height:.95;margin:12px 0;position:relative;z-index:1}.meta{font-size:12px;position:relative;z-index:1}.wrap{padding:34px 48px}.session{display:grid;grid-template-columns:110px 1fr;gap:24px;padding:22px 0;border-bottom:1px solid #cbd3df}.time{font-size:24px;font-weight:800}.time span{display:block;font-size:11px;color:#66758d;margin-top:4px}.type{font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#2c59c7}h2{font-family:Georgia,serif;font-size:25px;margin:4px 0 8px}.speaker,.room,.desc{margin:4px 0;font-size:11px;line-height:1.45}.speaker{font-weight:700}.desc{color:#536175}.footer{padding:24px 48px 40px;font-size:10px;color:#66758d}@media print{body{background:white}header{-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrap{padding-top:20px}.session{break-inside:avoid}}@page{size:A4;margin:0}
  </style></head><body><header><div class="kicker">${esc(event?.organiser||'Faculty of Information Technology')} presents</div><h1>${esc(event?.name||'Women in Tech Summit')}</h1><div class="meta">${esc(event?.date?formatDate(event.date):'')} ${event?.venue?` · ${esc(event.venue)}`:''}</div></header><div class="wrap">${rows||'<p>Programme will be published shortly.</p>'}</div><div class="footer">Eduvos · Women in Tech Summit</div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`
  const w=window.open('','_blank'); if(w) w.opener=null
  if(!w){throw new Error('POPUP_BLOCKED')}
  w.document.open();w.document.write(html);w.document.close()
}
