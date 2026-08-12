interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  MUSICBRAINZ_CONTACT: string
  SYNC_TOKEN?: string
  LASTFM_API_KEY?: string
}

type MusicBrainzReleaseGroup = {
  id: string
  title: string
  'primary-type'?: string
  'secondary-types'?: string[]
  'first-release-date'?: string
  tags?: { name: string; count: number }[]
  'artist-credit'?: { name: string; artist?: { id: string; name: string } }[]
}

type LastFmAlbum = {
  name: string
  artist: string
  url: string
  mbid?: string
  image?: { '#text': string; size: string }[]
}

const curatedCatalog = [
  ['Nas', 'Illmatic'], ['Kendrick Lamar', 'To Pimp a Butterfly'], ['Kanye West', 'My Beautiful Dark Twisted Fantasy'],
  ['Jay-Z', 'The Blueprint'], ['The Notorious B.I.G.', 'Ready to Die'], ['A Tribe Called Quest', 'The Low End Theory'],
  ['OutKast', 'Aquemini'], ['Madvillain', 'Madvillainy'], ['Wu-Tang Clan', 'Enter the Wu-Tang (36 Chambers)'],
  ['Lauryn Hill', 'The Miseducation of Lauryn Hill'], ['Frank Ocean', 'Blonde'], ['Frank Ocean', 'Channel Orange'],
  ['SZA', 'Ctrl'], ["D'Angelo", 'Voodoo'], ["D'Angelo", 'Brown Sugar'], ['Erykah Badu', 'Baduizm'],
  ['Erykah Badu', "Mama's Gun"], ['Maxwell', "Maxwell's Urban Hang Suite"], ['Marvin Gaye', "What's Going On"],
  ['Stevie Wonder', 'Songs in the Key of Life'], ['Stevie Wonder', 'Innervisions'], ['Prince', 'Purple Rain'],
  ['Michael Jackson', 'Thriller'], ['Michael Jackson', 'Off the Wall'], ['Janet Jackson', 'The Velvet Rope'],
  ['The Weeknd', 'House of Balloons'], ['Drake', 'Take Care'], ['Tyler, the Creator', 'IGOR'],
  ['Tyler, the Creator', 'Flower Boy'], ['Kendrick Lamar', 'DAMN.'], ['Kendrick Lamar', 'good kid, m.A.A.d city'],
  ['J. Cole', '2014 Forest Hills Drive'], ['Mac Miller', 'Swimming'], ['Dr. Dre', 'The Chronic'],
  ['Snoop Dogg', 'Doggystyle'], ['Kanye West', 'The College Dropout'], ['Kanye West', 'Late Registration'],
  ['Jay-Z', 'Reasonable Doubt'], ['Mos Def', 'Black on Both Sides'], ['Solange', 'A Seat at the Table'],
] as const

const headers = (env: Env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const slugify = (value: string, suffix: string) => {
  const base = value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)
  return `${base || 'release'}-${suffix.slice(0, 8)}`
}

const releaseType = (item: MusicBrainzReleaseGroup) => {
  if (item['secondary-types']?.some(type => type.toLowerCase().includes('mixtape'))) return 'MIXTAPE'
  const primary = item['primary-type']?.toUpperCase()
  return primary === 'EP' || primary === 'SINGLE' ? primary : 'ALBUM'
}

const musicBrainzHeaders = (env: Env) => ({ 'User-Agent': `CRATEDIGGERS/0.3 (${env.MUSICBRAINZ_CONTACT})` })

const publicRelease = (item: MusicBrainzReleaseGroup) => {
  const credit = item['artist-credit']?.[0]
  return {
    id: `mb:${item.id}`,
    source: 'musicbrainz',
    externalId: item.id,
    musicbrainzId: item.id,
    title: item.title,
    artist: credit?.artist?.name || credit?.name || 'Unknown Artist',
    type: releaseType(item),
    date: item['first-release-date'] || '',
    genres: (item.tags || []).sort((a, b) => b.count - a.count).slice(0, 5).map(tag => tag.name),
    cover: `https://coverartarchive.org/release-group/${item.id}/front-500`,
    score: 0,
    ratings: 0,
    description: '',
    tracks: [],
    links: {},
  }
}

