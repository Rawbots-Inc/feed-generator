import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

export const shortname = 'community'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  if (!params.community) {
    throw new Error('Missing required "community" param')
  }

  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .where('community', '=', params.community) // filter by community
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit ?? 10)

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString()
    builder = builder.where('post.indexedAt', '<', timeStr)
  }

  const res = await builder.execute()

  const feed = res.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = new Date(last.indexedAt).getTime().toString(10)
  }

  console.log(`get feed community ${params.community} ${feed}`)

  return {
    cursor,
    feed,
  }
}
