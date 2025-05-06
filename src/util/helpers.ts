export function encodeCursor(timestamp: number, community: string): string {
  const commEnc = Buffer.from(community, 'utf-8').toString('base64')
  return `${timestamp}_${commEnc}`
}

export function decodeCursor(cursor: string): {
  timestamp: number
  community: string
} {
  // split bằng regex, (.+) sẽ match toàn bộ phần còn lại (có thể chứa _)
  const parts = cursor.split(/_(.+)/)
  if (parts.length < 2) {
    throw new Error(`Invalid cursor format: ${cursor}`)
  }
  const tsStr = parts[0]
  const commEnc = parts[1]
  const community = Buffer.from(commEnc, 'base64').toString('utf-8')
  return {
    timestamp: parseInt(tsStr, 10),
    community,
  }
}
