interface Env { MUSICBRAINZ_CONTACT?: string }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const query = new URL(request.url).searchParams.get('q')?.trim()
  if (!query) return Response.json({ error: '검색어가 필요합니다.' }, { status: 400 })

  const endpoint = new URL('https://musicbrainz.org/ws/2/release-group')
  endpoint.searchParams.set('query', query)
  endpoint.searchParams.set('fmt', 'json')
  endpoint.searchParams.set('limit', '8')

  const response = await fetch(endpoint, {
    headers: { 'User-Agent': `CRATEDIGGERS/0.1 (${env.MUSICBRAINZ_CONTACT || 'admin@example.com'})` },
  })
  if (!response.ok) return Response.json({ error: 'MusicBrainz 조회에 실패했습니다.' }, { status: 502 })
  const data = await response.json() as { 'release-groups'?: any[] }
  const results = (data['release-groups'] || []).map((item) => ({
    id: item.id,
    title: item.title,
    artist: item['artist-credit']?.map((x: any) => x.name).join(', ') || 'Unknown',
    type: item['primary-type'] || 'Album',
    secondaryTypes: item['secondary-types'] || [],
    firstReleaseDate: item['first-release-date'] || null,
    cover: `https://coverartarchive.org/release-group/${item.id}/front-500`,
  }))
  return Response.json({ results }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
