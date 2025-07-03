import dotenv from 'dotenv'
dotenv.config()

import FeedGenerator from './server'
import { config } from './config'

const run = async () => {
  console.log(config)
  const server = await FeedGenerator.create(config)
  await server.start()
  console.log(
    `🤖 running feed generator at http://${server.cfg.listenhost}:${server.cfg.port}`,
  )
}

run()
