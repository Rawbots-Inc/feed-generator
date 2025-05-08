export function encodeCursor(timestamp: number, community: string): string {
  const commEnc = Buffer.from(community, 'utf-8').toString('base64')
  return `${timestamp}_${commEnc}`
}

export function decodeCursor(cursor: string): {
  timestamp: number | null
  community: string
  oldCursor: string
} {
  const sep = cursor.lastIndexOf('_')
  if (sep < 0) {
    throw new Error(`Invalid composite cursor format (no "_"): ${cursor}`)
  }
  // format is "<timestamp>::<token>_<community>"
  const oldCursor = cursor.slice(0, sep) // e.g. "1746705814258::bafyreidhcp7ohvimpwlmcxf3vupu4pbsv6p47dhumlbdfmzk2daduxdskm"
  const commEnc = cursor.slice(sep + 1)

  const community = Buffer.from(commEnc, 'base64').toString('utf-8')

  const tsPart = oldCursor.split('::', 2)[0]
  const tsNum = parseInt(tsPart, 10)
  const timestamp = isNaN(tsNum) ? null : tsNum

  return { timestamp, community, oldCursor }
}
