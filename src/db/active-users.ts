import AtpAgent, { AtUri } from '@atproto/api'
import { db } from './index'
import { ids } from '../lexicon/lexicons'
import { AppContext } from '../config'


export async function trackActiveUser(ctx: AppContext, did: string) {
    const existing = await db
        .selectFrom('active_users')
        .select('did')
        .where('did', '=', did)
        .executeTakeFirst()

    if (!existing) {
        await db
            .insertInto('active_users')
            .values({
                did,
                firstSeen: new Date().toISOString(),
            })
            .onConflict((oc) => oc.column('did').doNothing())
            .execute()

        await seedFollowsForUser(ctx.agent, did)
    }

}

async function seedFollowsForUser(agent: AtpAgent, did: string) {
    const pageSize = 100
    let cursor: string | undefined = undefined

    while (true) {
        try {
            const res = await agent.com.atproto.repo.listRecords({
                repo: did,
                collection: ids.AppBskyGraphFollow,
                limit: pageSize,
                cursor,
            })

            const follows = res.data.records

            if (!follows.length) break

            const records = follows.map((f) => {
                const uri = new AtUri(f.uri)
                return {
                    id: uri.rkey,
                    follower: did,
                    followed: (f.value as any).subject,
                    createdAt: (f.value.createdAt as string | undefined) ?? new Date().toISOString()
                }
            })

            await db
                .insertInto('follows')
                .values(records)
                .onConflict((oc) => oc.doNothing())
                .execute()

            if (!res.data.cursor || follows.length < pageSize) break
            cursor = res.data.cursor
        } catch (e) {
            console.log(`fetch follows error: ${e}`)
            break
        }
    }
}