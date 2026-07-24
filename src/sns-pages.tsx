import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Disc3, Heart, ListMusic, MessageCircle, PenLine, Play, Plus, Save, Search, Send, Share2, Star, UserPlus } from 'lucide-react'
import { articles, initialReviews, releases, users, type Review, type User } from './data'

type SocialProps = {
  reviews: Review[]
  follows: string[]
  toggleFollow: (id: string) => Promise<void>
}

const defaultTopster = ['afterimage', 'blue-hour', 'no-skip', 'petals', 'heat-check', 'soft-focus', 'blue-hour', 'afterimage', 'petals']
const topsters: Record<string, string[]> = {
  me: defaultTopster,
  u1: ['petals', 'afterimage', 'soft-focus', 'blue-hour', 'no-skip', 'heat-check', 'petals', 'soft-focus', 'afterimage'],
  u2: ['blue-hour', 'soft-focus', 'petals', 'afterimage', 'no-skip', 'heat-check', 'blue-hour', 'petals', 'soft-focus'],
  u3: ['heat-check', 'no-skip', 'afterimage', 'blue-hour', 'petals', 'soft-focus', 'no-skip', 'heat-check', 'afterimage'],
}

const tasteMatches = [
  { user: users[1], match: 76, common: 8, unheard: 12 },
  { user: users[2], match: 71, common: 6, unheard: 9 },
  { user: users[3], match: 64, common: 5, unheard: 15 },
]

type LoungeStatus = {
  releaseId: string
  online: number
  messageCount: number
  live: boolean
  latestMessage: string
  latestUser: string
}

const loungeStatuses: LoungeStatus[] = [
  { releaseId: 'afterimage', online: 23, messageCount: 148, live: true, latestMessage: '마지막 트랙의 여운이 진짜 길다…', latestUser: 'soularchive' },
  { releaseId: 'blue-hour', online: 12, messageCount: 86, live: true, latestMessage: '2번 트랙 드럼 질감 얘기해요', latestUser: 'liner.notes' },
  { releaseId: 'soft-focus', online: 7, messageCount: 42, live: false, latestMessage: '밤에 들으니까 완전히 다르게 들림', latestUser: '808room' },
]

export function TodayPage() {
  const todayReleases = releases.slice(0, 4)
  return <div className="today-page section-wrap">
    <header className="today-heading"><div><span>THURSDAY · JUL 23</span><h1>오늘 나온 음악,<br />지금 함께 듣기</h1><p>새로 발매된 앨범의 첫인상을 라운지에서 나누고, 내 감상은 평가로 남겨보세요.</p></div><div className="today-pulse"><i /><span>라운지 접속 중</span><b>42</b></div></header>
    <LiveLounges />
    <section className="today-releases"><header><div><span>OUT TODAY</span><h2>오늘 발매된 앨범</h2></div><Link to="/discover">전체 신보 보기 <ChevronRight /></Link></header><div>{todayReleases.map((release, index) => { const lounge = loungeStatuses.find(item => item.releaseId === release.id); return <article key={release.id} className={index === 0 ? 'featured' : ''}><Link className="today-cover" to={`/release/${release.id}`}><img src={release.cover} alt="" />{lounge?.live && <span><i /> LIVE</span>}</Link><div className="today-release-copy"><small>{release.type} · {release.date}</small><Link to={`/release/${release.id}`}><h3>{release.title}</h3></Link><p>{release.artist}</p><div className="genres">{release.genres.slice(0, 2).map(genre => <span key={genre}>{genre}</span>)}</div><div className="today-release-meta"><b><Star size={14} fill="currentColor" /> {release.score.toFixed(1)}</b><span>{release.ratings} ratings</span></div><div className="today-release-actions"><Link className="primary-btn" to={`/release/${release.id}/lounge`}><MessageCircle size={15} /> {lounge ? `${lounge.online}명과 대화 중` : '라운지 열기'}</Link><Link className="outline-btn" to={`/release/${release.id}`}>평가하기</Link></div></div></article> })}</div></section>
    <div className="today-bottom"><ReleaseCalendar /><RecentConversations /></div>
  </div>
}

