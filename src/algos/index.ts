import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as community from './community'
import * as communityVideo from './community-video'
import * as following from './following'

type AlgoHandler = (ctx: AppContext, params: QueryParams, requesterDid?: string) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [community.shortname]: community.handler,
  [communityVideo.shortname]: communityVideo.handler,
  [following.shortname]: following.handler,
}

export default algos
