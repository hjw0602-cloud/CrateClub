import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Disc3, Eye, Grid3X3, Heart, ImageDown, Layers3, Lock, MessageCircle, PenLine, Plus, Save, Search, Share2, Sparkles, Star, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { initialReviews, releases, users, type Release } from './data'
import { templateLabels, type Crateprint, type CrateprintTemplate, type CrateprintTheme } from './crateprint'
import './archive.css'

const defaultAlbumIds = ['afterimage', 'blue-hour', 'no-skip', 'petals', 'heat-check', 'soft-focus', 'blue-hour', 'afterimage', 'petals']
const catalogApi = 'https://cratediggers-release-sync.hjw0602.workers.dev'
type SearchRelease = Release & { source?: 'lastfm' | 'musicbrainz'; externalId?: string; musicbrainzId?: string }

const officialBoards: Crateprint[] = [
  makeBoard('official-01', 'CLASSIC NINE', '가장 익숙한 3×3으로 정리한 지금의 취향', 'classic-grid', 'black-metal', true),
  makeBoard('official-02', 'DISPLAY SHELF', '대표 앨범을 앞세워 진열한 아홉 장', 'display-shelf', 'black-metal', true),
  makeBoard('official-03', 'FRESH FROM THE CRATE', '방금 꺼내 놓은 LP처럼 겹쳐진 취향', 'crate-pile', 'black-metal', true),
  makeBoard('official-04', 'CENTER RECORD', '중앙 히어로 앨범과 원형으로 둘러싼 여덟 장', 'record-halo', 'black-metal', true),
]

function makeBoard(id: string, title: string, description: string, templateType: CrateprintTemplate, _theme: CrateprintTheme, isPublic = false): Crateprint {
  const now = '2026.07.25'
  return { id, ownerId: id.startsWith('official') ? 'official' : 'me', ownerName: id.startsWith('official') ? 'CRATEDIGGERS CURATOR' : 'cratekeeper', title, description, prompt: '나를 설명하는 앨범 9장', templateType, theme: 'black-metal', outputRatio: '4:5', selectedAlbums: defaultAlbumIds.map((releaseId, order) => ({ releaseId, order, score: 8.1 + order / 10 })), heroAlbumId: defaultAlbumIds[0], showScores: true, showNotes: true, isPublic, createdAt: now, updatedAt: now }
}