function ReleaseCalendar() {
  const days = [{ day: '24', week: 'FRI', items: [releases[4]] }, { day: '25', week: 'SAT', items: [releases[5], releases[2]] }, { day: '31', week: 'FRI', items: [releases[3]] }]
  return <section className="release-calendar"><header><span>THIS WEEK</span><h2>이번 주 발매 일정</h2></header>{days.map(entry => <article key={entry.day}><div><b>{entry.day}</b><span>{entry.week}</span></div><div>{entry.items.map(release => <Link to={`/release/${release.id}`} key={release.id}><img src={release.cover} alt="" /><p><b>{release.title}</b><span>{release.artist} · {release.type}</span></p><ChevronRight /></Link>)}</div></article>)}</section>
}

function RecentConversations() {
  return <section className="recent-talks"><header><span>RECENTLY ACTIVE</span><h2>최근 활발한 대화</h2></header>{loungeStatuses.map(status => { const release = releases.find(item => item.id === status.releaseId) || releases[0]; return <Link to={`/release/${release.id}/lounge`} key={release.id}><img src={release.cover} alt="" /><div><small>{status.latestUser}</small><p>{status.latestMessage}</p><span>{release.artist} · {release.title}</span></div><aside><b>{status.messageCount}</b><span>messages</span></aside></Link> })}</section>
}

export function HomeFeedPage(props: SocialProps) {
  const [tab, setTab] = useState<'following' | 'for-you'>('following')
  const followedReviews = props.reviews.filter(review => props.follows.includes(review.userId) && review.text)
  const reviews = followedReviews.length ? followedReviews : initialReviews.filter(review => review.userId !== 'me' && review.text).slice(0, 3)

  return <div className="sns-page section-wrap">
    <header className="sns-heading"><div><span>YOUR MUSIC CIRCLE</span><h1>HOME</h1><p>음악으로 이어진 사람들의 취향과 기록을 만나보세요.</p></div><div className="sns-tabs"><button className={tab === 'following' ? 'active' : ''} onClick={() => setTab('following')}>FOLLOWING</button><button className={tab === 'for-you' ? 'active' : ''} onClick={() => setTab('for-you')}>FOR YOU</button></div></header>
    <LiveLounges />
    {tab === 'following' ? <div className="home-layout"><main className="activity-feed">
      <TopsterActivity user={users[2]} label="새 탑스터를 공개했습니다" />
      {reviews.map(review => <ReviewActivity key={review.id} review={review} />)}
      <CollectionActivity user={users[3]} />
    </main><aside className="feed-aside"><TastePeople compact {...props} /><PeriodCard /></aside></div> : <ForYou {...props} />}
  </div>
}

const loungeMeta = [
  { release: releases[0], online: 23, messages: 148, last: '마지막 트랙의 여운이 진짜 길다…', hot: true },
  { release: releases[1], online: 12, messages: 86, last: '2번 트랙 드럼 질감 얘기해요', hot: true },
  { release: releases[5], online: 7, messages: 42, last: '밤에 들으니까 완전히 다르게 들림', hot: false },
]

function LiveLounges() {
  return <section className="live-lounges"><header><div><span>LIVE LOUNGES</span><h2>지금 대화가 흐르는 앨범</h2></div><small>앨범마다 열려 있는 상시 채팅방</small></header><div>{loungeMeta.map(item => <Link to={`/release/${item.release.id}/lounge`} key={item.release.id}><img src={item.release.cover} alt="" /><div><span className={item.hot ? 'live-dot hot' : 'live-dot'}>{item.hot ? 'LIVE' : 'OPEN'}</span><h3>{item.release.title}</h3><p>{item.last}</p><small>{item.online}명 접속 · 메시지 {item.messages}</small></div><ChevronRight /></Link>)}</div></section>
}

const loungeMessages = [
  { id: 1, user: users[1], time: '오후 10:18', text: '다들 지금 몇 번 트랙 듣고 있어요?', track: '', own: false },
  { id: 2, user: users[2], time: '오후 10:19', text: '저는 4번이요. 베이스가 제일 인상적이에요.', track: '04 · No Signal', own: false },
  { id: 3, user: users[0], time: '오후 10:20', text: '나도 4번! 헤드폰으로 들으니까 공간감이 완전 다르네', track: '', own: true },
  { id: 4, user: users[3], time: '오후 10:24', text: '후반부가 조용해지는 순간부터 앨범 제목이 이해되는 느낌.', track: '06 · Soft Landing', own: false },
  { id: 5, user: users[1], time: '오후 10:27', text: '맞아요. 리뷰 쓰기 전에 여기서 더 얘기해보고 싶었음.', track: '', own: false },
]

