import { Commit } from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: Commit) {
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)

    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const community = (create.record as any).community
        return typeof community === 'string' && community.trim() !== ''
      })
      .map((create) => {
        const community = (create.record as any).community as string
        const embed = (create.record as any).embed ?? null
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
          community: community,
          embed: embed,
        }
      })

    if (postsToDelete.length > 0) {
      // console.log('ops', ops)
      // console.log('Community posts delete ', postsToDelete)
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }

    if (postsToCreate.length > 0) {
      console.log('ops', ops)
      console.log('Community posts create ', postsToCreate)
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
