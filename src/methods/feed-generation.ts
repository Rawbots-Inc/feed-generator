import { Server, InvalidRequestError, verifyJwt, AuthRequiredError } from '@atproto/xrpc-server'
import { AppContext } from '../config'
import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { ids } from '../lexicon/lexicons'
import { AtUri } from '@atproto/syntax'
import algos from '../algos'
import { getRequesterDid, validateAuth } from '../auth'
import { trackActiveUser } from '../db/active-users'

export default function (server: Server, appCtx: AppContext) {
  server.method(ids.AppBskyFeedGetFeedSkeleton, async ({ params, req }) => {
    const queryParams = params as unknown as QueryParams
    const feedUri = new AtUri(queryParams.feed)

    const algo = algos[feedUri.rkey]
    if (
      feedUri.hostname !== appCtx.cfg.publisherDid ||
      feedUri.collection !== 'app.bsky.feed.generator' ||
      !algo
    ) {
      console.log('Unsupported algorithm')
      console.log(`hostName: ${feedUri.hostname} - collection: ${feedUri.collection}`)
      throw new InvalidRequestError(
        'Unsupported algorithm',
        'UnsupportedAlgorithm',
      )
    }

    // const requesterDid = await validateAuth(req, appCtx.cfg.serviceDid, appCtx.didResolver)

    const requesterDid = await getRequesterDid(req)

    if (requesterDid) {
      await trackActiveUser(appCtx, requesterDid)
    }

    const body = await algo(appCtx, queryParams, requesterDid)

    return {
      encoding: 'application/json',
      body,
    }
  })
}