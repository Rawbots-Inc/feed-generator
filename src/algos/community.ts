import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

import { encodeCursor, decodeCursor } from '../util/helpers'

export const shortname = 'Community'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  console.log(
    `handler get feed generator with param: \n limit: ${params?.limit}\n cursor: ${params?.cursor}\nfeed: ${params?.feed}`,
  )

  if (!params.cursor) {
    console.log('No cursor provided ⇒ returning empty feed')
    return {
      feed: [],
      cursor: undefined,
    }
  }

  let timestamp: number | null
  let community: string
  try {
    ({ timestamp, community } = decodeCursor(params.cursor))
  } catch (err) {
    console.error('Failed to decode cursor:', err)
    return { feed: [], cursor: undefined }
  }
  console.log(`Decoded community=${community}, timestamp=${timestamp}`)

  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .where('community', '=', community)

  if (timestamp != null) {
    const cutoff = new Date(timestamp).toISOString()
    console.log(`Applying cutoff: indexedAt < ${cutoff}`)
    builder = builder.where('indexedAt', '<', cutoff)
  }

  builder = builder
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit ?? 10)

  const rows = await builder.execute()

  const feed = rows.map((r) => ({ post: r.uri }))

  console.log('feed', feed)

  let newCursor: string | undefined
  const last = rows.at(-1)
  if (last) {
    const newTs = new Date(last.indexedAt).getTime()
    newCursor = encodeCursor(newTs, community)
  }

  return {
    feed,
    cursor: newCursor,
  }
}