export function LandingPage() {
  const landingTemplates = ['classic-grid','display-shelf','crate-pile','record-halo'] as const
  const heroBoard = officialBoards[3]
  return <div className="archive-landing">
    <section className="landing-hero">
      <div className="landing-copy"><span>DIG. COLLECT. DISPLAY.</span><h1>MAKE YOUR<br />CRATE.</h1><p>좋아하는 앨범 9장을 고르고,<br />나만의 CRATEPRINT로 남기세요.</p><div><Link className="primary-btn" to="/create">지금 만들기 <ArrowRight /></Link><a className="outline-btn" href="#templates">템플릿 보기</a></div><small>미리보기까지 로그인 없이 바로 시작</small></div>
      <div className="landing-result"><CrateprintPreview board={heroBoard} compact /><div className="landing-result-label"><span>RECORD HALO / 4:5</span><b>CRATE INDEX 09</b></div></div>
    </section>
    <section id="templates" className="landing-templates section-wrap"><header><span>FOUR WAYS TO START</span><h2>네 가지 방식으로<br />취향을 정리하세요.</h2><p>현재 CREATE에서 바로 만들 수 있는 템플릿만 보여줍니다.</p></header><div>{landingTemplates.map((template,index) => <article key={template}><CrateprintPreview board={{ ...(officialBoards[index] || officialBoards[0]), templateType: template }} compact /><span>0{index + 1}</span><h3>{templateLabels[template]}</h3><p>{{'classic-grid':'가장 익숙한 3×3 공유 포스터','display-shelf':'대표 LP를 중심으로 세운 진열형','crate-pile':'crate digging 현장처럼 겹쳐진 더미형','record-halo':'중앙 히어로 앨범 뒤로 원형 배치'}[template]}</p></article>)}</div></section>
    <section className="h4-manifesto" aria-label="CRATEDIGGERS brand statement"><div className="h4-manifesto-mark" aria-hidden="true"><i /><i /><i /></div><div><b>CRATEDIGGERS</b><span>DIG <em>/</em> LISTEN <em>/</em> KEEP</span></div><small>PERSONAL MUSIC ARCHIVE<br />ISSUE 001 — 2026</small></section>
    <section className="landing-flow section-wrap"><span>HOW IT WORKS</span><div>{[['01','CREATE','앨범을 모아 취향 보드를 만들고'],['02','REVIEW','들은 음악을 점수와 문장으로 기록하고'],['03','ARCHIVE','MY CRATE에 오래 쌓고'],['04','EXPLORE','공개된 CRATEPRINT에서 다시 발견합니다']].map(item => <article key={item[0]}><b>{item[0]}</b><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div><Link to="/explore">공개 CRATEPRINT 둘러보기 <ArrowRight /></Link></section>
  </div>
}

export function CreatePage({ catalog: releases }: { catalog: typeof import('./data').releases }) {
  const [template, setTemplate] = useState<CrateprintTemplate>('classic-grid')
  const [title, setTitle] = useState('HEAVY ROTATION')
  const [description, setDescription] = useState('요즘 가장 자주 꺼내 듣는 아홉 장')
  const [albumIds, setAlbumIds] = useState(defaultAlbumIds)
  const [query, setQuery] = useState('')
  const [activeSlot, setActiveSlot] = useState(0)
  const [addedReleases, setAddedReleases] = useState<Release[]>([])
  const [searchResults, setSearchResults] = useState<SearchRelease[]>([])
  const [searching, setSearching] = useState(false)
  const [importingId, setImportingId] = useState('')
  const [searchError, setSearchError] = useState('')
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(true)
  const availableReleases = useMemo(() => [...releases, ...addedReleases.filter(item => !releases.some(release => release.id === item.id))], [releases, addedReleases])
  const normalizedQuery = query.trim().toLowerCase()
  const localMatches = availableReleases.filter(item => !normalizedQuery || `${item.title} ${item.artist} ${item.genres.join(' ')}`.toLowerCase().includes(normalizedQuery))
  const visibleReleases: SearchRelease[] = normalizedQuery.length < 2 ? localMatches.slice(0, 12) : [...localMatches, ...searchResults.filter(item => !localMatches.some(local => local.title.toLowerCase() === item.title.toLowerCase() && local.artist.toLowerCase() === item.artist.toLowerCase()))].slice(0, 12)
  useEffect(() => {
    if (normalizedQuery.length < 2) { setSearchResults([]); setSearching(false); setSearchError(''); return }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearching(true); setSearchError('')
      try {
        const response = await fetch(`${catalogApi}/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error('search failed')
        setSearchResults(await response.json())
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setSearchError('외부 앨범 검색을 잠시 사용할 수 없습니다.')
      } finally { if (!controller.signal.aborted) setSearching(false) }
    }, 500)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [normalizedQuery, query])
  const createTemplates = [
    ['classic-grid', Grid3X3, '익숙한 3 × 3 포스터'],
    ['display-shelf', Disc3, '대표 LP를 진열하는 선반형'],
    ['crate-pile', Layers3, '겹쳐 꺼내 놓은 LP 더미형'],
    ['record-halo', Layers3, '히어로 커버 뒤 원형 재킷형'],
  ] as const
  const board = useMemo(() => ({ ...makeBoard('draft-local', title, description, template, 'black-metal'), selectedAlbums: albumIds.map((releaseId, order) => ({ releaseId, order })), heroAlbumId: albumIds[0] }), [title, description, template, albumIds])
  const replace = (index: number, releaseId: string) => { const next = [...albumIds]; next[index] = releaseId; setAlbumIds(next) }
  const selectRelease = async (release: SearchRelease) => {
    let selected: Release = release
    if (release.externalId || release.musicbrainzId) {
      setImportingId(release.id)
      try {
        const response = await fetch(`${catalogApi}/catalog/import`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: release.source || 'musicbrainz', externalId: release.externalId || release.musicbrainzId, artist: release.artist, title: release.title }) })
        if (!response.ok) throw new Error('import failed')
        selected = await response.json()
        setAddedReleases(items => [...items.filter(item => item.id !== selected.id), selected])
      } catch { setSearchError('앨범을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.'); return }
      finally { setImportingId('') }
    }
    replace(activeSlot, selected.id); setQuery(''); setSearchResults([]); setActiveSlot(Math.min(activeSlot + 1, 8))
  }
  const saveLocal = () => localStorage.setItem('cd-crateprint-draft', JSON.stringify(board))
  const shareBoard = async () => {
    saveLocal()
    const shareData = { title: `${title} · CRATEDIGGERS`, text: description, url: window.location.href }
    if (navigator.share) await navigator.share(shareData)
    else await navigator.clipboard.writeText(window.location.href)
  }
  const downloadImage = () => { saveLocal(); window.print() }
  const activeAlbum = availableReleases.find(item => item.id === albumIds[activeSlot]) || availableReleases[0]

  return <div className="create-page section-wrap">
    <div className="create-workspace"><section className={`mobile-live-preview ${mobilePreviewOpen ? 'open' : 'collapsed'}`}><header><div><span>LIVE PREVIEW · {activeSlot + 1}번</span><b>{activeAlbum.title}</b><small>{activeAlbum.artist}</small></div><button onClick={() => setMobilePreviewOpen(value => !value)} aria-label={mobilePreviewOpen ? '미리보기 접기' : '미리보기 펼치기'}>{mobilePreviewOpen ? <ChevronUp /> : <ChevronDown />}</button></header>{mobilePreviewOpen && <div className="mobile-preview-canvas"><CrateprintPreview board={board} catalog={availableReleases} activeAlbumIndex={activeSlot} onAlbumSelect={setActiveSlot} /></div>}</section><section className="create-controls">
      <div className="create-control-block"><StepTitle index="01" title="Crate" copy="CRATEPRINT에 표시할 제목과 한 줄 설명을 입력하세요." /><label className="text-field">제목<input value={title} onChange={event => setTitle(event.target.value)} /></label><label className="text-field">한 줄 설명<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><div className="template-control"><span>템플릿</span><div className="preview-template-switcher">{createTemplates.map(([value,Icon,copy]) => <button className={template === value ? 'active' : ''} onClick={() => setTemplate(value)} key={value}><Icon /><span><b>{templateLabels[value]}</b><small>{copy}</small></span>{template === value && <Check />}</button>)}</div></div></div>
      <div className="create-control-block"><StepTitle index="02" title="앨범 선택" copy="번호를 고른 뒤 앨범을 검색하세요. 미리보기 커버를 눌러도 같은 번호가 선택됩니다." /><div className="active-slot-label"><span>{activeSlot + 1}번 앨범 선택 중</span><small>{availableReleases.length}개 저장됨 · Last.fm 전체 검색</small></div><div className="album-slot-picker">{albumIds.map((id,index) => { const album = availableReleases.find(item => item.id === id) || availableReleases[0]; return <button className={activeSlot === index ? 'active' : ''} onClick={() => setActiveSlot(index)} key={`${id}-${index}`}><b>{index + 1}</b><img src={album.cover} alt="" /><span>{album.title}<small>{album.artist}</small></span></button> })}</div><label className="album-search"><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`${activeSlot + 1}번에 넣을 앨범 또는 아티스트 검색`} /></label>{searching && <p className="album-search-status">Last.fm에서 검색 중...</p>}{searchError && <p className="album-search-error">{searchError}</p>}<div className="album-results">{visibleReleases.length ? visibleReleases.map(release => <article key={release.id}><img src={release.cover} alt="" /><div><b>{release.title}</b><small>{release.artist}{release.source === 'lastfm' ? ' · Last.fm' : ''}</small></div><button disabled={importingId === release.id} onClick={() => selectRelease(release)}><Plus /> {importingId === release.id ? '저장 중' : `${activeSlot + 1}번에 넣기`}</button></article>) : !searching && <p className="album-results-empty">검색 결과가 없습니다.</p>}</div></div>
      <div className="create-control-block create-output"><StepTitle index="03" title="출력" copy="완성한 CRATEPRINT를 저장하거나 바로 공유하세요." /><div className="output-actions"><button className="primary-btn" onClick={downloadImage}><ImageDown /> 이미지 다운로드</button><button className="outline-btn" onClick={shareBoard}><Share2 /> SNS 공유</button><button className="outline-btn" onClick={saveLocal}><Save /> 내 크레이트 저장</button></div><label className="public-check"><input type="checkbox" /> EXPLORE에 공개 <small>기본값은 비공개입니다.</small></label></div>
    </section><aside className="create-preview desktop-live-preview"><div className="preview-head"><div><span>LIVE PREVIEW</span><b>{templateLabels[template]}</b></div></div><CrateprintPreview board={board} catalog={availableReleases} activeAlbumIndex={activeSlot} onAlbumSelect={setActiveSlot} onTitleChange={setTitle} onDescriptionChange={setDescription} /><p>커버를 누르면 왼쪽의 같은 번호가 선택됩니다.</p></aside></div>
  </div>
}
function StepTitle({ index, title, copy }: { index: string; title: string; copy: string }) { return <header className="step-title"><span>{index}</span><h2>{title}</h2><p>{copy}</p></header> }

export function MyArchivePage() {
  const boards = [makeBoard('mine-01','JULY ROTATION','지금의 나를 설명하는 아홉 장','display-shelf','black-metal'),makeBoard('mine-02','2026 SO FAR','상반기 가장 오래 들은 앨범','ranked-crate','warm-gallery')]
  const profile = users[0]
  return <div className="my-archive section-wrap"><header className="my-profile"><div className="my-profile-person"><span className="my-profile-avatar">{profile.avatar}</span><div><small>{profile.handle}</small><h1>{profile.nickname}</h1><p>{profile.bio}</p><div className="my-taste-tags"><span>Alternative R&amp;B</span><span>K-Hip-Hop</span><span>Neo Soul</span></div></div></div><div className="my-profile-stats"><div><b>{boards.length}</b><span>CRATES</span></div><div><b>{releases.length}</b><span>기록한 앨범</span></div><div><b>8.5</b><span>평균 별점</span></div><div><b>3</b><span>선호 장르</span></div></div><button className="outline-btn"><PenLine /> 프로필 편집</button></header>
    <section className="archive-section"><div className="archive-title"><div><span>MY CRATES</span><h2>내가 만든 Crate</h2></div><Link className="primary-btn" to="/create"><Plus /> 새 CRATEPRINT</Link></div><div className="board-archive">{boards.map((board,index) => <article key={board.id}><CrateprintPreview board={board} compact /><div><span><Lock /> PRIVATE</span><h3>{board.title}</h3><p>{templateLabels[board.templateType]} · {board.createdAt}</p><footer><button><PenLine /> 다시 편집</button><button><Copy /> 복제</button><button><Share2 /> 공개 설정</button><button aria-label="삭제"><Trash2 /></button></footer></div></article>)}</div></section>
    <section className="archive-section"><div className="archive-title"><div><span>ALBUM ARCHIVE</span><h2>앨범 감상 기록</h2></div><div className="archive-filters">{['전체','듣고 싶어요','듣는 중','들었어요'].map(item => <button key={item}>{item}</button>)}</div></div><div className="album-archive">{releases.map((release,index) => <article key={release.id}><img src={release.cover} alt="" /><div><span>{index % 3 === 0 ? '듣는 중' : '들었어요'}</span><h3>{release.title}</h3><p>{release.artist}</p><b><Star fill="currentColor" /> {(8.1 + index / 10).toFixed(1)}</b><small>{initialReviews.find(review => review.releaseId === release.id)?.text || '감상 기록을 남겨보세요.'}</small></div><aside><span>사용된 CRATEPRINT</span><b>{index % 2 + 1}</b></aside></article>)}</div></section>
  </div>
}

const communityPosts = {
  '국내 음악': [
    { title: '요즘 국내 R&B 프로덕션에서 가장 인상적인 변화', body: '질감이 훨씬 다채로워진 것 같아요. 최근 좋았던 앨범도 같이 이야기해봐요.', author: '808room', time: '12분 전', likes: 31, comments: 12, tags: ['R&B','프로덕션'] },
    { title: '이번 주 국내 신보 중 가장 많이 들은 앨범', body: '첫인상과 반복해서 들었을 때 느낌이 달라진 앨범이 있었나요?', author: 'cratekeeper', time: '48분 전', likes: 24, comments: 18, tags: ['신보','추천'] },
    { title: '한국 힙합 올해의 앨범 후보를 골라본다면', body: '아직 반기가 남았지만 지금까지의 개인적인 후보가 궁금합니다.', author: 'liner.notes', time: '2시간 전', likes: 17, comments: 29, tags: ['K-Hip-Hop','AOTY'] },
  ],
  '해외 음악': [
    { title: 'Alternative R&B 신보 같이 들어요', body: '공간감과 보컬 프로덕션이 좋은 최근 앨범들을 모아봅시다.', author: 'soularchive', time: '8분 전', likes: 42, comments: 21, tags: ['Alternative R&B','신보'] },
    { title: '올해 나온 해외 힙합 앨범 중 재평가한 작품', body: '처음에는 평범했는데 다시 들을수록 좋아진 앨범이 있나요?', author: '808room', time: '1시간 전', likes: 28, comments: 16, tags: ['Hip-Hop','재평가'] },
    { title: '밤에 듣기 좋은 Neo Soul 추천', body: '차분하지만 너무 처지지 않는 앨범을 찾고 있어요.', author: 'liner.notes', time: '어제', likes: 53, comments: 34, tags: ['Neo Soul','추천'] },
  ],
}

export function ExplorePage() {
  const [tab,setTab] = useState<'FEATURED' | 'CLASSIC GRID' | 'DISPLAY SHELF' | 'CRATE PILE' | 'RECORD HALO'>('FEATURED')
  const shown = tab === 'FEATURED' ? officialBoards : officialBoards.filter(board => templateLabels[board.templateType] === tab)
  return <div className="explore-page section-wrap"><header><span>PUBLIC CRATEPRINTS</span><h1>EXPLORE</h1><p>공개된 취향 보드를 보는 갤러리입니다. 게시판보다 결과물을 먼저 보여주고, 마음에 드는 보드는 같은 템플릿으로 바로 만들 수 있게 연결합니다.</p></header><nav className="board-tabs">{(['FEATURED','CLASSIC GRID','DISPLAY SHELF','CRATE PILE','RECORD HALO'] as const).map(item => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</nav>
    <section className="crate-gallery"><header><div><span>SHOW YOUR CRATE</span><h2>CRATEPRINT GALLERY</h2><p>공식 예시와 공개된 CRATEPRINT만 전시합니다. 댓글, 자유 게시물, 실시간 채팅은 MVP 화면에서 제외합니다.</p></div><Link className="primary-btn" to="/create"><Plus /> 내 CRATE 만들기</Link></header><div className="explore-grid">{shown.map((board,index) => <Link to={`/explore/${board.id}`} key={board.id}><CrateprintPreview board={board} compact /><div><span>{index === 0 && tab === 'FEATURED' ? 'OFFICIAL CURATOR · ' : ''}{templateLabels[board.templateType]}</span><h2>{board.title}</h2><p>{board.ownerName} · 9 ALBUMS · {board.createdAt}</p></div></Link>)}</div></section>
  </div>
}

export function ExploreDetailPage() {
  const { id } = useParams()
  const board = officialBoards.find(item => item.id === id) || officialBoards[0]
  return <div className="explore-detail section-wrap"><Link to="/explore"><ChevronLeft /> EXPLORE로 돌아가기</Link><div className="explore-detail-grid"><CrateprintPreview board={board} /><aside><span>OFFICIAL CRATEDIGGERS CURATOR</span><h1>{board.title}</h1><p>{board.description}</p><dl><div><dt>주제</dt><dd>{board.prompt}</dd></div><div><dt>템플릿</dt><dd>{templateLabels[board.templateType]}</dd></div><div><dt>앨범</dt><dd>{board.selectedAlbums.length} RECORDS</dd></div></dl><Link className="primary-btn" to="/create"><Sparkles /> 같은 템플릿으로 만들기</Link><Link className="outline-btn" to="/create">같은 주제로 만들기</Link></aside></div><section className="used-albums"><span>RECORDS IN THIS CRATEPRINT</span><div>{board.selectedAlbums.map((item,index) => { const album = releases.find(release => release.id === item.releaseId) || releases[0]; return <Link to={`/release/${album.id}`} key={`${item.releaseId}-${index}`}><b>{String(index + 1).padStart(2,'0')}</b><img src={album.cover} alt="" /><span>{album.title}<small>{album.artist}</small></span></Link> })}</div></section></div>
}

function CrateprintPreview({ board, catalog = releases, compact = false, activeAlbumIndex, onAlbumSelect, onTitleChange, onDescriptionChange }: { board: Crateprint; catalog?: typeof releases; compact?: boolean; activeAlbumIndex?: number; onAlbumSelect?: (index: number) => void; onTitleChange?: (value: string) => void; onDescriptionChange?: (value: string) => void }) {
  const albums = board.selectedAlbums.map(item => catalog.find(release => release.id === item.releaseId) || releases.find(release => release.id === item.releaseId) || catalog[0] || releases[0])
  const hero = catalog.find(item => item.id === board.heroAlbumId) || releases.find(item => item.id === board.heroAlbumId) || albums[0]
  const spreadAlbums = albums.slice(0, 9)
  const albumFigure = (index: number) => ({ className: `${activeAlbumIndex === index ? 'album-active ' : ''}${onAlbumSelect ? 'album-selectable' : ''}`, onClick: () => onAlbumSelect?.(index), 'aria-label': onAlbumSelect ? `${index + 1}번 앨범 선택` : undefined })
  const commitTitle = (value: string | null) => onTitleChange?.((value || '').trim() || board.title)
  const commitDescription = (value: string | null) => onDescriptionChange?.((value || '').trim() || board.description)
  return <div className={`archive-print template-${board.templateType} theme-${board.theme} ratio-${board.outputRatio.replace(':','-')} ${compact ? 'compact' : ''}`}><header><span>CRATEPRINT / {templateLabels[board.templateType]}</span><b>CRATE INDEX 09</b></header><h3 contentEditable={Boolean(onTitleChange)} suppressContentEditableWarning onBlur={event => commitTitle(event.currentTarget.textContent)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }}>{board.title}</h3><p contentEditable={Boolean(onDescriptionChange)} suppressContentEditableWarning onBlur={event => commitDescription(event.currentTarget.textContent)}>{board.description}</p>
    {board.templateType === 'display-shelf' && <div className="print-shelf"><figure {...albumFigure(0)} className={`print-hero ${albumFigure(0).className}`}><i /><img src={hero.cover} alt="" /><figcaption><b>01</b><span>{hero.title}</span></figcaption></figure><div>{albums.slice(1).map((album,index) => <figure {...albumFigure(index + 1)} key={`${album.id}-${index}`}><i /><img src={album.cover} alt="" /><b>{String(index + 2).padStart(2,'0')}</b></figure>)}</div></div>}
    {board.templateType === 'vinyl-peek' && <div className="print-peek">{spreadAlbums.map((album,index) => <figure {...albumFigure(index)} className={`${index === 0 ? 'peek-hero ' : ''}${albumFigure(index).className}`} key={`${album.id}-${index}`}><i /><img src={album.cover} alt="" /><b>{String(index + 1).padStart(2,'0')}</b></figure>)}</div>}
    {board.templateType === 'table-spread' && <div className="print-spread" aria-label="위에서 내려다본 LP 컬렉션">{spreadAlbums.map((album,index) => <figure {...albumFigure(index)} className={`${index === 0 ? 'spread-hero ' : ''}${albumFigure(index).className}`} key={`${album.id}-${index}`}><i aria-hidden="true" /><img src={album.cover} alt={`${album.artist} ${album.title}`} /><figcaption><b>{String(index + 1).padStart(2,'0')}</b></figcaption></figure>)}</div>}
    {board.templateType === 'crate-pile' && <div className="print-crate-pile" aria-label="바닥 위에 겹쳐 펼친 LP 컬렉션">{albums.slice(0,9).map((album,index) => <figure {...albumFigure(index)} className={`${index === 0 ? 'pile-hero ' : ''}${albumFigure(index).className}`} key={`${album.id}-${index}`}><img src={album.cover} alt={`${album.artist} ${album.title}`} /><figcaption><b>{String(index + 1).padStart(2,'0')}</b></figcaption></figure>)}</div>}
    {board.templateType === 'record-halo' && <div className="print-record-halo" aria-label="중앙 히어로 앨범과 뒤쪽 원형 LP 커버 컬렉션">{albums.slice(0,9).map((album,index) => <figure {...albumFigure(index)} className={`${index === 0 ? 'halo-hero ' : ''}${albumFigure(index).className}`} key={`${album.id}-${index}`}><img src={album.cover} alt={`${album.artist} ${album.title}`} />{index > 0 && <b>{String(index + 1).padStart(2,'0')}</b>}<figcaption>{index === 0 ? 'HERO RECORD' : ''}</figcaption></figure>)}</div>}
    {board.templateType === 'quiet-rack' && <div className="print-rack">{spreadAlbums.map((album,index) => <figure {...albumFigure(index)} className={`${index === 0 ? 'rack-hero ' : ''}${albumFigure(index).className}`} key={`${album.id}-${index}`}><i /><img src={album.cover} alt="" /><b>{String(index + 1).padStart(2,'0')}</b></figure>)}</div>}
    {board.templateType === 'ranked-crate' && <div className="print-ranked">{albums.map((album,index) => <figure {...albumFigure(index)} key={`${album.id}-${index}`}><b>{String(index + 1).padStart(2,'0')}</b><img src={album.cover} alt="" /><figcaption>{album.title}</figcaption></figure>)}</div>}
    {board.templateType === 'classic-grid' && <div className="print-grid">{albums.map((album,index) => <figure {...albumFigure(index)} key={`${album.id}-${index}`}><img src={album.cover} alt="" /><b>{String(index + 1).padStart(2,'0')}</b></figure>)}</div>}
    <footer><span>{board.ownerName} · {board.createdAt}</span><b>DIG. COLLECT. DISPLAY. · CRATEDIGGERS</b></footer></div>
}
