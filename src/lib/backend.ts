import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { initialPosts, initialReviews, releases as seedReleases, users, type Post, type Release, type Review, type User } from '../data'
import { isDemoMode, supabase } from './supabase'

const CATALOG_API = 'https://cratediggers-release-sync.hjw0602.workers.dev/catalog'

const mapReleaseRows = (rows: any[]): Release[] => rows.map((row: any) => {
  const scores = (row.reviews || []).map((review: any) => Number(review.score))
  return {
    id: row.slug, title: row.title, artist: row.artist?.name || 'Unknown Artist', type: row.release_type,
    date: row.release_date ? String(row.release_date).replaceAll('-', '.') : '', genres: row.genres || [], cover: row.cover_url || '',
    score: scores.length ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0, ratings: scores.length,
    description: row.description || '', tracks: (row.tracks || []).sort((a: any, b: any) => a.position - b.position).map((track: any) => track.title),
    links: { spotify: row.spotify_url || undefined, apple: row.apple_music_url || undefined, youtube: row.youtube_music_url || undefined },
  } satisfies Release
})

const mergeCatalog = (remote: Release[]) => [...seedReleases, ...remote.filter(item => !seedReleases.some(seed => seed.id === item.id))]

const ago = (value: string) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return '방금'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  return `${Math.floor(seconds / 86400)}일 전`
}

const profileToUser = (profile: any): User => ({
  id: profile?.id || 'unknown',
  nickname: profile?.nickname || '알 수 없는 사용자',
  handle: `@${profile?.nickname || 'unknown'}`,
  avatar: (profile?.nickname || '?').slice(0, 2).toUpperCase(),
  bio: profile?.bio || '', followers: 0, following: 0, likes: 0, best: 0,
  admin: profile?.role === 'admin',
})

