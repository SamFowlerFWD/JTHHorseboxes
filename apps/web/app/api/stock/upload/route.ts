import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { storeImage } from '@/lib/stock/images'

export const runtime = 'edge'

/** POST — upload images for a stock listing (admin only) */
export async function POST(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const formData = await request.formData()
    const listingId = formData.get('listingId') as string
    const startIndex = parseInt((formData.get('startIndex') as string) || '0', 10)

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const imagePaths: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file || typeof file === 'string') continue

      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      // Convert to base64
      let binary = ''
      for (let j = 0; j < bytes.length; j++) {
        binary += String.fromCharCode(bytes[j])
      }
      const base64 = btoa(binary)
      const contentType = file.type || 'image/jpeg'
      const index = startIndex + i

      const key = await storeImage(listingId, index, base64, contentType)
      imagePaths.push(`/api/stock/images/${encodeURIComponent(key)}`)
    }

    return NextResponse.json({ imagePaths }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload images'
    console.error('Error uploading images:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