const publicLastFmRelease = (item: LastFmAlbum) => ({
  id: `lastfm:${encodeURIComponent(item.artist)}:${encodeURIComponent(item.name)}`,
  source: 'lastfm',
  externalId: item.url,
  musicbrainzId: item.mbid || undefined,
  title: item.name,
  artist: item.artist,
  type: 'ALBUM',
  date: '',
  genres: [],
  cover: [...(item.image || [])].reverse().find(image => image['#text'])?.['#text'] || '',
  score: 0,
  ratings: 0,
  description: '',
  tracks: [],
  links: {},
})

async function getReleaseGroup(env: Env, musicbrainzId: string) {
  const endpoint = new URL(`https://musicbrainz.org/ws/2/release-group/${musicbrainzId}`)
  endpoint.searchParams.set('fmt', 'json')
  endpoint.searchParams.set('inc', 'artist-credits+tags')
  const response = await fetch(endpoint, { headers: musicBrainzHeaders(env) })
  if (!response.ok) throw new Error(`MusicBrainz ${response.status}`)
  return await response.json() as MusicBrainzReleaseGroup
}

async function importSelectedRelease(env: Env, musicbrainzId: string) {
  const item = await getReleaseGroup(env, musicbrainzId)
  const credit = item['artist-credit']?.[0]
  if (!credit?.artist?.id) throw new Error('Release group has no artist credit')
  const artistResponse = await supabase(env, 'artists?on_conflict=musicbrainz_id', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ name: credit.artist.name || credit.name, slug: slugify(credit.artist.name || credit.name, credit.artist.id), musicbrainz_id: credit.artist.id }),
  })
  const [artist] = await artistResponse.json() as { id: string }[]
  await supabase(env, 'releases?on_conflict=musicbrainz_id', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      artist_id: artist.id, title: item.title, slug: slugify(`${credit.name}-${item.title}`, item.id),
      release_type: releaseType(item), release_date: item['first-release-date'] || null,
      genres: (item.tags || []).sort((a, b) => b.count - a.count).slice(0, 5).map(tag => tag.name),
      cover_url: `https://coverartarchive.org/release-group/${item.id}/front-500`, musicbrainz_id: item.id,
      status: 'draft', source: 'musicbrainz-selected', source_payload: item,
      imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(),
    }),
  })
  const release = publicRelease(item)
  return { ...release, id: slugify(`${credit.name}-${item.title}`, item.id) }
}

async function importLastFmRelease(env: Env, artistName: string, albumName: string) {
  if (!env.LASTFM_API_KEY) throw new Error('Last.fm API key is not configured')
  const endpoint = new URL('https://ws.audioscrobbler.com/2.0/')
  endpoint.searchParams.set('method', 'album.getInfo')
  endpoint.searchParams.set('api_key', env.LASTFM_API_KEY)
  endpoint.searchParams.set('artist', artistName)
  endpoint.searchParams.set('album', albumName)
  endpoint.searchParams.set('autocorrect', '1')
  endpoint.searchParams.set('format', 'json')
  const response = await fetch(endpoint)
  if (!response.ok) throw new Error(`Last.fm ${response.status}`)
  const payload = await response.json() as { album?: { name: string; artist: string; url: string; mbid?: string; image?: { '#text': string; size: string }[]; tags?: { tag?: { name: string }[] } } }
  const item = payload.album
  if (!item) throw new Error('Last.fm album not found')
  const artistSlug = slugify(item.artist, `lastfm-${item.artist}`)
  const artistResponse = await supabase(env, 'artists?on_conflict=slug', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ name: item.artist, slug: artistSlug }),
  })
  const [artist] = await artistResponse.json() as { id: string }[]
  const slug = slugify(`${item.artist}-${item.name}`, `lastfm-${item.url}`)
  const genres = (item.tags?.tag || []).slice(0, 5).map(tag => tag.name)
  const cover = [...(item.image || [])].reverse().find(image => image['#text'])?.['#text'] || ''
  await supabase(env, 'releases?on_conflict=slug', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      artist_id: artist.id, title: item.name, slug, release_type: 'ALBUM', release_date: null,
      genres, cover_url: cover,
      status: 'draft', source: 'lastfm-selected', source_payload: item,
      imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(),
    }),
  })
  return { ...publicLastFmRelease(item), id: slug, genres }
}

async function supabase(env: Env, path: string, init: RequestInit = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers(env), ...init.headers } })
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
  return response
}

