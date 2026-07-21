import { NextRequest, NextResponse } from 'next/server'
import { getImage } from '@/lib/stock/images'

export const runtime = 'edge'

/** GET — serve a stock image from KV (public, no auth required) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  // The key is URL-encoded; decode colons
  const decodedKey = decodeURIComponent(key)
  const image = await getImage(decodedKey)

  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Decode base64 to binary
  const binaryStr = atob(image.data)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
