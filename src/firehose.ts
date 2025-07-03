import { Jetstream } from '@skyware/jetstream';
import { db } from './db';
import { ids } from './lexicon/lexicons';
import { postUri } from './util/helpers';
import { config } from './config';
export const jetstream = new Jetstream({
    // ws: new WebSocket('wss://jetstream1.us-west.bsky.network/subscribe'),
    endpoint: 'wss://jetstream2.us-west.bsky.network/subscribe',
    wantedCollections: [
        ids.AppBskyFeedPost,
        ids.AppBskyGraphFollow,
    ], // omit to receive all collections
    wantedDids: [],
});

jetstream.onCreate(ids.AppBskyFeedPost, async (event) => {
    const record = event.commit.record as any
    const community = record.community
    const embed = record.embed ?? null

    if (typeof community === 'string' && community.trim() !== '' && community.startsWith(config.envType)) {
        const uri = postUri(event.did, event.commit.rkey)
        const postRecord = {
            author: event.did,
            uri: uri,
            cid: event.commit.cid,
            indexedAt: new Date().toISOString(),
            community: community,
            embed: embed,
        }
        try {
            await db
                .insertInto('post')
                .values(postRecord)
                .onConflict((oc) => oc.doNothing())
                .execute();
        } catch (error) {
            console.error('Error indexing post', error);
        }
    }
});

jetstream.onDelete(ids.AppBskyFeedPost, async (event) => {
    const uri = postUri(event.did, event.commit.rkey)
    await db.deleteFrom('post').where('uri', '=', uri).execute();
});



jetstream.onCreate(ids.AppBskyGraphFollow, async (event) => {
    await db
        .insertInto('follows')
        .values({
            id: event.commit.rkey,
            follower: event.did,
            followed: (event.commit.record as any).subject,
            createdAt: new Date().toISOString(),
        })
        .onConflict((oc) => oc.doNothing())
        .execute();
});

jetstream.onDelete(ids.AppBskyGraphFollow, async (event) => {
    await db.deleteFrom('follows').where('id', '=', event.commit.rkey).execute();
});