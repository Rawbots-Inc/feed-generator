import dotenv from 'dotenv'
dotenv.config()

import { AtpAgent, BlobRef, AppBskyFeedDefs } from '@atproto/api'
import fs from 'fs/promises'
import { ids } from '../src/lexicon/lexicons'
import { feeds } from './feeds_configs/feed'

const run = async () => {
  const handle = process.env.FEEDGEN_PUBLISHER_HANDLE!
  const password = process.env.FEEDGEN_PUBLISHER_PASSWORD!

  if (!handle || !password) {
    throw new Error('Please provide a Bluesky handle and password in the .env file')
  }

  if (!process.env.FEEDGEN_HOSTNAME) {
    throw new Error('Please provide a hostname in the .env file')
  }

  const feedGenDid =
    process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME}`

  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password })

  for (const feed of feeds) {
    const recordName = feed.name
    const displayName = feed.displayName
    const description = feed.description
    const avatar = feed.avatarPath
    const videoOnly = feed.videoOnly

    console.log(`Publishing feed generator with param: \n feed name: ${recordName}\n feed display name: ${displayName}\n feed description: ${description}\n feed avatar: ${avatar}`)


    let avatarRef: BlobRef | undefined
    if (avatar) {
      let encoding: string
      if (avatar.endsWith('png')) {
        encoding = 'image/png'
      } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
        encoding = 'image/jpeg'
      } else {
        throw new Error('expected png or jpeg')
      }
      const img = await fs.readFile(avatar)
      const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
        encoding,
      })
      avatarRef = blobRes.data.blob
    }

    await agent.api.com.atproto.repo.putRecord({
      repo: agent.session?.did ?? '',
      collection: ids.AppBskyFeedGenerator,
      rkey: recordName,
      record: {
        did: feedGenDid,
        displayName: displayName,
        description: description,
        avatar: avatarRef,
        createdAt: new Date().toISOString(),
        contentMode: videoOnly
          ? AppBskyFeedDefs.CONTENTMODEVIDEO
          : AppBskyFeedDefs.CONTENTMODEUNSPECIFIED,
      },
    })
  }

  console.log('All done 🎉')
}

run()
