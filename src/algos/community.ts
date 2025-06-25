import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

import { decodeCursor } from '../util/helpers'

export const shortname = 'community-dev'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  console.log(
    `handler get feed generator with param: \n limit: ${params?.limit}\n cursor: ${params?.cursor}\nfeed: ${params?.feed}`,
  )

  let timestamp: number | null = null
  let community: string | undefined
  let oldCursor: string | undefined

  if (params.cursor) {
    try {
      ;({ timestamp, community, oldCursor } = decodeCursor(params.cursor))
      console.log(`Decoded: community=${community}, timestamp=${timestamp}`)
    } catch (err) {
      console.error('Failed to decode cursor:', err)
    }
  } else {
    console.log('No cursor provided ⇒ list first page of all posts')
  }

  let builder = ctx.db.selectFrom('post').selectAll()

  if (community) {
    builder = builder.where('community', '=', community)
    console.log(`Applying community filter: = ${community}`)
  }

  if (timestamp != null) {
    const cutoff = new Date(timestamp).toISOString()
    builder = builder.where('indexedAt', '<', cutoff)
    console.log(`Applying cutoff: indexedAt < ${cutoff}`)
  }

  const rows = await builder
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit ?? 10)
    .execute()

  const feed = rows.map((r) => ({ post: r.uri }))
  console.log('Community feeds response', feed)

  let newCursor: string | undefined
  if (rows.length) {
    const last = rows[rows.length - 1]
    const newTs = new Date(last.indexedAt).getTime()
    const restToken = oldCursor?.split('::', 2)[1] ?? ''
    const newBase = `${newTs}::${restToken}`

    if (community) {
      const newCommEnc = Buffer.from(community, 'utf-8').toString('base64')
      newCursor = `${newBase}_${newCommEnc}`
    } else {
      newCursor = newBase
    }
    console.log(`New cursor: ${newCursor}`)
  }

  return {
    feed,
    cursor: newCursor,
  }
}
