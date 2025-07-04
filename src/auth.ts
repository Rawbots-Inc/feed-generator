import express from 'express'
import { verifyJwt, parseReqNsid } from '@atproto/xrpc-server'
import { DidResolver } from '@atproto/identity'
import { decodeJwt } from 'jose'

export const validateAuth = async (
  req: express.Request,
  serviceDid: string,
  didResolver: DidResolver,
): Promise<string | undefined> => {
  const { authorization = '' } = req.headers
  if (!authorization.startsWith('Bearer ')) {
    return undefined
  }
  const jwt = authorization.replace('Bearer ', '').trim()
  const nsid = parseReqNsid(req)
  const parsed = await verifyJwt(jwt, serviceDid, nsid, async (did: string) => {
    return didResolver.resolveAtprotoKey(did)
  })
  return parsed.iss
}

export const getRequesterDid = async (req: express.Request): Promise<string | undefined> => {
  const { authorization = '' } = req.headers
  if (!authorization.startsWith('Bearer ')) return undefined
  const jwt = authorization.slice(7).trim()
  const { sub } = decodeJwt(jwt)
  return sub
} 