async function syncDate(env: Env, targetDate: string) {
  const runResponse = await supabase(env, 'release_sync_runs', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ source: 'musicbrainz', target_date: targetDate, status: 'running' }),
  })
  const [run] = await runResponse.json() as { id: string }[]

  try {
    const endpoint = new URL('https://musicbrainz.org/ws/2/release-group')
    endpoint.searchParams.set('query', `firstreleasedate:${targetDate} AND (primarytype:album OR primarytype:ep OR primarytype:single)`)
    endpoint.searchParams.set('fmt', 'json')
    endpoint.searchParams.set('limit', '100')
    const response = await fetch(endpoint, { headers: { 'User-Agent': `CRATEDIGGERS/0.2 (${env.MUSICBRAINZ_CONTACT})` } })
    if (!response.ok) throw new Error(`MusicBrainz ${response.status}: ${await response.text()}`)
    const payload = await response.json() as { 'release-groups'?: MusicBrainzReleaseGroup[] }
    const groups = (payload['release-groups'] || []).filter(item => item['first-release-date'] === targetDate)
    let imported = 0

    for (const item of groups) {
      const credit = item['artist-credit']?.[0]
      if (!credit?.artist?.id) continue
      const artistResponse = await supabase(env, 'artists?on_conflict=musicbrainz_id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ name: credit.artist.name || credit.name, slug: slugify(credit.artist.name || credit.name, credit.artist.id), musicbrainz_id: credit.artist.id }),
      })
      const [artist] = await artistResponse.json() as { id: string }[]
      await supabase(env, 'releases?on_conflict=musicbrainz_id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          artist_id: artist.id, title: item.title, slug: slugify(`${credit.name}-${item.title}`, item.id),
          release_type: releaseType(item), release_date: targetDate,
          genres: (item.tags || []).sort((a, b) => b.count - a.count).slice(0, 5).map(tag => tag.name),
          cover_url: `https://coverartarchive.org/release-group/${item.id}/front-500`, musicbrainz_id: item.id,
          status: 'draft', source: 'musicbrainz', source_payload: item, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(),
        }),
      })
      imported += 1
    }

    await supabase(env, `release_sync_runs?id=eq.${run.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed', discovered_count: groups.length, imported_count: imported, finished_at: new Date().toISOString() }) })
    return { targetDate, discovered: groups.length, imported }
  } catch (error) {
    await supabase(env, `release_sync_runs?id=eq.${run.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'failed', error_message: String(error), finished_at: new Date().toISOString() }) })
    throw error
  }
}

