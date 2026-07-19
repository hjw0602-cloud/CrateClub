export type ReleaseType = 'ALBUM' | 'EP' | 'MIXTAPE' | 'SINGLE'

export type Release = {
  id: string
  title: string
  artist: string
  type: ReleaseType
  date: string
  genres: string[]
  cover: string
  score: number
  ratings: number
  description: string
  tracks: string[]
  links: { spotify?: string; apple?: string; youtube?: string }
}

export type User = {
  id: string
  nickname: string
  handle: string
  avatar: string
  bio: string
  followers: number
  following: number
  likes: number
  best: number
  admin?: boolean
}

export type Review = {
  id: string
  releaseId: string
  userId: string
  score: number
  text: string
  likes: number
  createdAt: string
  replies: { id: string; userId: string; text: string; createdAt: string }[]
}

export type Article = {
  id: string
  category: '리뷰' | '비평' | '인터뷰' | '큐레이션' | '뉴스'
  title: string
  deck: string
  date: string
  readTime: string
  cover: string
}

export type Post = {
  id: string
  board: '자유' | '국내 음악' | '해외 음악'
  title: string
  body: string
  author: string
  date: string
  likes: number
  comments: number
  tags: string[]
}

const musicPhoto = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`

export const releases: Release[] = [
  {
    id: 'afterimage', title: 'AFTERIMAGE', artist: 'NOA', type: 'ALBUM', date: '2026.07.18',
    genres: ['Alternative R&B', 'Neo Soul'], cover: '/images/featured-cover.png', score: 8.7, ratings: 184,
    description: '침묵과 잔향 사이를 오가는 열두 개의 장면. NOA가 3년 만에 내놓은 두 번째 정규작.',
    tracks: ['Trace', 'Pale Blue', 'Pressure', 'No Signal', 'Afterimage', 'Soft Landing', 'Static Bloom', 'Home'],
    links: { spotify: 'https://open.spotify.com', apple: 'https://music.apple.com', youtube: 'https://music.youtube.com' },
  },
  {
    id: 'blue-hour', title: 'BLUE HOUR', artist: 'MISO', type: 'EP', date: '2026.07.17',
    genres: ['R&B', 'UK Garage'], cover: musicPhoto('photo-1516280440614-37939bbacd81'), score: 8.2, ratings: 92,
    description: '새벽 두 시의 도시를 닮은 짧고 선명한 다섯 곡.', tracks: ['2:14', 'Blue Hour', 'Call Back', 'Rush', 'Daylight'],
    links: { spotify: 'https://open.spotify.com', youtube: 'https://music.youtube.com' },
  },
  {
    id: 'no-skip', title: 'NO SKIP', artist: 'YUNB', type: 'MIXTAPE', date: '2026.07.15',
    genres: ['Hip-Hop', 'Boom Bap'], cover: musicPhoto('photo-1521337581100-8ca9a73a5f79'), score: 7.9, ratings: 67,
    description: '과장 없이 단단한 랩과 샘플링으로 밀어붙이는 믹스테이프.', tracks: ['Intro', 'Corner', 'No Skip', 'Tape Dust', 'Outro'],
    links: { youtube: 'https://music.youtube.com' },
  },
  {
    id: 'petals', title: 'PETALS', artist: 'LÉON', type: 'SINGLE', date: '2026.07.14',
    genres: ['Soul', 'R&B'], cover: musicPhoto('photo-1493225457124-a3eb161ffa5f'), score: 8.5, ratings: 143,
    description: '절제된 보컬과 현악 편곡이 천천히 피어나는 싱글.', tracks: ['Petals'],
    links: { spotify: 'https://open.spotify.com', apple: 'https://music.apple.com' },
  },
  {
    id: 'heat-check', title: 'HEAT CHECK', artist: 'DUSTY', type: 'ALBUM', date: '2026.07.11',
    genres: ['Trap', 'Southern Hip-Hop'], cover: musicPhoto('photo-1496293455970-f8581aae0e3b'), score: 7.4, ratings: 118,
    description: '뜨거운 저역과 느슨한 플로우로 채운 여름의 기록.', tracks: ['Heat', 'Chrome', 'Side A', 'Motion', 'Palm', 'Fade'],
    links: { spotify: 'https://open.spotify.com' },
  },
  {
    id: 'soft-focus', title: 'SOFT FOCUS', artist: 'HANA', type: 'EP', date: '2026.07.09',
    genres: ['Dream Pop', 'Alternative R&B'], cover: musicPhoto('photo-1494232410401-ad00d5433cfa'), score: 8.0, ratings: 46,
    description: '흐릿한 기타와 가까운 목소리가 만든 사적인 풍경.', tracks: ['Glass', 'Soft Focus', 'Room Tone', 'Still'],
    links: { apple: 'https://music.apple.com', youtube: 'https://music.youtube.com' },
  },
]

export const users: User[] = [
  { id: 'me', nickname: 'cratekeeper', handle: '@cratekeeper', avatar: 'CK', bio: '좋은 음악을 오래 듣고 짧게 씁니다.', followers: 128, following: 34, likes: 892, best: 12, admin: true },
  { id: 'u1', nickname: 'soularchive', handle: '@soularchive', avatar: 'SA', bio: '네오 소울과 얼터너티브 R&B.', followers: 842, following: 91, likes: 3410, best: 38 },
  { id: 'u2', nickname: 'liner.notes', handle: '@liner_notes', avatar: 'LN', bio: '라이너 노트를 읽듯 천천히.', followers: 516, following: 63, likes: 2190, best: 21 },
  { id: 'u3', nickname: '808room', handle: '@808room', avatar: '80', bio: '힙합 프로덕션과 사운드 디자인.', followers: 274, following: 45, likes: 987, best: 8 },
]

export const initialReviews: Review[] = [
  { id: 'r1', releaseId: 'afterimage', userId: 'u1', score: 9.2, text: '공백까지 편곡한 앨범. 가장 조용한 순간에 가장 많은 것이 들린다.', likes: 184, createdAt: '2시간 전', replies: [{ id: 'rp1', userId: 'u2', text: '후반부의 여백이 특히 좋았어요.', createdAt: '1시간 전' }] },
  { id: 'r2', releaseId: 'afterimage', userId: 'u2', score: 8.8, text: '첫 청취보다 두 번째, 두 번째보다 세 번째에 더 깊어지는 잔향.', likes: 97, createdAt: '5시간 전', replies: [] },
  { id: 'r3', releaseId: 'afterimage', userId: 'u3', score: 7.6, text: '프로덕션은 훌륭하지만 중반의 템포가 조금 평평하다.', likes: 42, createdAt: '어제', replies: [] },
  { id: 'r4', releaseId: 'blue-hour', userId: 'u1', score: 8.4, text: '장르를 빌리되 분위기는 완전히 자기 것으로 만든다.', likes: 68, createdAt: '어제', replies: [] },
  { id: 'r5', releaseId: 'petals', userId: 'u2', score: 9.0, text: '한 곡으로 계절의 온도를 바꾸는 목소리.', likes: 121, createdAt: '3일 전', replies: [] },
]

export const articles: Article[] = [
  { id: 'a1', category: '비평', title: '조용한 앨범이 더 크게 남는 방식', deck: 'NOA의 AFTERIMAGE에서 침묵은 빈칸이 아니라 악기다.', date: '2026.07.19', readTime: '8분', cover: '/images/featured-cover.png' },
  { id: 'a2', category: '큐레이션', title: '새벽 두 시를 위한 7개의 트랙', deck: '도시가 가장 느리게 움직이는 시간에 듣는 R&B.', date: '2026.07.17', readTime: '5분', cover: musicPhoto('photo-1524368535928-5b5e00ddc76b') },
  { id: 'a3', category: '리뷰', title: '샘플의 먼지까지 남겨둔 랩', deck: 'YUNB의 NO SKIP은 매끈함 대신 질감을 택한다.', date: '2026.07.16', readTime: '6분', cover: musicPhoto('photo-1521337581100-8ca9a73a5f79') },
]

export const initialPosts: Post[] = [
  { id: 'p1', board: '해외 음악', title: '이번 주 신보 중 가장 많이 들은 앨범', body: '다들 무엇을 반복해서 듣고 있나요?', author: 'soularchive', date: '12분 전', likes: 24, comments: 18, tags: ['신보', '추천'] },
  { id: 'p2', board: '국내 음악', title: '요즘 국내 R&B 프로덕션에서 느껴지는 변화', body: '드럼 질감이 확실히 달라진 것 같아요.', author: '808room', date: '1시간 전', likes: 31, comments: 12, tags: ['R&B', '프로덕션'] },
  { id: 'p3', board: '자유', title: '앨범은 보통 몇 번 듣고 별점 남기세요?', body: '첫인상과 나중 점수가 꽤 달라져서 궁금합니다.', author: 'liner.notes', date: '3시간 전', likes: 17, comments: 29, tags: ['질문'] },
]
