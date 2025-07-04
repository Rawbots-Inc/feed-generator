import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

import { decodeCursor } from '../util/helpers'
import { sql } from 'kysely'

export const shortname = 'community-video'

export const handler = async (ctx: AppContext, params: QueryParams, requesterDid?: string) => {
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

  builder = builder
  .where(sql<boolean>`
    (
      json_extract(embed, '$.$type') = 'app.bsky.embed.video'
      AND json_extract(embed, '$.video.mimeType') LIKE 'video/%'
    )
    OR
    (
      json_extract(embed, '$.$type') = 'app.bsky.embed.recordWithMedia'
      AND EXISTS (
        SELECT 1 FROM json_each(json_extract(embed, '$.media.media'))
        WHERE json_extract(value, '$.mimeType') LIKE 'video/%'
      )
    )
  `)

  console.log('Filtered video posts')

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
