import type { Main as RecordEmbed } from '../lexicon/types/app/bsky/embed/record'

export type DatabaseSchema = {
  post: Post
  sub_state: SubState
}

export type Post = {
  uri: string
  cid: string
  indexedAt: string
  embed: string | null
  community: string
}

export type SubState = {
  service: string
  cursor: number
}