export function AlbumLoungePage() {
  const { id } = useParams()
  const release = releases.find(item => item.id === id) || releases[0]
  const base = loungeMeta.find(item => item.release.id === release.id) || { online: 4, messages: 18, hot: false }
  const [text, setText] = useState('')
  const [crateStatus, setCrateStatus] = useState('')
  const [messages, setMessages] = useState(loungeMessages)
  const send = () => { if (!text.trim()) return; setMessages(items => [...items, { id: Date.now(), user: users[0], time: '방금', text: text.trim(), track: '', own: true }]); setText('') }
  return <div className="lounge-page"><aside className="lounge-album"><Link to={`/release/${release.id}`}><ArrowLeft size={16} /> 앨범으로 돌아가기</Link><img src={release.cover} alt={`${release.artist} ${release.title}`} /><span>{release.type} · {release.date}</span><h1>{release.title}</h1><h2>{release.artist}</h2><div className="lounge-score"><Star fill="currentColor" /><b>{release.score.toFixed(1)}</b><small>{release.ratings} ratings</small></div><div className="lounge-crate-actions"><label><Disc3 size={15} /><select value={crateStatus} onChange={event => setCrateStatus(event.target.value)}><option value="">내 크레이트에 담기</option><option>듣고 싶어요</option><option>듣는 중</option><option>들었어요</option></select><ChevronDown size={14} /></label><Link className="outline-btn" to={`/release/${release.id}#review-compose`}>평가하기</Link></div></aside><main className="lounge-room"><header><div><span className={`live-dot ${base.hot ? 'hot' : ''}`}>{base.hot ? 'LIVE' : 'OPEN'}</span><h2>{release.title} 라운지</h2><p>{release.artist} · 함께 듣는 중</p></div><div><span className="lounge-avatars"><i>SA</i><i>LN</i><i>80</i></span><b>{base.online}명</b></div></header><section className="chat-stream"><div className="chat-day"><span>오늘</span></div><div className="room-notice">앨범과 관련된 이야기를 편하게 나눠보세요. 스포일러가 있다면 먼저 알려주세요.</div>{messages.map((message, index) => { const previous = messages[index - 1]; const grouped = previous && previous.user.id === message.user.id && previous.own === message.own; return <article className={`${message.own ? 'mine' : 'theirs'} ${grouped ? 'grouped' : ''}`} key={message.id}>{!message.own && !grouped && <Link className="avatar" to={`/user/${message.user.id}`}>{message.user.avatar}</Link>}<div className="message-wrap">{!message.own && !grouped && <Link className="message-name" to={`/user/${message.user.id}`}>{message.user.nickname}</Link>}{message.track && <span className="track-chip">{message.track}</span>}<div className="bubble-row">{message.own && <span className="message-meta"><b>1</b>{message.time}</span>}<p>{message.text}</p>{!message.own && <span className="message-meta">{message.time}</span>}</div></div></article> })}</section><footer className="chat-compose"><div><button className="chat-plus" aria-label="첨부하기">+</button><input value={text} onChange={event => setText(event.target.value)} onKeyDown={event => event.key === 'Enter' && send()} placeholder="메시지 입력" /><button onClick={send} aria-label="메시지 보내기"><Send /></button></div></footer></main></div>
}

function ActivityHead({ user, text, time = '2시간 전' }: { user: User; text: string; time?: string }) {
  return <div className="activity-head"><Link className="avatar" to={`/user/${user.id}`}>{user.avatar}</Link><div><Link to={`/user/${user.id}`}>{user.nickname}</Link><p>{text} · {time}</p></div><button aria-label="더 보기">•••</button></div>
}

function ReviewActivity({ review }: { review: Review }) {
  const user = review.user || users.find(item => item.id === review.userId) || users[1]
  const release = releases.find(item => item.id === review.releaseId) || releases[0]
  return <article className="activity-card"><ActivityHead user={user} text="앨범 리뷰를 남겼습니다" /><Link className="review-object" to={`/release/${release.id}`}><img src={release.cover} alt="" /><div><small>{release.artist}</small><h2>{release.title}</h2><strong><Star size={15} fill="currentColor" /> {review.score.toFixed(1)}</strong><p>{review.text}</p></div></Link><ActivityActions likes={review.likes} comments={review.replies.length} /></article>
}

function TopsterActivity({ user, label }: { user: User; label: string }) {
  return <article className="activity-card"><ActivityHead user={user} text={label} time="48분 전" /><Link to={`/user/${user.id}`} className="feed-topster"><div className="topster-mini">{(topsters[user.id] || defaultTopster).map((id, i) => <img key={`${id}-${i}`} src={releases.find(r => r.id === id)?.cover} alt="" />)}</div><div><span>JULY ROTATION</span><h2>요즘 가장 자주 꺼내 듣는 9장</h2><p>지금의 취향을 한 장의 크레이트에 담았습니다.</p></div></Link><ActivityActions likes={128} comments={18} /></article>
}

