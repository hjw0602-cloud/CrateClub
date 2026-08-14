export type CrateprintTemplate = 'display-shelf' | 'vinyl-peek' | 'table-spread' | 'crate-pile' | 'record-ring' | 'record-halo' | 'quiet-rack' | 'ranked-crate' | 'classic-grid'
export type CrateprintTheme = 'black-metal' | 'frosted-acrylic' | 'warm-gallery'
export type CrateprintRatio = '4:5' | '9:16' | '1:1' | '16:9'

export type CrateprintAlbum = {
  releaseId: string
  order: number
  score?: number
  note?: string
}

export type Crateprint = {
  id: string
  ownerId: string | null
  ownerName: string
  title: string
  description: string
  prompt: string
  templateType: CrateprintTemplate
  theme: CrateprintTheme
  outputRatio: CrateprintRatio
  selectedAlbums: CrateprintAlbum[]
  heroAlbumId: string | null
  showScores: boolean
  showNotes: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export const topicOptions = [
  '나를 설명하는 앨범 9장',
  '인생 앨범',
  '요즘 가장 많이 듣는 앨범',
  '올해 최고의 앨범',
  '이번 달 새롭게 발견한 앨범',
  '친구에게 추천하고 싶은 앨범',
  '장르별 명반',
  '아티스트 디스코그래피 순위',
  '직접 제목 정하기',
]

export const templateLabels: Record<CrateprintTemplate, string> = {
  'display-shelf': 'DISPLAY SHELF',
  'vinyl-peek': 'VINYL PEEK',
  'table-spread': 'TABLE SPREAD',
  'crate-pile': 'CRATE PILE',
  'record-ring': 'RECORD RING',
  'record-halo': 'RECORD HALO',
  'quiet-rack': 'QUIET RACK',
  'ranked-crate': 'RANKED CRATE',
  'classic-grid': 'CLASSIC GRID',
}

export const themeLabels: Record<CrateprintTheme, string> = {
  'black-metal': 'BLACK METAL',
  'frosted-acrylic': 'FROSTED ACRYLIC',
  'warm-gallery': 'WARM GALLERY',
}
