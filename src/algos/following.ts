import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

export const shortname = 'following'

// export const handler = async (ctx: AppContext, params: QueryParams, requesterDid?: string) => {
//     console.log(
//         `handler get following with param: \n limit: ${params?.limit}\n cursor: ${params?.cursor}\nfeed: ${params?.feed}`,
//     )

//     if (!requesterDid) {
//         return { feed: [] }
//     }

//     const followingDids: string[] = []
//     let cursor: string | undefined = undefined
//     const pageSize = 100

//     while (true) {
//         try {
//             const res = await ctx.agent.app.bsky.graph.getFollows({
//                 actor: requesterDid,
//                 limit: pageSize,
//                 cursor,
//             })

//             console.log(`following res: ${res.success} ${res.data.follows}`)

//             const pageDids = res.data.follows.map((f) => f.did)
//             console.log(`dids: ${pageDids}`)
//             followingDids.push(...pageDids)

//             if (!res.data.cursor || pageDids.length < pageSize) {
//                 break
//             }

//             cursor = res.data.cursor
//         } catch (error) {
//             console.log(`error: ${error}`)
//         }
//     }

//     if (followingDids.length === 0) {
//         return { feed: [] }
//     }

//     const cursorTime = params.cursor ? new Date(params.cursor) : undefined

//     let query = ctx.db
//         .selectFrom('post')
//         .selectAll()
//         .where('author', 'in', followingDids)
//         .orderBy('indexedAt', 'desc')
//         .limit(params.limit ?? 30)

//     if (cursorTime) {
//         query = query.where('indexedAt', '<', cursorTime.toISOString())
//     }

//     const rows = await query.execute()

//     const feed = rows.map((row) => ({
//         post: row.uri,
//     }))

//     return {
//         feed,
//         cursor: rows.at(-1)?.indexedAt,
//     }
// }


export const handler = async (ctx: AppContext, params: QueryParams, requesterDid?: string) => {
    console.log(
        `handler get following (local DB) with param: \n limit: ${params?.limit}\n cursor: ${params?.cursor}\nfeed: ${params?.feed}`,
    )

    if (!requesterDid) {
        console.log('get following without requesterDid')
        return { feed: [] }
    }

    const followingRows = await ctx.db
        .selectFrom('follows')
        .select('followed') 
        .where('follower', '=', requesterDid)
        .execute()

    const followingDids = followingRows.map((row) => row.followed)

    if (followingDids.length === 0) {
        return { feed: [] }
    }

    const cursorTime = params.cursor ? new Date(params.cursor) : undefined

    let query = ctx.db
        .selectFrom('post')
        .selectAll()
        .where('author', 'in', followingDids)
        .orderBy('indexedAt', 'desc')
        .limit(params.limit ?? 30)

    if (cursorTime) {
        query = query.where('indexedAt', '<', cursorTime.toISOString())
    }

    const rows = await query.execute()

    const feed = rows.map((row) => ({
        post: row.uri,
    }))

    return {
        feed,
        cursor: rows.at(-1)?.indexedAt,
    }
}

