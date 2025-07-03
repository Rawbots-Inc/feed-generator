import http from 'http'
import events from 'events'
import express from 'express'
import { DidResolver, MemoryCache } from '@atproto/identity'
import { createServer } from '@atproto/xrpc-server'
import feedGeneration from './methods/feed-generation'
import describeGenerator from './methods/describe-generator'
import { Database, db, migrateToLatest } from './db'
import { AppContext, config, Config } from './config'
import wellKnown from './well-known'
import { schemas } from './lexicon/lexicons'
import { Jetstream } from '@skyware/jetstream'
import { jetstream } from './firehose'
import AtpAgent from '@atproto/api'


const didCache = new MemoryCache()
export const didResolver = new DidResolver({
  plcUrl: 'https://plc.directory',
  didCache,
})

export class FeedGenerator {
  public app: express.Application
  public server?: http.Server
  public db: Database
  public firehose: Jetstream
  public cfg: Config

  constructor(
    app: express.Application,
    db: Database,
    firehose: Jetstream,
    cfg: Config,
  ) {
    this.app = app
    this.db = db
    this.firehose = firehose
    this.cfg = cfg
  }

  static async create(cfg: Config) {
    const app = express()
    // const firehose = new FirehoseSubscription(db, cfg.subscriptionEndpoint)
    const firehose = jetstream

    const server = createServer(schemas, {
      payload: {
        jsonLimit: 100 * 1024, // 100kb
        textLimit: 100 * 1024, // 100kb
        blobLimit: 5 * 1024 * 1024, // 5mb
      },
    })
    const agent = new AtpAgent({ service: 'https://bsky.social' })
    await agent.login({
      identifier: config.bskyHandle!,
      password: config.bskyPw!
    })
    const ctx: AppContext = {
      agent,
      db,
      didResolver,
      cfg,
    }
    feedGeneration(server, ctx)
    describeGenerator(server, ctx)
    app.use(server.router)
    app.use(wellKnown(ctx))

    return new FeedGenerator(app, db, firehose, cfg)
  }

  async start(): Promise<http.Server> {
    await migrateToLatest(this.db)
    // this.firehose.run(Number(this.cfg.subscriptionReconnectDelay))
    this.firehose.start()
    this.server = this.app.listen(Number(this.cfg.port), this.cfg.listenhost)
    await events.once(this.server, 'listening')
    return this.server
  }
}

export default FeedGenerator
