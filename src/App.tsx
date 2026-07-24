import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Bell, ChevronDown, ChevronRight, Disc3, ExternalLink, Headphones, Heart, LogIn, LogOut, Menu, MessageCircle,
  Moon, MoreHorizontal, PenLine, Play, Plus, Search, Send, ShieldAlert, SlidersHorizontal,
  Star, Sun, UserRound, Users, X,
} from 'lucide-react'
import { articles, releases, users, type Post, type Release, type Review } from './data'
import { useBackend } from './lib/backend'
import { isDemoMode, supabase } from './lib/supabase'
import { AlbumLoungePage, CrateProfileRoute, DiscoverHubPage, TodayPage } from './sns-pages'
import './sns.css'

const BRAND = 'CRATEDIGGERS'

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return initial }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue] as const
}

function App() {
  const [dark, setDark] = usePersisted('cd-dark', false)
  const backend = useBackend()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  const ctx = { ...backend, openAuth: () => setAuthOpen(true) }

  return <div className="app-shell">
    <Header dark={dark} setDark={setDark} loggedIn={backend.loggedIn} setAuthOpen={setAuthOpen} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={() => supabase?.auth.signOut()} />
    <main>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/discover" element={<DiscoverHubPage />} />
        <Route path="/discover/releases" element={<DiscoverPage />} />
        <Route path="/social" element={<CrateProfileRoute reviews={backend.reviews} follows={backend.follows} toggleFollow={backend.toggleFollow} self />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/hot-clips" element={<HotClipsPage />} />
        <Route path="/release/:id/lounge" element={<AlbumLoungePage />} />
        <Route path="/release/:id" element={<ReleasePage {...ctx} />} />
        <Route path="/magazine" element={<MagazinePage />} />
        <Route path="/community" element={<CommunityPage {...ctx} />} />
        <Route path="/search" element={<SearchPage reviews={backend.reviews} />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/me" element={<CrateProfileRoute reviews={backend.reviews} follows={backend.follows} toggleFollow={backend.toggleFollow} self />} />
        <Route path="/my-crate" element={<CrateProfileRoute reviews={backend.reviews} follows={backend.follows} toggleFollow={backend.toggleFollow} self />} />
        <Route path="/user/:id" element={<CrateProfileRoute reviews={backend.reviews} follows={backend.follows} toggleFollow={backend.toggleFollow} />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </main>
    <MobileNav />
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </div>
}

type AppContext = {
  loggedIn: boolean; reviews: Review[]; posts: Post[]; follows: string[]; liked: string[]; openAuth: () => void
  addReview: (releaseId: string, score: number, text: string) => Promise<void>
  toggleLike: (reviewId: string) => Promise<void>; toggleFollow: (userId: string) => Promise<void>
  addReply: (reviewId: string, text: string) => Promise<void>
  addPost: (post: Pick<Post, 'board' | 'title' | 'body'>) => Promise<void>
}

function Header({ dark, setDark, loggedIn, setAuthOpen, mobileOpen, setMobileOpen, onLogout }: any) {
  return <header className="header">
    <Link className="brand" to="/"><Disc3 size={21} /><span>{BRAND}</span></Link>
    <nav className={mobileOpen ? 'desktop-nav open' : 'desktop-nav'}>
      <NavLink to="/" end>TODAY</NavLink><NavLink to="/discover">DISCOVER</NavLink><NavLink to="/my-crate">MY CRATE</NavLink><NavLink to="/community">COMMUNITY</NavLink>
    </nav>
    <div className="header-actions">
      <Link className="icon-btn" to="/search" title="검색"><Search size={19} /></Link>
      <button className="icon-btn" onClick={() => setDark(!dark)} title="테마 변경">{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      {loggedIn ? <><Link className="icon-btn desktop-only" to="/notifications" title="알림"><Bell size={19} /><i /></Link>{!isDemoMode && <button className="icon-btn desktop-only" onClick={onLogout} title="로그아웃"><LogOut size={18} /></button>}<Link className="avatar mini" to="/my-crate" title="MY CRATE">CK</Link></> : <button className="command-btn" onClick={() => setAuthOpen(true)}><LogIn size={16} /> 로그인</button>}
      <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
    </div>
  </header>
}

function HomePage(ctx: AppContext) {
  const topReviews = [...ctx.reviews].sort((a, b) => b.likes - a.likes).slice(0, 3)
  return <>
    <section className="hero band">
      <div className="hero-copy">
        <p className="eyebrow">THIS WEEK'S ESSENTIAL</p>
        <h1>AFTERIMAGE</h1><p className="hero-artist">NOA · 2ND ALBUM</p>
        <p className="hero-deck">침묵과 잔향 사이를 오가는 열두 개의 장면.<br />이번 주 가장 많은 이야기가 시작된 앨범.</p>
        <div className="hero-score"><strong>8.7</strong><span>/ 10<br /><b>184 ratings</b></span></div>
        <Link className="primary-btn" to="/release/afterimage">리뷰 읽기 <ChevronRight size={17} /></Link>
      </div>
      <Link to="/release/afterimage" className="hero-art"><img src="/images/featured-cover.png" alt="NOA AFTERIMAGE 앨범 커버" /><span>01</span></Link>
      <div className="hero-index">NEW MUSIC<br />WEEK 29 / 2026</div>
    </section>

    <section className="section-wrap">
      <SectionHead kicker="JUST IN" title="이번 주 신보" link="/discover" />
      <div className="release-grid">{releases.slice(0, 4).map(r => <ReleaseCard key={r.id} release={r} />)}</div>
    </section>

    <section className="ink-band">
      <div className="section-wrap">
        <SectionHead kicker="COMMUNITY PICKS" title="지금 가장 좋은 한줄" light />
        <div className="review-feature-grid">{topReviews.map((review, i) => <FeaturedReview key={review.id} review={review} rank={i + 1} />)}</div>
      </div>
    </section>

    <section className="section-wrap">
      <SectionHead kicker="EDITORIAL" title="매거진" link="/magazine" />
      <div className="article-grid">{articles.map((a, i) => <article className={i === 0 ? 'article-card lead' : 'article-card'} key={a.id}><img src={a.cover} alt="" /><div><span className="tag red">{a.category}</span><h3>{a.title}</h3><p>{a.deck}</p><small>{a.date} · {a.readTime}</small></div></article>)}</div>
    </section>

    <section className="ranking-band section-wrap">
      <SectionHead kicker="REVIEWERS" title="이달의 디거" />
      <div className="reviewer-list">{users.slice(1).map((u, i) => <Link to={`/user/${u.id}`} className="reviewer-row" key={u.id}><b>0{i + 1}</b><span className="avatar">{u.avatar}</span><div><strong>{u.nickname}</strong><small>{u.bio}</small></div><span>{u.likes.toLocaleString()} likes</span><ChevronRight /></Link>)}</div>
    </section>
  </>
}

function SectionHead({ kicker, title, link, light }: { kicker: string; title: string; link?: string; light?: boolean }) {
  return <div className={`section-head ${light ? 'light' : ''}`}><div><span>{kicker}</span><h2>{title}</h2></div>{link && <Link to={link}>전체 보기 <ChevronRight size={16} /></Link>}</div>
}

function ReleaseCard({ release }: { release: Release }) {
  return <Link to={`/release/${release.id}`} className="release-card"><div className="cover-wrap"><img src={release.cover} alt={`${release.artist} ${release.title}`} /><span className="type-tag">{release.type}</span></div><h3>{release.title}</h3><p>{release.artist}</p><div className="genres">{release.genres.slice(0, 2).map(g => <span key={g}>{g}</span>)}</div><div className="card-score"><Star size={15} fill="currentColor" /><b>{release.score.toFixed(1)}</b><small>{release.ratings}</small></div></Link>
}

function FeaturedReview({ review, rank }: { review: Review; rank: number }) {
  const user = review.user || users.find(u => u.id === review.userId) || users[0]
  const release = releases.find(r => r.id === review.releaseId)!
  return <article className="featured-review"><div className="rank">0{rank}</div><div className="quote">“</div><p>{review.text}</p><div className="review-meta"><span className="avatar mini">{user.avatar}</span><div><strong>{user.nickname}</strong><small>{release.artist} · {release.title}</small></div><b>{review.score.toFixed(1)}</b></div></article>
}

function DiscoverPage() {
  const [type, setType] = useState('ALL')
  const list = type === 'ALL' ? releases : releases.filter(r => r.type === type)
  return <div className="page section-wrap"><PageTitle kicker="NEW RELEASES" title="신보 탐색" copy="운영자가 고른 새 음악을 듣고, 당신의 점수를 남겨보세요." />
    <div className="filter-row">{['ALL', 'ALBUM', 'EP', 'MIXTAPE', 'SINGLE'].map(t => <button className={type === t ? 'active' : ''} onClick={() => setType(t)} key={t}>{t}</button>)}<button className="filter-icon"><SlidersHorizontal size={16} /> 최신순</button></div>
    <div className="release-grid wide">{list.map(r => <ReleaseCard key={r.id} release={r} />)}</div>
  </div>
}

const defaultTopster = ['afterimage', 'blue-hour', 'no-skip', 'petals', 'heat-check', 'soft-focus', '', '', '']

function SocialPage(ctx: AppContext) {
  const [view, setView] = useState<'mine' | 'following'>('mine')
  const [topster, setTopster] = usePersisted<string[]>('cd-topster', defaultTopster)
  const [editing, setEditing] = useState(false)
  const me = users[0]
  const myReviews = ctx.reviews.filter(review => review.userId === 'me')
  const feed = ctx.reviews.filter(review => ctx.follows.includes(review.userId) && review.text)

  const changeSlot = (slot: number, releaseId: string) => {
    const next = [...topster]
    const previous = next.indexOf(releaseId)
    if (previous >= 0) next[previous] = next[slot]
    next[slot] = releaseId
    setTopster(next)
  }

  return <div className="page section-wrap social-page">
    <div className="social-title-row">
      <PageTitle kicker="YOUR MUSIC IDENTITY" title="Social" copy="좋아한 음악이 쌓여 당신을 설명하는 공간." />
      <div className="social-tabs" aria-label="Social 보기 전환">
        <button className={view === 'mine' ? 'active' : ''} onClick={() => setView('mine')}>MY PAGE</button>
        <button className={view === 'following' ? 'active' : ''} onClick={() => setView('following')}>FOLLOWING</button>
      </div>
    </div>
    {view === 'mine' ? <>
      <MusicProfileHeader user={me} reviewCount={myReviews.length} />
      <section className="music-identity-grid">
        <div className="topster-panel">
          <div className="panel-heading"><div><span>MY TOPSTER</span><h2>지금의 나를 만든 9장</h2></div><button className="outline-btn" onClick={() => setEditing(!editing)}><PenLine size={14} /> {editing ? '편집 완료' : '탑스터 편집'}</button></div>
          <div className={`topster-grid ${editing ? 'is-editing' : ''}`}>{topster.map((id, index) => {
            const release = releases.find(item => item.id === id)
            return <button key={`${id}-${index}`} className="topster-slot" onClick={() => editing && changeSlot(index, releases[(releases.findIndex(item => item.id === id) + 1 + releases.length) % releases.length].id)} disabled={!editing} aria-label={`${index + 1}번째 탑스터 ${release?.title || '비어 있음'}`}>
              {release ? <><img src={release.cover} alt={`${release.artist} ${release.title}`} /><span>{String(index + 1).padStart(2, '0')}</span></> : <><Plus /><small>앨범 추가</small></>}
            </button>
          })}</div>
          {editing && <div className="topster-picker"><p>바꿀 칸을 먼저 누르거나, 앨범을 선택해 첫 빈자리에 추가하세요.</p><div>{releases.map(release => <button key={release.id} onClick={() => { const empty = topster.indexOf(''); changeSlot(empty >= 0 ? empty : 0, release.id) }}><img src={release.cover} alt="" /><span>{release.title}</span></button>)}</div></div>}
        </div>
        <RatingsPanel reviews={myReviews} />
      </section>
      <ProfileReviews reviews={myReviews} />
      <PeopleDiscovery follows={ctx.follows} toggleFollow={ctx.toggleFollow} />
    </> : <FollowingFeed reviews={feed} />}
  </div>
}

function MusicProfileHeader({ user, reviewCount, visiting = false }: { user: typeof users[number]; reviewCount: number; visiting?: boolean }) {
  return <section className="music-profile-head"><span className="avatar jumbo">{user.avatar}</span><div className="music-profile-copy"><small>{user.handle}</small><h1>{user.nickname}</h1><p>{user.bio}</p><div className="taste-tags"><span>Alternative R&amp;B</span><span>K-Hip-Hop</span><span>Neo Soul</span></div></div><div className="music-profile-numbers"><div><b>{user.followers}</b><span>팔로워</span></div><div><b>{user.following}</b><span>팔로잉</span></div><div><b>{reviewCount}</b><span>리뷰</span></div></div>{visiting && <button className="primary-btn">팔로우</button>}</section>
}

function RatingsPanel({ reviews }: { reviews: Review[] }) {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length : 0
  return <aside className="ratings-panel"><div className="panel-heading"><div><span>RECENT RATINGS</span><h2>최근 남긴 평점</h2></div></div><div className="rating-summary"><div><b>{average.toFixed(1)}</b><span>평균 평점</span></div><div><b>{reviews.length}</b><span>평가한 앨범</span></div></div><div className="compact-ratings">{reviews.length ? reviews.slice(0, 5).map(review => { const release = releases.find(item => item.id === review.releaseId)!; return <Link to={`/release/${release.id}`} key={review.id}><img src={release.cover} alt="" /><div><small>{release.artist}</small><strong>{release.title}</strong><span>{review.createdAt}</span></div><b>{review.score.toFixed(1)}</b></Link> }) : <div className="empty compact">첫 평점을 남겨 음악 취향을 기록해보세요.</div>}</div></aside>
}

function ProfileReviews({ reviews }: { reviews: Review[] }) {
  const written = reviews.filter(review => review.text)
  return <section className="social-reviews"><div className="panel-heading"><div><span>MY REVIEWS</span><h2>내가 남긴 리뷰</h2></div><Link to="/discover">새 리뷰 쓰기 <ChevronRight size={15} /></Link></div>{written.length ? <div className="profile-review-grid">{written.map(review => { const release = releases.find(item => item.id === review.releaseId)!; return <Link to={`/release/${release.id}`} key={review.id}><img src={release.cover} alt="" /><div><span>{release.artist}</span><h3>{release.title}</h3><p>{review.text}</p><footer><b>{review.score.toFixed(1)}</b><small><Heart size={13} /> {review.likes} · <MessageCircle size={13} /> {review.replies.length}</small></footer></div></Link> })}</div> : <div className="empty">글이 담긴 리뷰를 남기면 다른 디거들과 이야기가 시작됩니다.</div>}</section>
}

const tasteMatches = [
  { user: users[1], match: 76, common: 8, unheard: 12, genres: 'Alternative R&B · Neo Soul' },
  { user: users[2], match: 71, common: 6, unheard: 9, genres: 'Soul · Jazz Rap' },
  { user: users[3], match: 64, common: 5, unheard: 15, genres: 'K-Hip-Hop · Boom Bap' },
]

function PeopleDiscovery({ follows, toggleFollow }: { follows: string[]; toggleFollow: (id: string) => Promise<void> }) {
  return <section className="people-discovery"><div className="panel-heading"><div><span>PEOPLE TO DIG WITH</span><h2>당신과 취향이 가까운 디거</h2></div></div><div className="taste-match-grid">{tasteMatches.map(item => <article key={item.user.id}><div className="match-score"><strong>{item.match}%</strong><span>취향 일치</span></div><div className="match-person"><span className="avatar">{item.user.avatar}</span><div><Link to={`/user/${item.user.id}`}>{item.user.nickname}</Link><small>{item.user.handle}</small></div></div><dl><div><dt>공통으로 좋아하는 앨범</dt><dd>{item.common}개</dd></div><div><dt>아직 평가하지 않은 추천 앨범</dt><dd>{item.unheard}개</dd></div><div><dt>공통 선호 장르</dt><dd>{item.genres}</dd></div></dl><div className="match-actions"><Link className="outline-btn" to={`/user/${item.user.id}`}>프로필 보기</Link><button className="primary-btn" onClick={() => toggleFollow(item.user.id)}>{follows.includes(item.user.id) ? '팔로잉' : '팔로우'}</button></div></article>)}</div></section>
}

function FollowingFeed({ reviews }: { reviews: Review[] }) {
  const shown = reviews.length ? reviews : initialSocialFeed
  return <section className="following-feed"><div className="feed-intro"><span>FOLLOWING FEED</span><h2>당신이 고른 사람들의 새 음악</h2><p>팔로우한 디거가 글을 남기거나 탑스터를 바꾸면 여기에 나타납니다.</p></div>{shown.map(review => { const user = review.user || users.find(item => item.id === review.userId) || users[1]; const release = releases.find(item => item.id === review.releaseId) || releases[0]; return <article className="feed-review" key={review.id}><div className="feed-user"><span className="avatar">{user.avatar}</span><div><Link to={`/user/${user.id}`}>{user.nickname}</Link><small>{review.createdAt} · 리뷰를 남겼습니다</small></div></div><Link className="feed-album" to={`/release/${release.id}`}><img src={release.cover} alt="" /><div><small>{release.artist}</small><h3>{release.title}</h3><p>{review.text}</p><footer><b>{review.score.toFixed(1)}</b><span><Heart size={15} /> {review.likes} <MessageCircle size={15} /> {review.replies.length}</span></footer></div></Link></article> })}</section>
}

const initialSocialFeed: Review[] = [
  { id: 'sf1', releaseId: 'afterimage', userId: 'u1', score: 9.2, text: '공백까지 편곡한 앨범. 가장 조용한 순간에 가장 많은 것이 들린다.', likes: 184, createdAt: '2시간 전', replies: [] },
  { id: 'sf2', releaseId: 'petals', userId: 'u2', score: 9.0, text: '한 곡으로 계절의 온도를 바꾸는 목소리.', likes: 121, createdAt: '어제', replies: [] },
]

const hotClips = [
  { id: 'hc1', category: 'K-POP', title: '이번 주 가장 뜨거운 퍼포먼스', channel: 'CRATEDIGGERS PICK', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85' },
  { id: 'hc2', category: 'K-HIPHOP', title: '라이브로 다시 듣는 오늘의 벌스', channel: 'LIVE SESSION', image: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?auto=format&fit=crop&w=900&q=85' },
  { id: 'hc3', category: 'K-POP', title: '무대 뒤에서 완성된 사운드', channel: 'BEHIND THE TRACK', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85' },
]

function HotClipsPage() {
  const [filter, setFilter] = useState('ALL')
  const shown = filter === 'ALL' ? hotClips : hotClips.filter(clip => clip.category === filter)
  return <div className="page section-wrap hot-clips-page"><PageTitle kicker="VERTICAL MUSIC NOW" title="Hot Clip" copy="K-pop과 K-hiphop의 지금을 짧고 선명하게 넘겨보세요." /><div className="filter-row">{['ALL', 'K-POP', 'K-HIPHOP'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="hot-clip-grid">{shown.map(clip => <article key={clip.id}><img src={clip.image} alt="" /><div className="clip-overlay"><span>{clip.category}</span><h2>{clip.title}</h2><p>{clip.channel}</p><button aria-label={`${clip.title} 재생`}><Play fill="currentColor" /></button><a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube에서 보기 <ExternalLink size={14} /></a></div></article>)}</div></div>
}

const eventItems = [
  { id: 'e1', date: '08.02', day: 'SAT', title: 'SEOUL SOUL NIGHT', artist: 'MISO · HANA · LÉON', venue: 'YES24 LIVE HALL', status: '예매 중' },
  { id: 'e2', date: '08.16', day: 'SAT', title: 'NOA: AFTERIMAGE LIVE', artist: 'NOA', venue: 'MUSINSA GARAGE', status: '예매 예정' },
  { id: 'e3', date: '09.05', day: 'FRI', title: '808 ROOM SESSION', artist: 'DUSTY · YUNB · GUESTS', venue: 'NODEUL ISLAND', status: '예매 중' },
]

function EventsPage() {
  return <div className="page section-wrap events-page"><PageTitle kicker="LIVE CALENDAR" title="공연" copy="놓치고 싶지 않은 힙합과 R&B 공연 일정을 모았습니다." /><div className="event-filter"><button className="active">전체</button><button>이번 달</button><button>서울</button><button>페스티벌</button></div><div className="event-list">{eventItems.map((event, index) => <article key={event.id}><div className="event-date"><b>{event.date}</b><span>{event.day}</span></div><div className="event-number">0{index + 1}</div><div className="event-copy"><small>{event.artist}</small><h2>{event.title}</h2><p>{event.venue}</p></div><span className={event.status === '예매 중' ? 'event-status on' : 'event-status'}>{event.status}</span><ChevronRight /></article>)}</div></div>
}

function ReleasePage(ctx: AppContext) {
  const { id } = useParams(); const release = releases.find(r => r.id === id) || releases[0]
  const [sort, setSort] = useState('최신순'); const [rating, setRating] = useState(8.0); const [text, setText] = useState('')
  const [crateStatus, setCrateStatus] = useState('')
  const reviewList = useMemo(() => {
    const list = ctx.reviews.filter(r => r.releaseId === release.id)
    if (sort === '베스트') return [...list].sort((a, b) => b.likes - a.likes)
    if (sort === '별점 높은순') return [...list].sort((a, b) => b.score - a.score)
    if (sort === '별점 낮은순') return [...list].sort((a, b) => a.score - b.score)
    if (sort === '팔로잉') return list.filter(r => ctx.follows.includes(r.userId))
    return list
  }, [ctx.reviews, ctx.follows, release.id, sort])
  const submit = async () => { if (!ctx.loggedIn) return ctx.openAuth(); await ctx.addReview(release.id, rating, text.trim()); setText('') }
  return <div className="release-page">
    <section className="release-hero band"><img className="release-cover" src={release.cover} alt="" /><div className="release-info"><div className="tags"><span className="type-tag static">{release.type}</span>{release.genres.map(g => <span key={g}>{g}</span>)}</div><h1>{release.title}</h1><h2>{release.artist}</h2><p>{release.description}</p><div className="release-score"><strong>{release.score.toFixed(1)}</strong><div><span>COMMUNITY SCORE</span><b>{release.ratings}개의 평가</b>{release.ratings < 10 && <small>평가가 더 필요해요</small>}</div></div><div className="stream-links">{release.links.spotify && <a href={release.links.spotify} target="_blank"><Play size={15} /> Spotify</a>}{release.links.apple && <a href={release.links.apple} target="_blank"><Headphones size={15} /> Apple Music</a>}{release.links.youtube && <a href={release.links.youtube} target="_blank"><Play size={15} /> YouTube Music</a>}</div></div>
      <div className="track-list"><span>TRACKLIST</span>{release.tracks.map((t, i) => <div key={t}><b>{String(i + 1).padStart(2, '0')}</b><span>{t}</span></div>)}</div>
    </section>
    <section className="album-social-entry section-wrap"><div><span>ALBUM LOUNGE</span><h2>지금 이 앨범을 듣는 사람들과 이야기하세요</h2><p>가벼운 감상은 라운지에서 나누고, 간직할 음악은 내 크레이트에 담아 기록하세요.</p><div className="lounge-peek"><span className="avatar mini">SA</span><span className="avatar mini">LN</span><span className="avatar mini">80</span><b>지금 23명 참여 중</b></div></div><div><Link className="primary-btn lounge-btn" to={`/release/${release.id}/lounge`}><MessageCircle size={17} /> 라운지 참여</Link><label className="crate-status-select"><Disc3 size={16} /><select value={crateStatus} onChange={event => setCrateStatus(event.target.value)}><option value="">내 크레이트에 담기</option><option>듣고 싶어요</option><option>듣는 중</option><option>들었어요</option></select><ChevronDown size={14} /></label><button className="outline-btn" onClick={() => document.getElementById('review-compose')?.scrollIntoView({ behavior: 'smooth' })}><PenLine size={16} /> 평가하기</button></div></section>
    <section id="review-compose" className="review-compose section-wrap"><div><span>MY RATING</span><div className="rating-input"><strong>{rating.toFixed(1)}</strong><input aria-label="앨범 평점" type="range" min="0" max="10" step="0.1" value={rating} onChange={e => setRating(+e.target.value)} /></div></div><div className="write-review"><textarea value={text} onChange={e => setText(e.target.value.slice(0, 300))} placeholder="이 음악을 한 문장으로 남겨보세요." /><div><small>{text.length}/300</small><button className="primary-btn" onClick={submit}><PenLine size={16} /> 평가 남기기</button></div></div></section>
    <section className="section-wrap reviews-section"><div className="review-head"><h2>한줄평 <span>{reviewList.length}</span></h2><select value={sort} onChange={e => setSort(e.target.value)}>{['최신순', '베스트', '팔로잉', '별점 높은순', '별점 낮은순'].map(s => <option key={s}>{s}</option>)}</select></div>{reviewList.map(r => <ReviewItem key={r.id} review={r} {...ctx} />)}</section>
  </div>
}

function ReviewItem({ review, loggedIn, openAuth, liked, toggleLike: persistLike, follows, toggleFollow, addReply: persistReply }: AppContext & { review: Review }) {
  const user = review.user || users.find(u => u.id === review.userId) || users[0]; const [replyOpen, setReplyOpen] = useState(false); const [reply, setReply] = useState('')
  const isLiked = liked.includes(review.id), isFollowing = follows.includes(user.id)
  const like = () => { if (!loggedIn) return openAuth(); persistLike(review.id) }
  const addReply = async () => { if (!loggedIn) return openAuth(); if (!reply.trim()) return; await persistReply(review.id, reply.trim()); setReply('') }
  return <article className="review-item"><div className="review-user"><Link to={`/user/${user.id}`} className="avatar">{user.avatar}</Link><div><Link to={`/user/${user.id}`}><strong>{user.nickname}</strong></Link><small>{review.createdAt}</small></div>{user.id !== 'me' && <button className={isFollowing ? 'follow active' : 'follow'} onClick={() => toggleFollow(user.id)}>{isFollowing ? '팔로잉' : '팔로우'}</button>}</div><div className="review-body"><strong className="review-score">{review.score.toFixed(1)}</strong><p>{review.text || <i>별점만 남겼습니다.</i>}</p><div className="review-actions"><button className={isLiked ? 'liked' : ''} onClick={like}><Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /> {review.likes + (isLiked ? 1 : 0)}</button><button onClick={() => setReplyOpen(!replyOpen)}><MessageCircle size={16} /> 답글 {review.replies.length || ''}</button><button title="신고"><ShieldAlert size={16} /></button><button title="더 보기"><MoreHorizontal size={17} /></button></div></div>{review.replies.length > 0 && <div className="replies">{review.replies.map(x => { const u = users.find(v => v.id === x.userId) || users[0]; return <div key={x.id}><span className="avatar mini">{u.avatar}</span><p><strong>{u.nickname}</strong> {x.text}<small>{x.createdAt}</small></p></div> })}</div>}{replyOpen && <div className="reply-box"><input value={reply} onChange={e => setReply(e.target.value)} placeholder="답글을 입력하세요" /><button className="icon-btn dark" onClick={addReply}><Send size={16} /></button></div>}</article>
}

function MagazinePage() { return <div className="page section-wrap"><PageTitle kicker="CRATEDIGGERS EDITORIAL" title="매거진" copy="음악을 빠르게 소비하는 대신 오래 들여다보는 글." /><div className="category-tabs">{['전체', '리뷰', '비평', '인터뷰', '큐레이션', '뉴스'].map(x => <button key={x}>{x}</button>)}</div><div className="mag-list">{articles.map((a, i) => <article key={a.id}><span>0{i + 1}</span><img src={a.cover} alt="" /><div><small>{a.category}</small><h2>{a.title}</h2><p>{a.deck}</p><b>{a.date} · {a.readTime}</b></div></article>)}</div></div> }

function CommunityPage(ctx: AppContext) {
  const [board, setBoard] = useState('전체'); const [composer, setComposer] = useState(false); const [title, setTitle] = useState(''); const [body, setBody] = useState('')
  const shown = board === '전체' ? ctx.posts : ctx.posts.filter(p => p.board === board)
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!ctx.loggedIn) return ctx.openAuth(); if (!title.trim()) return; await ctx.addPost({ board: board === '전체' ? '자유' : board as Post['board'], title, body }); setComposer(false); setTitle(''); setBody('') }
  return <div className="page section-wrap"><PageTitle kicker="OPEN FLOOR" title="커뮤니티" copy="새 음악, 오래된 음악, 그리고 그 사이의 모든 이야기." /><div className="community-bar"><div className="category-tabs">{['전체', '자유', '국내 음악', '해외 음악'].map(x => <button className={board === x ? 'active' : ''} onClick={() => setBoard(x)} key={x}>{x}</button>)}</div><button className="primary-btn" onClick={() => ctx.loggedIn ? setComposer(true) : ctx.openAuth()}><PenLine size={16} /> 글쓰기</button></div>{composer && <form className="post-composer" onSubmit={submit}><input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" autoFocus /><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="이야기를 들려주세요." /><div><button type="button" onClick={() => setComposer(false)}>취소</button><button className="primary-btn">등록</button></div></form>}<div className="post-list">{shown.map(p => <article key={p.id}><div><span className="tag">{p.board}</span><h3>{p.title}</h3><p>{p.body}</p><small>{p.author} · {p.date}</small></div><div><span><Heart size={15} /> {p.likes}</span><span><MessageCircle size={15} /> {p.comments}</span></div></article>)}</div></div>
}

function SearchPage({ reviews }: { reviews: Review[] }) {
  const [q, setQ] = useState(''); const needle = q.toLowerCase()
  const foundReleases = releases.filter(r => `${r.title} ${r.artist} ${r.genres.join(' ')}`.toLowerCase().includes(needle))
  const foundUsers = users.filter(u => `${u.nickname} ${u.handle}`.toLowerCase().includes(needle))
  return <div className="page section-wrap search-page"><PageTitle kicker="FIND YOUR SOUND" title="통합 검색" /><div className="search-input"><Search /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="앨범, 아티스트, 리뷰어를 검색하세요" /></div>{q && <><h3 className="result-label">작품 <span>{foundReleases.length}</span></h3><div className="search-release-list">{foundReleases.map(r => <ReleaseCard key={r.id} release={r} />)}</div><h3 className="result-label">리뷰어 <span>{foundUsers.length}</span></h3><div className="user-results">{foundUsers.map(u => <Link to={`/user/${u.id}`} key={u.id}><span className="avatar">{u.avatar}</span><div><b>{u.nickname}</b><small>{u.handle} · 리뷰 {reviews.filter(r => r.userId === u.id).length}</small></div></Link>)}</div></>}</div>
}

function NotificationsPage() { const items = [{ icon: Heart, text: 'soularchive님이 회원님의 리뷰를 좋아합니다.', time: '12분 전' }, { icon: UserRound, text: '808room님이 회원님을 팔로우하기 시작했습니다.', time: '2시간 전' }, { icon: MessageCircle, text: 'AFTERIMAGE 한줄평에 새 답글이 달렸습니다.', time: '어제' }]; return <div className="page narrow section-wrap"><PageTitle kicker="ACTIVITY" title="알림" /> <div className="notification-list">{items.map((n, i) => <div key={i}><span><n.icon size={18} /></span><p>{n.text}<small>{n.time}</small></p>{i === 0 && <i />}</div>)}</div></div> }

function ProfileRoute({ reviews, follows }: { reviews: Review[]; follows: string[] }) { const { id } = useParams(); return <ProfilePage userId={id || 'u1'} reviews={reviews} follows={follows} /> }
function ProfilePage({ userId, reviews, follows }: { userId: string; reviews: Review[]; follows: string[] }) {
  const user = reviews.find(r => r.userId === userId)?.user || users.find(u => u.id === userId) || users[0], mine = reviews.filter(r => r.userId === user.id)
  return <div className="page section-wrap profile-page"><section className="profile-head"><span className="avatar jumbo">{user.avatar}</span><div><small>{user.handle}</small><h1>{user.nickname}</h1><p>{user.bio}</p></div>{user.id === 'me' && <Link className="outline-btn" to="/admin">관리자 센터</Link>}</section><div className="profile-stats"><div><b>{user.followers}</b><span>팔로워</span></div><div><b>{user.following}</b><span>팔로잉</span></div><div><b>{mine.length}</b><span>리뷰</span></div><div><b>{user.likes.toLocaleString()}</b><span>받은 좋아요</span></div><div><b>{user.best}</b><span>베스트</span></div></div>{user.id === 'me' && <section><h2 className="sub-title">팔로잉</h2><div className="following-row">{users.filter(u => follows.includes(u.id)).map(u => <Link to={`/user/${u.id}`} key={u.id}><span className="avatar">{u.avatar}</span><b>{u.nickname}</b></Link>)}</div></section>}<section><h2 className="sub-title">작성한 리뷰</h2>{mine.length ? mine.map(r => { const rel = releases.find(x => x.id === r.releaseId)!; return <Link to={`/release/${rel.id}`} className="profile-review" key={r.id}><img src={rel.cover} alt="" /><div><small>{rel.artist}</small><h3>{rel.title}</h3><p>{r.text}</p></div><b>{r.score.toFixed(1)}</b></Link> }) : <div className="empty">아직 작성한 리뷰가 없습니다.</div>}</section></div>
}

function AdminPage() {
  const [drafts, setDrafts] = useState<any[]>([]); const [name, setName] = useState(''); const [artist, setArtist] = useState(''); const [type, setType] = useState('ALBUM')
  const add = (e: FormEvent) => { e.preventDefault(); if (!name || !artist) return; setDrafts([{ id: Date.now(), name, artist, type, status: '검수 대기' }, ...drafts]); setName(''); setArtist('') }
  return <div className="page section-wrap admin-page"><PageTitle kicker="CONTROL ROOM" title="관리자 센터" copy="앨범, 매거진, 신고와 회원을 한곳에서 관리합니다." /><div className="admin-stats"><div><span>공개 작품</span><b>{releases.length}</b></div><div><span>검수 대기</span><b>{drafts.length}</b></div><div><span>미처리 신고</span><b>3</b></div><div><span>오늘 가입</span><b>12</b></div></div><div className="admin-grid"><section><h2>새 작품 등록</h2><form onSubmit={add}><label>아티스트<input value={artist} onChange={e => setArtist(e.target.value)} placeholder="아티스트명" /></label><label>작품명<input value={name} onChange={e => setName(e.target.value)} placeholder="앨범 또는 싱글명" /></label><label>유형<select value={type} onChange={e => setType(e.target.value)}><option>ALBUM</option><option>EP</option><option>MIXTAPE</option><option>SINGLE</option></select></label><button className="primary-btn"><Plus size={16} /> 초안 만들기</button></form><p className="admin-note">MusicBrainz와 Cover Art Archive 연동용 Pages Function이 준비되어 있습니다.</p></section><section><h2>검수 대기</h2>{drafts.length ? drafts.map(d => <div className="draft" key={d.id}><span className="cover-placeholder"><Disc3 /></span><div><small>{d.type}</small><b>{d.artist} · {d.name}</b><span>{d.status}</span></div><button className="outline-btn" onClick={() => setDrafts(drafts.filter(x => x.id !== d.id))}>공개</button></div>) : <div className="empty">검수할 초안이 없습니다.</div>}</section></div></div>
}

function PageTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) { return <div className="page-title"><span>{kicker}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</div> }

function AuthModal({ onClose }: { onClose: () => void }) {
  const [signup, setSignup] = useState(false), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [nickname, setNickname] = useState('')
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const submit = async () => {
    if (!supabase) return
    setBusy(true); setError(''); setNotice('')
    if (signup) {
      const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } })
      if (authError) setError(authError.message); else setNotice('인증 메일을 보냈습니다. 이메일을 확인해주세요.')
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) setError('이메일 또는 비밀번호를 확인해주세요.'); else onClose()
    }
    setBusy(false)
  }
  const kakao = async () => {
    if (!supabase) return
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo: window.location.origin } })
    if (authError) setError(authError.message)
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="auth-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={onClose}><X /></button><Disc3 size={32} /><small>{BRAND}</small><h2>{signup ? '새 계정 만들기' : '다시 오신 것을 환영해요'}</h2><p>좋은 음악을 발견하고 당신의 한줄을 남겨보세요.</p><button className="kakao" onClick={kakao}>카카오로 계속하기</button><div className="or"><span>또는</span></div>{signup && <input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="닉네임" />}<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" />{error && <p className="form-error">{error}</p>}{notice && <p className="form-notice">{notice}</p>}<button className="primary-btn full" disabled={busy || !email || !password || (signup && !nickname)} onClick={submit}>{busy ? '처리 중...' : signup ? '가입하기' : '이메일로 로그인'}</button><button className="text-btn" onClick={() => setSignup(!signup)}>{signup ? '이미 계정이 있나요? 로그인' : '처음이신가요? 회원가입'}</button></div></div>
}

function MobileNav() { return <nav className="mobile-nav"><NavLink to="/" end><Disc3 /><span>TODAY</span></NavLink><NavLink to="/discover"><Search /><span>DISCOVER</span></NavLink><NavLink to="/my-crate"><UserRound /><span>MY CRATE</span></NavLink><NavLink to="/community"><Users /><span>COMMUNITY</span></NavLink></nav> }

export default App
