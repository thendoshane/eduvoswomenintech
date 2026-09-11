export function normalizeExternalUrl(value=''){
  const raw=String(value||'').trim()
  if(!raw)return ''
  if(/^https?:\/\//i.test(raw))return raw
  return `https://${raw.replace(/^\/+/, '')}`
}

export function isTeamsUrl(value=''){
  const url=normalizeExternalUrl(value)
  if(!url)return false
  try{
    const host=new URL(url).hostname.toLowerCase()
    return host==='teams.microsoft.com' || host.endsWith('.teams.microsoft.com') || host==='teams.cloud.microsoft' || host.endsWith('.teams.cloud.microsoft') || host==='teams.live.com'
  }catch{return false}
}

export function canEmbedStreamUrl(value=''){
  const url=normalizeExternalUrl(value)
  if(!url || isTeamsUrl(url))return false
  try{
    const host=new URL(url).hostname.toLowerCase()
    if(host.includes('login.microsoftonline.com') || host.includes('login.microsoft.com'))return false
    return true
  }catch{return false}
}