export function useBackend() {
  const [session, setSession] = useState<Session | null>(null)
  const [reviews, setReviews] = useState<Review[]>(isDemoMode ? initialReviews : [])
  const [posts, setPosts] = useState<Post[]>(isDemoMode ? initialPosts : [])
  const [follows, setFollows] = useState<string[]>(isDemoMode ? ['u1'] : [])
  const [liked, setLiked] = useState<string[]>([])
  const [catalog, setCatalog] = useState<Release[]>(seedReleases)
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    fetch(CATALOG_API)
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`Catalog ${response.status}`)))
      .then(rows => { if (Array.isArray(rows) && rows.length) setCatalog(mergeCatalog(mapReleaseRows(rows))) })
      .catch(() => undefined)
  }, [])

  const load = useCallback(async (activeSession?: Session | null) => {
    if (!supabase) return
    setLoading(true)
    const current = activeSession === undefined ? (await supabase.auth.getSession()).data.session : activeSession
    const [{ data: reviewRows }, { data: postRows }, { data: releaseRows }] = await Promise.all([
      supabase.from('reviews').select(`id, score, body, created_at, release:releases!inner(slug), profile:profiles!reviews_user_id_fkey(id,nickname,avatar_url,bio,role), review_likes(user_id), review_replies(id,user_id,body,created_at)`).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('posts').select(`id,board,title,body,created_at,profile:profiles!posts_author_id_fkey(nickname),comments(count)`).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('releases').select(`slug,title,release_type,release_date,genres,description,cover_url,spotify_url,apple_music_url,youtube_music_url,artist:artists!inner(name),tracks(position,title,duration_ms),reviews(score)`).eq('status', 'published').order('release_date', { ascending: false }),
    ])
    if (releaseRows?.length) setCatalog(mergeCatalog(mapReleaseRows(releaseRows)))
    setReviews((reviewRows || []).map((row: any) => ({
      id: row.id, releaseId: row.release.slug, userId: row.profile.id, user: profileToUser(row.profile),
      score: Number(row.score), text: row.body || '', likes: row.review_likes?.length || 0, createdAt: ago(row.created_at),
      replies: (row.review_replies || []).map((reply: any) => ({ id: reply.id, userId: reply.user_id, text: reply.body, createdAt: ago(reply.created_at) })),
    })))
    setPosts((postRows || []).map((row: any) => ({ id: row.id, board: row.board, title: row.title, body: row.body, author: row.profile?.nickname || '알 수 없음', date: ago(row.created_at), likes: 0, comments: row.comments?.[0]?.count || 0, tags: [] })))
    if (current) {
      const [{ data: followRows }, { data: likeRows }] = await Promise.all([
        supabase.from('follows').select('following_id').eq('follower_id', current.user.id),
        supabase.from('review_likes').select('review_id').eq('user_id', current.user.id),
      ])
      setFollows((followRows || []).map((x: any) => x.following_id))
      setLiked((likeRows || []).map((x: any) => x.review_id))
    } else { setFollows([]); setLiked([]) }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); load(data.session) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next); load(next) })
    return () => data.subscription.unsubscribe()
  }, [load])

  const addReview = async (releaseSlug: string, score: number, text: string) => {
    if (!supabase || !session) {
      const next = { id: `r${Date.now()}`, releaseId: releaseSlug, userId: 'me', score, text, likes: 0, createdAt: '방금', replies: [] }
      setReviews(value => [next, ...value.filter(r => !(r.releaseId === releaseSlug && r.userId === 'me'))]); return
    }
    const { data: release } = await supabase.from('releases').select('id').eq('slug', releaseSlug).single()
    if (!release) throw new Error('등록된 작품을 찾을 수 없습니다. seed.sql을 먼저 실행해주세요.')
    const { error } = await supabase.from('reviews').upsert({ release_id: release.id, user_id: session.user.id, score, body: text || null, updated_at: new Date().toISOString() }, { onConflict: 'release_id,user_id' })
    if (error) throw error
    await load(session)
  }

  const toggleLike = async (reviewId: string) => {
    const active = liked.includes(reviewId)
    setLiked(value => active ? value.filter(x => x !== reviewId) : [...value, reviewId])
    if (!supabase || !session) return
    const query = active ? supabase.from('review_likes').delete().eq('review_id', reviewId).eq('user_id', session.user.id) : supabase.from('review_likes').insert({ review_id: reviewId, user_id: session.user.id })
    const { error } = await query; if (error) { setLiked(value => active ? [...value, reviewId] : value.filter(x => x !== reviewId)); throw error }
  }

  const toggleFollow = async (userId: string) => {
    const active = follows.includes(userId)
    setFollows(value => active ? value.filter(x => x !== userId) : [...value, userId])
    if (!supabase || !session) return
    const query = active ? supabase.from('follows').delete().eq('following_id', userId).eq('follower_id', session.user.id) : supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId })
    const { error } = await query; if (error) throw error
  }

  const addReply = async (reviewId: string, text: string) => {
    if (!supabase || !session) { setReviews(value => value.map(r => r.id === reviewId ? { ...r, replies: [...r.replies, { id: `rp${Date.now()}`, userId: 'me', text, createdAt: '방금' }] } : r)); return }
    const { error } = await supabase.from('review_replies').insert({ review_id: reviewId, user_id: session.user.id, body: text }); if (error) throw error
    await load(session)
  }

  const addPost = async (post: Pick<Post, 'board' | 'title' | 'body'>) => {
    if (!supabase || !session) { setPosts(value => [{ id: `p${Date.now()}`, ...post, author: users[0].nickname, date: '방금', likes: 0, comments: 0, tags: [] }, ...value]); return }
    const { error } = await supabase.from('posts').insert({ board: post.board, title: post.title, body: post.body, author_id: session.user.id }); if (error) throw error
    await load(session)
  }

  return { session, loggedIn: isDemoMode || !!session, catalog, reviews, posts, follows, liked, loading, addReview, toggleLike, toggleFollow, addReply, addPost, refresh: load }
}
