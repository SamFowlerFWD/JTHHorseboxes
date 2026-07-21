import type { StockListing, CreateStockInput, UpdateStockInput } from './types'

/**
 * Stock KV operations.
 * Uses Cloudflare KV binding (STOCK_KV) via getOptionalRequestContext,
 * falls back to in-memory store for local dev.
 */

import { getOptionalRequestContext } from '@cloudflare/next-on-pages'

const memoryStore = new Map<string, string>()

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
  return memoryStore.get(key) ?? null
}

async function kvPut(key: string, value: string): Promise<void> {
  const kv = getKV()
  if (kv) return kv.put(key, value)
  memoryStore.set(key, value)
}

async function kvDelete(key: string): Promise<void> {
  const kv = getKV()
  if (kv) return kv.delete(key)
  memoryStore.delete(key)
}

const INDEX_KEY = 'stock:index'

function itemKey(id: string): string {
  return `stock:${id}`
}

async function getIndex(): Promise<string[]> {
  const raw = await kvGet(INDEX_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function setIndex(ids: string[]): Promise<void> {
  await kvPut(INDEX_KEY, JSON.stringify(ids))
}

export async function getAllStock(statusFilter?: string): Promise<StockListing[]> {
  const ids = await getIndex()
  const listings: StockListing[] = []

  for (const id of ids) {
    const raw = await kvGet(itemKey(id))
    if (raw) {
      try {
        const item: StockListing = JSON.parse(raw)
        if (!statusFilter || statusFilter === 'all' || item.status === statusFilter) {
          listings.push(item)
        }
      } catch {
        // Skip malformed entries
      }
    }
  }

  listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return listings
}

export async function getStockById(id: string): Promise<StockListing | null> {
  const raw = await kvGet(itemKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function createStock(data: CreateStockInput): Promise<StockListing> {
  const now = new Date().toISOString()
  const listing: StockListing = {
    ...data,
    primaryImage: data.primaryImage ?? 0,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  await kvPut(itemKey(listing.id), JSON.stringify(listing))
  const ids = await getIndex()
  ids.push(listing.id)
  await setIndex(ids)

  return listing
}

export async function updateStock(id: string, data: UpdateStockInput): Promise<StockListing | null> {
  const existing = await getStockById(id)
  if (!existing) return null

  const updated: StockListing = {
    ...existing,
    ...data,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvPut(itemKey(id), JSON.stringify(updated))
  return updated
}

export async function deleteStockById(id: string): Promise<boolean> {
  const existing = await getStockById(id)
  if (!existing) return false

  await kvDelete(itemKey(id))
  const ids = await getIndex()
  await setIndex(ids.filter((i) => i !== id))

  return true
}
