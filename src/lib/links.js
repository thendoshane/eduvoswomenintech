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

const HONORIFIC_RE=/^(?:(?:mr|mrs|ms|miss|dr|doctor|prof|professor)\.?\s+)+/i

export function cleanPersonName(value=''){
  return String(value||'').trim().replace(HONORIFIC_RE,'').trim()
}

export function speakerSlug(value=''){
  const clean=cleanPersonName(value)
  return clean
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/&/g,' and ')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'') || 'speaker'
}