function CollectionActivity({ user }: { user: User }) {
  return <article className="activity-card"><ActivityHead user={user} text="앨범 리스트를 공개했습니다" time="어제" /><div className="list-object"><div>{releases.slice(1, 5).map(r => <img key={r.id} src={r.cover} alt="" />)}</div><span>ALBUM LIST · 12 TRACKS</span><h2>비 오는 밤을 위한 R&amp;B</h2><p>낮은 조도와 긴 여운을 가진 앨범들.</p></div><ActivityActions likes={74} comments={9} /></article>
}

function ActivityActions({ likes, comments }: { likes: number; comments: number }) { return <footer className="activity-actions"><button><Heart size={17} /> {likes}</button><button><MessageCircle size={17} /> {comments}</button><span>음악 객체와 연결된 활동</span></footer> }

function ForYou(props: SocialProps) {
  return <div className="for-you-layout"><section className="for-you-lead"><div className="block-title"><span>POPULAR TOPSTER</span><h2>지금 반응이 좋은 취향 보드</h2></div><TopsterActivity user={users[1]} label="대표 탑스터를 변경했습니다" /></section><TastePeople {...props} /><section className="recommend-albums"><div className="block-title"><span>UNRATED FOR YOU</span><h2>아직 평가하지 않은 추천 앨범</h2></div><div>{releases.slice(2, 6).map(release => <Link to={`/release/${release.id}`} key={release.id}><img src={release.cover} alt="" /><b>{release.title}</b><small>{release.artist}</small><span>취향 유사 사용자 82%가 좋아해요</span></Link>)}</div></section><section className="recommend-review"><div className="block-title"><span>REVIEW TO READ</span><h2>당신에게 맞는 리뷰</h2></div><ReviewActivity review={initialReviews.find(r => r.userId === 'u1') || initialReviews[0]} /></section></div>
}

function TastePeople({ follows, toggleFollow, compact = false }: SocialProps & { compact?: boolean }) {
  return <section className={`taste-people ${compact ? 'compact' : ''}`}><div className="block-title"><span>PEOPLE TO FOLLOW</span><h2>취향이 비슷한 사람</h2></div>{tasteMatches.slice(0, compact ? 2 : 3).map(item => <article key={item.user.id}><Link className="avatar" to={`/user/${item.user.id}`}>{item.user.avatar}</Link><div><Link to={`/user/${item.user.id}`}>{item.user.nickname}</Link><p>취향 {item.match}% 일치 · 공통 앨범 {item.common}개</p><small>아직 평가하지 않은 추천 {item.unheard}개</small></div><button onClick={() => toggleFollow(item.user.id)}>{follows.includes(item.user.id) ? '팔로잉' : '팔로우'}</button></article>)}</section>
}

function PeriodCard() { return <Link to="/my-crate" className="period-card"><CalendarDays /><span>2026 MID-YEAR WRAP</span><h3>올해의 음악이<br />쌓이고 있어요</h3><p>평가 24개로 결산 준비도 68%</p><i><b /></i></Link> }

