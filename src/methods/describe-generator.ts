import { Server } from '@atproto/xrpc-server'
import { AppContext } from '../config'
import algos from '../algos'
import { AtUri } from '@atproto/syntax'
import { ids } from '../lexicon/lexicons'

export default function (server: Server, appCtx: AppContext) {
  server.method(ids.AppBskyFeedDescribeFeedGenerator, async ({ params }) => {
    const feeds = Object.keys(algos).map((shortname) => ({
      uri: AtUri.make(
        appCtx.cfg.publisherDid,
        ids.AppBskyFeedGenerator,
        shortname,
      ).toString(),
    }))

    return {
      encoding: 'application/json',
      body: {
        did: appCtx.cfg.serviceDid,
        feeds,
      },
    }
  })
}
