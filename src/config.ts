import { Database } from './db'
import { DidResolver } from '@atproto/identity'

export const config = {
  hostname: process.env.FEEDGEN_HOSTNAME || 'example.com',
  serviceDid: process.env.FEEDGEN_SERVICE_DID || `did:web:${process.env.FEEDGEN_HOSTNAME}`,
  listenhost: process.env.FEEDGEN_LISTENHOST || '0.0.0.0',
  port: process.env.FEEDGEN_PORT || 3000,
  sqliteLocation: process.env.FEEDGEN_SQLITE_LOCATION || ':memory:',
  publisherDid: process.env.FEEDGEN_PUBLISHER_DID || 'did:example:alice',
  subscriptionEndpoint: process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT || 'wss://bsky.network',
  subscriptionReconnectDelay: process.env.FEEDGEN_SUBSCRIPTION_RECONNECT_DELAY || 3000,
};

export type Config = typeof config;

export type AppContext = {
  db: Database
  didResolver: DidResolver
  cfg: Config
}