export function DiscoverHubPage() {
  const [tab, setTab] = useState<'추천' | '신보' | '매거진' | 'Hot Clip' | '공연'>('추천')
  const tabs = ['추천', '신보', '매거진', 'Hot Clip', '공연'] as const
  return <div className="sns-page section-wrap discover-hub"><header className="sns-heading"><div><span>DIG DEEPER</span><h1>DISCOVER</h1><p>새 앨범부터 읽을거리와 공연까지, 다음 취향을 발견하세요.</p></div></header><div className="discover-tabs">{tabs.map(item => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
    {tab === '추천' && <><section className="discover-feature"><div><span>CURATED FOR YOUR CRATE</span><h2>당신의 취향에서<br />한 걸음 더 멀리</h2><p>Alternative R&amp;B와 Neo Soul 평가를 바탕으로 골랐어요.</p><Link to="/release/soft-focus">추천 앨범 보기 <ChevronRight /></Link></div><img src={releases[5].cover} alt="" /></section><DiscoverReleases title="이번 주 추천 앨범" items={releases.slice(0, 4)} /><ArticleStrip /></>}
    {tab === '신보' && <DiscoverReleases title="운영자가 선별한 최신 발매" items={releases} />}
    {tab === '매거진' && <ArticleStrip full />}
    {tab === 'Hot Clip' && <ClipStrip />}
    {tab === '공연' && <EventStrip />}
  </div>
}

function DiscoverReleases({ title, items }: { title: string; items: typeof releases }) { return <section className="discover-block"><div className="block-title"><span>NEW IN THE CRATE</span><h2>{title}</h2></div><div className="discover-release-grid">{items.map(r => <Link to={`/release/${r.id}`} key={r.id}><img src={r.cover} alt="" /><span>{r.type} · {r.date}</span><h3>{r.title}</h3><p>{r.artist}</p><b><Star size={14} fill="currentColor" /> {r.score.toFixed(1)}</b></Link>)}</div></section> }
function ArticleStrip({ full = false }: { full?: boolean }) { return <section className="discover-block"><div className="block-title"><span>EDITORIAL</span><h2>깊이 읽는 음악</h2></div><div className={`discover-articles ${full ? 'full' : ''}`}>{articles.map((a, i) => <article key={a.id}><img src={a.cover} alt="" /><div><span>0{i + 1} · {a.category}</span><h3>{a.title}</h3><p>{a.deck}</p><small>{a.date} · {a.readTime}</small></div></article>)}</div></section> }
function ClipStrip() { return <section className="discover-block"><div className="block-title"><span>VERTICAL MUSIC NOW</span><h2>Hot Clip</h2></div><div className="discover-clips">{releases.slice(0, 3).map((r, i) => <article key={r.id}><img src={r.cover} alt="" /><Play fill="currentColor" /><span>{i === 1 ? 'K-HIPHOP' : 'R&B'}</span><h3>{r.artist}의 지금을 포착한 라이브</h3><p>CRATEDIGGERS SESSION</p></article>)}</div></section> }
function EventStrip() { const events = [['08.02','SEOUL SOUL NIGHT','MISO · HANA · LÉON','YES24 LIVE HALL'],['08.16','NOA: AFTERIMAGE LIVE','NOA','MUSINSA GARAGE'],['09.05','808 ROOM SESSION','DUSTY · YUNB','NODEUL ISLAND']]; return <section className="discover-block"><div className="block-title"><span>LIVE CALENDAR</span><h2>다가오는 공연</h2></div><div className="discover-events">{events.map(event => <article key={event[1]}><b>{event[0]}</b><div><small>{event[2]}</small><h3>{event[1]}</h3><p>{event[3]}</p></div><button>예매 정보 <ChevronRight /></button></article>)}</div></section> }

export function CrateProfileRoute(props: SocialProps & { self?: boolean }) {
  const { id } = useParams()
  return <CrateProfilePage {...props} userId={props.self ? 'me' : id || 'u1'} />
}

function CrateProfilePage({ userId, reviews, follows, toggleFollow }: SocialProps & { userId: string }) {
  const isMine = userId === 'me'
  const user = users.find(item => item.id === userId) || users[0]
  const userReviews = reviews.filter(review => review.userId === user.id)
  const shownReviews = userReviews.length ? userReviews : initialReviews.filter(review => review.userId === user.id)
  const [crate, setCrate] = useState(topsters[user.id] || defaultTopster)
  const average = useMemo(() => shownReviews.length ? shownReviews.reduce((sum, item) => sum + item.score, 0) / shownReviews.length : 0, [shownReviews])

  return <div className="sns-page section-wrap crate-page"><section className="crate-header"><div className="crate-person"><span className="avatar jumbo">{user.avatar}</span><div><small>{user.handle}</small><h1>{user.nickname}</h1><p>{user.bio}</p><div className="taste-tags"><span>Alternative R&amp;B</span><span>K-Hip-Hop</span><span>Neo Soul</span></div></div></div><div className="crate-stats"><div><b>{user.followers}</b><span>팔로워</span></div><div><b>{user.following}</b><span>팔로잉</span></div><div><b>{shownReviews.length}</b><span>리뷰</span></div><div><b>{average.toFixed(1)}</b><span>평균 별점</span></div></div>{isMine ? <button className="outline-btn"><PenLine size={15} /> 프로필 편집</button> : <button className="primary-btn" onClick={() => toggleFollow(user.id)}><UserPlus size={15} /> {follows.includes(user.id) ? '팔로잉' : '팔로우'}</button>}</section>
    {!isMine && <section className="common-taste"><div><span>TASTE CONNECTION</span><strong>76%</strong><p>당신과 취향이 일치합니다</p></div><div><b>8</b><span>공통으로 좋아하는 앨범</span></div><div><b>12</b><span>이 사용자가 좋아하지만<br />당신은 아직 평가하지 않은 앨범</span></div><div className="common-covers">{releases.slice(0, 3).map(r => <img key={r.id} src={r.cover} alt="" />)}</div></section>}
    <DisplayShelfStudio isMine={isMine} user={user} crate={crate} setCrate={setCrate} reviews={shownReviews} />
    {isMine && <MyCrateLibrary crate={crate} setCrate={setCrate} />}
    <ListeningLog reviews={shownReviews} />
    <ProfileSection icon={<Disc3 />} eyebrow="CRATEPRINT ARCHIVE" title="공유한 진열대"><div className="topster-collection">{[{ name: 'JULY ROTATION', type: 'DISPLAY SHELF · 4:5' }, { name: 'LATE NIGHT R&B', type: 'DISPLAY SHELF · 9:16' }].map((item, index) => <article key={item.name}><div>{crate.slice(index, index + 4).map((id, i) => <img key={`${id}-${i}`} src={(releases.find(r => r.id === id) || releases[0]).cover} alt="" />)}</div><span>{item.type}</span><h3>{item.name}</h3></article>)}</div></ProfileSection>
    <ProfileSection icon={<MessageCircle />} eyebrow="WRITTEN REVIEWS" title="작성한 리뷰"><div className="crate-reviews">{shownReviews.filter(r => r.text).slice(0, 4).map(review => { const release = releases.find(r => r.id === review.releaseId) || releases[0]; return <Link to={`/release/${release.id}`} key={review.id}><img src={release.cover} alt="" /><div><span>{release.artist}</span><h3>{release.title}</h3><p>{review.text}</p><footer><b>{review.score.toFixed(1)}</b><small><Heart size={13} /> {review.likes}</small></footer></div></Link> })}</div></ProfileSection>
    <div className="crate-two-col"><ProfileSection icon={<ListMusic />} eyebrow="ALBUM LISTS" title="앨범 리스트"><div className="simple-list"><article><b>12</b><div><h3>비 오는 밤을 위한 R&amp;B</h3><p>낮은 조도와 긴 여운</p></div></article><article><b>08</b><div><h3>올해 발견한 한국 힙합</h3><p>2026년의 새로운 이름들</p></div></article></div></ProfileSection><ProfileSection icon={<CalendarDays />} eyebrow="PERIOD ARCHIVE" title="기간별 결산"><div className="wrap-list"><article><span>2026</span><h3>상반기 결산</h3><p>24개 평가 · 대표 앨범 9장</p></article><article><span>2025</span><h3>올해의 앨범</h3><p>68개 평가 · 대표 앨범 12장</p></article></div></ProfileSection></div>
    <ProfileSection icon={<Star />} eyebrow="ALL RATINGS" title="전체 평가 기록"><div className="rating-shelf">{releases.map((release, index) => <Link to={`/release/${release.id}`} key={release.id}><img src={release.cover} alt="" /><span>{release.title}</span><b>{shownReviews.find(r => r.releaseId === release.id)?.score.toFixed(1) || (8.1 + index / 10).toFixed(1)}</b></Link>)}</div></ProfileSection>
  </div>
}

type ShelfTheme = 'metal' | 'acrylic' | 'gallery' | 'night' | 'chrome' | 'velvet'
type ShelfMode = 'showcase' | 'ranked'
type ShareRatio = '4:5' | '1:1' | '9:16' | '16:9'

function DisplayShelfStudio({ isMine, user, crate, setCrate, reviews }: { isMine: boolean; user: User; crate: string[]; setCrate: (ids: string[]) => void; reviews: Review[] }) {
  const [editing, setEditing] = useState(false)
  const [theme, setTheme] = useState<ShelfTheme>('metal')
  const [mode, setMode] = useState<ShelfMode>('showcase')
  const [ratio, setRatio] = useState<ShareRatio>('4:5')
  const [title, setTitle] = useState('JULY ROTATION')
  const [note, setNote] = useState('잔향이 긴 음악과 낮은 조도의 리듬')
  const [saved, setSaved] = useState(false)
  const selected = crate.slice(0, 9).map(id => releases.find(release => release.id === id) || releases[0])
  const hero = selected[0]
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length : 8.7
  const move = (index: number, delta: number) => { const target = index + delta; if (target < 0 || target >= crate.length) return; const next = [...crate]; [next[index], next[target]] = [next[target], next[index]]; setCrate(next) }
  const makeHero = (index: number) => { const next = [...crate]; [next[0], next[index]] = [next[index], next[0]]; setCrate(next) }
  const replace = (index: number, releaseId: string) => { const next = [...crate]; next[index] = releaseId; setCrate(next) }
  const save = () => { localStorage.setItem('cd-display-shelf', JSON.stringify({ theme, mode, title, note, crate, updatedAt: new Date().toISOString() })); setSaved(true); setEditing(false); window.setTimeout(() => setSaved(false), 1800) }
  return <section className={`display-shelf-section shelf-theme-${theme}`}>
    <header className="display-shelf-heading"><div><span>DISPLAY SHELF · CRATE 09</span><h2>{title}</h2><p>{note}</p></div><div>{isMine && <button className="outline-btn" onClick={() => setEditing(!editing)}><PenLine size={15} /> {editing ? '편집 닫기' : '진열대 편집'}</button>}<button className="primary-btn" onClick={() => setRatio('4:5')}><Share2 size={15} /> CRATEPRINT로 공유</button></div></header>
    <div className="shelf-stage">
      <aside className="crate-index"><span>CRATE<br />INDEX</span><b>09</b><i /><small>CURATED BY<br />{user.handle}<br /><br />9 RECORDS<br />AVG {average.toFixed(1)}<br />SEALED 2026.07.23</small></aside>
      <div className="display-room">
        <div className="hero-record">
          <div className="hero-copy"><span>NOW DISPLAYING</span><b>01 / CENTERPIECE</b><h3>{hero.title}</h3><p>{hero.artist}</p><blockquote>“{reviews.find(review => review.releaseId === hero.id)?.text || '다시 돌아오게 되는 앨범.'}”</blockquote><strong><Star size={14} fill="currentColor" /> {(reviews.find(review => review.releaseId === hero.id)?.score || hero.score).toFixed(1)}</strong></div>
          <button className="hero-jacket" aria-label={`${hero.artist} ${hero.title}, 대표 앨범`}><span className="vinyl"><i /></span><img src={hero.cover} alt="" onError={event => { event.currentTarget.style.opacity = '.25' }} /></button>
        </div>
        {[selected.slice(1, 5), selected.slice(5, 9)].map((row, rowIndex) => <div className={`record-rail rail-${rowIndex + 1}`} key={rowIndex}><span>{rowIndex === 0 ? 'HEAVY ROTATION' : 'AFTER HOURS'} · 0{rowIndex + 2}—0{rowIndex + 5}</span><div>{row.map((release, itemIndex) => { const index = rowIndex * 4 + itemIndex + 1; return <button className="lp-record" key={`${release.id}-${index}`} aria-label={`${release.artist} ${release.title}, ${index + 1}번 진열 앨범`} onClick={() => isMine && editing && makeHero(index)}><span className="mini-vinyl" /><img src={release.cover} alt="" /><i>{String(index + 1).padStart(2, '0')}</i>{index === 2 && <em>NEW IN CRATE</em>}<small>{mode === 'ranked' ? `#${index + 1} · ` : ''}{release.title}<b>{release.score.toFixed(1)}</b></small></button> })}</div></div>)}
      </div>
      <aside className={`crateprint-poster ratio-${ratio.replace(':','-')}`}><header><span>CRATEPRINT®</span><b>{ratio}</b></header><h3>{title}</h3><p>{note}</p><div className="poster-hero"><span className="vinyl"><i /></span><img src={hero.cover} alt="" /></div><div className="poster-records">{selected.slice(1).map((release, index) => <img src={release.cover} alt="" key={`${release.id}-${index}`} />)}</div><footer><span>{user.handle} · CRATE ID 0026</span><b>DIG. TALK. COLLECT. DISPLAY.</b></footer></aside>
    </div>
    <div className="shelf-footer"><div><span>CRATEDIGGERS / PERSONAL RECORD DISPLAY</span><b>DIG. TALK. COLLECT. DISPLAY.</b></div><div className="ratio-picker">{(['4:5','1:1','9:16','16:9'] as ShareRatio[]).map(item => <button className={ratio === item ? 'active' : ''} onClick={() => setRatio(item)} key={item}>{item}</button>)}</div></div>
    {editing && isMine && <div className="shelf-editor"><header><div><span>SHELF EDITOR</span><h3>내 크레이트에서 꺼내 진열하기</h3></div><button className="primary-btn" onClick={save}><Save size={15} /> {saved ? '저장됨' : '진열대 저장'}</button></header><div className="editor-grid"><label><span>진열대 제목</span><input value={title} onChange={event => setTitle(event.target.value)} maxLength={28} /></label><label><span>한 줄 소개</span><input value={note} onChange={event => setNote(event.target.value)} maxLength={58} /></label><div><span>MODE</span><div className="segmented"><button className={mode === 'showcase' ? 'active' : ''} onClick={() => setMode('showcase')}>SHOWCASE</button><button className={mode === 'ranked' ? 'active' : ''} onClick={() => setMode('ranked')}>RANKED</button></div></div><div><span>DISPLAY MATERIAL</span><div className="material-picker">{([['metal','BLACK METAL'],['acrylic','FROSTED'],['gallery','WARM GALLERY'],['night','NIGHT BLUE'],['chrome','CHROME'],['velvet','R&B VELVET']] as const).map(item => <button className={theme === item[0] ? 'active' : ''} onClick={() => setTheme(item[0])} key={item[0]}><i className={item[0]} />{item[1]}</button>)}</div></div></div><div className="slot-editor">{selected.map((release, index) => <article key={`${release.id}-${index}`}><b>{index === 0 ? 'HERO' : String(index + 1).padStart(2,'0')}</b><img src={release.cover} alt="" /><p>{release.title}<small>{release.artist}</small></p><button aria-label="이전 위치" onClick={() => move(index,-1)} disabled={index === 0}><ChevronLeft /></button><button aria-label="다음 위치" onClick={() => move(index,1)} disabled={index === 8}><ChevronRight /></button><select aria-label={`${index + 1}번 앨범 교체`} value={release.id} onChange={event => replace(index,event.target.value)}>{releases.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></article>)}</div></div>}
  </section>
}

function MyCrateLibrary({ crate, setCrate }: { crate: string[]; setCrate: (ids: string[]) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('전체')
  const shown = releases.filter(release => `${release.title} ${release.artist}`.toLowerCase().includes(query.toLowerCase()))
  const add = (id: string) => { if (crate.includes(id)) return; setCrate([...crate.slice(0, 8), id]) }
  return <ProfileSection icon={<ListMusic />} eyebrow="MY CRATE LIBRARY" title="앨범 보관함"><div className="crate-library-toolbar"><label><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="앨범 또는 아티스트 검색" /></label><div>{['전체','듣고 싶어요','듣는 중','들었어요','다시 듣고 싶어요'].map(item => <button className={status === item ? 'active' : ''} onClick={() => setStatus(item)} key={item}>{item}</button>)}</div></div><div className="crate-labels">{['TO LISTEN','2026 FAVORITES','K-R&B','90s HIP-HOP','LATE NIGHT'].map((item,index) => <button key={item}><b>{String(index + 1).padStart(2,'0')}</b>{item}<ChevronRight /></button>)}</div><div className="library-grid">{shown.map((release,index) => <article key={release.id}><img src={release.cover} alt="" /><div><span>{index % 3 === 0 ? '듣는 중' : index % 2 === 0 ? '들었어요' : '듣고 싶어요'}</span><h3>{release.title}</h3><p>{release.artist}</p><button onClick={() => add(release.id)}><Plus size={13} /> DISPLAY SHELF에 올리기</button></div></article>)}</div></ProfileSection>
}

function ListeningLog({ reviews }: { reviews: Review[] }) {
  return <ProfileSection icon={<CalendarDays />} eyebrow="LISTENING LOG" title="감상 기록"><div className="listening-log">{reviews.slice(0, 5).map((review,index) => { const release = releases.find(item => item.id === review.releaseId) || releases[0]; return <Link to={`/release/${release.id}`} key={review.id}><time><b>{String(23 - index).padStart(2,'0')}</b><span>JUL</span></time><img src={release.cover} alt="" /><div><small>{release.artist} · {release.type}</small><h3>{release.title}</h3><p>{review.text || '별점만 남겼습니다.'}</p></div><strong>{review.score.toFixed(1)}</strong><span className="log-state">{index === 0 ? 'DISPLAYING' : 'LISTENED'}</span></Link> })}</div></ProfileSection>
}

function ProfileSection({ icon, eyebrow, title, children }: { icon: ReactNode; eyebrow: string; title: string; children: ReactNode }) { return <section className="profile-block"><header>{icon}<div><span>{eyebrow}</span><h2>{title}</h2></div><ChevronRight /></header>{children}</section> }
