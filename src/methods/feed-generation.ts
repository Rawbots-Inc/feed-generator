import { Server, InvalidRequestError } from '@atproto/xrpc-server'
import { AppContext } from '../config'
import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { ids } from '../lexicon/lexicons'
import { AtUri } from '@atproto/syntax'
import algos from '../algos'

export default function (server: Server, appCtx: AppContext) {
  server.method(ids.AppBskyFeedGetFeedSkeleton, async ({ params }) => {
    const queryParams = params as unknown as QueryParams
    const feedUri = new AtUri(queryParams.feed)

    const algo = algos[feedUri.rkey]
    if (
      feedUri.hostname !== appCtx.cfg.publisherDid ||
      feedUri.collection !== 'app.bsky.feed.generator' ||
      !algo
    ) {
      throw new InvalidRequestError(
        'Unsupported algorithm',
        'UnsupportedAlgorithm',
      )
    }

    console.log(`algo: ${algo?.name}`)

    const body = await algo(appCtx, queryParams)

    return {
      encoding: 'application/json',
      body,
    }
  })
}
