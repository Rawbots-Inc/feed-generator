export function encodeCursor(timestamp: number, community: string): string {
  const commEnc = Buffer.from(community, 'utf-8').toString('base64')
  return `${timestamp}_${commEnc}`
}

export function decodeCursor(
    cursor: string
  ): { timestamp: number | null; community: string } {
    const parts = cursor.split(/_(.+)/)
    if (parts.length < 2) {
      throw new Error(`Invalid cursor format: ${cursor}`)
    }
    const tsStr = parts[0]
    const commEnc = parts[1]
    let timestamp: number | null = null
    if (tsStr) {
      const parsed = parseInt(tsStr, 10)
      timestamp = isNaN(parsed) ? null : parsed
    }
    const community = Buffer.from(commEnc, 'base64').toString('utf-8')
    return { timestamp, community }
  }
  
