/**
 * Stock image storage helpers.
 * Stores images as base64 in Cloudflare KV.
 * Falls back to in-memory store for local dev.
 */

import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

const imageMemoryStore = new Map<string, string>()

function getKV(): KVNamespace | null {
  try {
    const ctx = getOptionalRequestContext()
    if (ctx?.env?.STOCK_KV) return ctx.env.STOCK_KV
  } catch {
    // Not available (local dev or build time)
  }
  return null
}

async function kvGet(key: string): Promise<string | null> {
  const kv = getKV()
  if (kv) return kv.get(key)
  return imageMemoryStore.get(key) ?? null
}

async function kvPut(key: string, value: string): Promise<void> {
  const kv = getKV()
  if (kv) return kv.put(key, value)
  imageMemoryStore.set(key, value)
}

async function kvDelete(key: string): Promise<void> {
  const kv = getKV()
  if (kv) return kv.delete(key)
  imageMemoryStore.delete(key)
}

function imageKey(listingId: string, index: number): string {
  return `stock-image:${listingId}:${index}`
}

/** Store an image as base64 in KV */
export async function storeImage(
  listingId: string,
  index: number,
  base64: string,
  contentType: string
): Promise<string> {
  const key = imageKey(listingId, index)
  const payload = JSON.stringify({ data: base64, contentType })
  await kvPut(key, payload)
  return key
}

/** Retrieve an image from KV */
export async function getImage(
  key: string
): Promise<{ data: string; contentType: string } | null> {
  const raw = await kvGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Delete all images for a listing (up to 50 images) */
export async function deleteListingImages(listingId: string): Promise<void> {
  for (let i = 0; i < 50; i++) {
    const key = imageKey(listingId, i)
    const exists = await kvGet(key)
    if (!exists) break
    await kvDelete(key)
  }
}

/** Delete a single image by its KV key */
export async function deleteImage(key: string): Promise<void> {
  await kvDelete(key)
}
