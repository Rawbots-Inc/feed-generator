export function encodeCursor(timestamp: number, community: string): string {
  const commEnc = Buffer.from(community, 'utf-8').toString('base64')
  return `${timestamp}_${commEnc}`
}

export function decodeCursor(cursor: string): {
  timestamp: number | null
  community?: string
  oldCursor: string
} {
  let community: string | undefined
  let oldCursor: string = cursor

  // format is "<timestamp>::<token>_<community>"
  const sep = cursor.lastIndexOf('_')
  if (sep >= 0) {
    oldCursor = cursor.slice(0, sep) // e.g. "1746705814258::bafyreidhcp7ohvimpwlmcxf3vupu4pbsv6p47dhumlbdfmzk2daduxdskm"
    const commEnc = cursor.slice(sep + 1)
    try {
      community = Buffer.from(commEnc, 'base64').toString('utf-8')
    } catch {
      // Skip
    }
  }

  const [tsPart] = oldCursor.split('::', 2)
  const tsNum = parseInt(tsPart, 10)
  const timestamp = isNaN(tsNum) ? null : tsNum

  return { timestamp, community, oldCursor }
}