async function syncCuratedBatch(env: Env, batch: number) {
  const size = 5
  const items = curatedCatalog.slice(batch * size, batch * size + size)
  let imported = 0
  const failed: string[] = []

  for (const [artistName, title] of items) {
    try {
      const endpoint = new URL('https://musicbrainz.org/ws/2/release-group')
      endpoint.searchParams.set('query', `releasegroup:"${title}" AND artist:"${artistName}"`)
      endpoint.searchParams.set('fmt', 'json')
      endpoint.searchParams.set('limit', '5')
      let response: Response | undefined
      for (let attempt = 0; attempt < 2; attempt += 1) {
        response = await fetch(endpoint, { headers: { 'User-Agent': `CRATEDIGGERS/0.2 (${env.MUSICBRAINZ_CONTACT})` } })
        if (response.ok) break
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      if (!response?.ok) throw new Error(`MusicBrainz ${response?.status || 'unavailable'}`)
      const payload = await response.json() as { 'release-groups'?: MusicBrainzReleaseGroup[] }
      const item = payload['release-groups']?.find(group => group['artist-credit']?.some(credit => credit.artist?.id))
      const credit = item?.['artist-credit']?.[0]
      if (!item || !credit?.artist?.id) throw new Error('No matching release group')

      const artistResponse = await supabase(env, 'artists?on_conflict=musicbrainz_id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ name: credit.artist.name || artistName, slug: slugify(credit.artist.name || artistName, credit.artist.id), musicbrainz_id: credit.artist.id }),
      })
      const [artist] = await artistResponse.json() as { id: string }[]
      await supabase(env, 'releases?on_conflict=musicbrainz_id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          artist_id: artist.id, title: item.title, slug: slugify(`${credit.name}-${item.title}`, item.id),
          release_type: releaseType(item), release_date: item['first-release-date'] || null,
          genres: (item.tags || []).sort((a, b) => b.count - a.count).slice(0, 5).map(tag => tag.name),
          cover_url: `https://coverartarchive.org/release-group/${item.id}/front-500`, musicbrainz_id: item.id,
          status: 'published', source: 'musicbrainz-curated', source_payload: item,
          imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(), published_at: new Date().toISOString(),
        }),
      })
      imported += 1
    } catch {
      failed.push(`${artistName} - ${title}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1100))
  }

  return { batch, imported, failed, total: curatedCatalog.length, hasMore: (batch + 1) * size < curatedCatalog.length }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const today = new Date().toISOString().slice(0, 10)
    ctx.waitUntil(syncDate(env, today))
  },
  async fetch(request: Request, env: Env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/catalog') {
      const response = await supabase(env, 'releases?select=slug,title,release_type,release_date,genres,description,cover_url,spotify_url,apple_music_url,youtube_music_url,artist:artists!inner(name)&or=(status.eq.published,source.in.(musicbrainz-selected,lastfm-selected))&order=release_date.desc&limit=500')
      return new Response(await response.text(), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } })
    }
    if (request.method === 'GET' && url.pathname === '/search') {
      const query = (url.searchParams.get('q') || '').trim().slice(0, 80)
      if (query.length < 2) return Response.json([], { headers: corsHeaders })
      if (!env.LASTFM_API_KEY) return Response.json({ error: 'Last.fm search is not configured' }, { status: 503, headers: corsHeaders })
      const lastFmEndpoint = new URL('https://ws.audioscrobbler.com/2.0/')
      lastFmEndpoint.searchParams.set('method', 'album.search')
      lastFmEndpoint.searchParams.set('album', query)
      lastFmEndpoint.searchParams.set('api_key', env.LASTFM_API_KEY)
      lastFmEndpoint.searchParams.set('limit', '18')
      lastFmEndpoint.searchParams.set('format', 'json')
      const lastFmResponse = await fetch(lastFmEndpoint)
      if (!lastFmResponse.ok) return Response.json({ error: 'Last.fm search is temporarily unavailable' }, { status: 503, headers: corsHeaders })
      const lastFmPayload = await lastFmResponse.json() as { results?: { albummatches?: { album?: LastFmAlbum[] } } }
      const lastFmResults = (lastFmPayload.results?.albummatches?.album || []).map(publicLastFmRelease)
      return Response.json(lastFmResults, { headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=300' } })
    }
    if (request.method === 'POST' && url.pathname === '/catalog/import') {
      const body = await request.json().catch(() => null) as { source?: string, externalId?: string, musicbrainzId?: string, artist?: string, title?: string } | null
      const source = body?.source || (body?.musicbrainzId ? 'musicbrainz' : '')
      const externalId = body?.externalId || body?.musicbrainzId || ''
      if (source === 'musicbrainz' && !/^[0-9a-f-]{36}$/i.test(externalId)) return Response.json({ error: 'Invalid MusicBrainz ID' }, { status: 400, headers: corsHeaders })
      if (source === 'lastfm' && (!body?.artist?.trim() || !body?.title?.trim())) return Response.json({ error: 'Invalid Last.fm album' }, { status: 400, headers: corsHeaders })
      if (source !== 'lastfm' && source !== 'musicbrainz') return Response.json({ error: 'Unsupported catalog source' }, { status: 400, headers: corsHeaders })
      try {
        return Response.json(source === 'lastfm' ? await importLastFmRelease(env, body!.artist!, body!.title!) : await importSelectedRelease(env, externalId), { headers: corsHeaders })
      } catch {
        return Response.json({ error: 'Album could not be imported' }, { status: 502, headers: corsHeaders })
      }
    }
    if (request.method !== 'POST') return new Response('Not found', { status: 404 })
    if (env.SYNC_TOKEN && request.headers.get('Authorization') !== `Bearer ${env.SYNC_TOKEN}`) return new Response('Unauthorized', { status: 401 })
    if (url.searchParams.get('mode') === 'classics') {
      const batch = Number(url.searchParams.get('batch') || '0')
      if (!Number.isInteger(batch) || batch < 0) return Response.json({ error: 'Invalid batch' }, { status: 400 })
      return Response.json(await syncCuratedBatch(env, batch))
    }
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: 'Invalid date' }, { status: 400 })
    return Response.json(await syncDate(env, date))
  },
}
