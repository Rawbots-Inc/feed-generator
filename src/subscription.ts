import { Commit } from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: Commit) {
    console.log('handle evt', evt)

    const ops = await getOpsByType(evt)
    console.log('ops', ops)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)

    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const community = (create.record as any).community
        console.log(' có community ko ', community)
        return typeof community === 'string' && community.trim() !== ''
      })
      .map((create) => {
        const community = (create.record as any).community as string
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
          community: community,
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
