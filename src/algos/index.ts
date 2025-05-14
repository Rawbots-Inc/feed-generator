import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as community from './community'
import * as communityVideo from './community-video'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [community.shortname]: community.handler,
  [communityVideo.shortname]: communityVideo.handler,
}

export default algos
