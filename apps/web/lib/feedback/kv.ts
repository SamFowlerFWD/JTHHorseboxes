import type {
  FeedbackNote,
  CreateFeedbackInput,
  UpdateFeedbackInput,
} from './types'

/**
 * Feedback KV operations.
 *
 * Shares the STOCK_KV binding under a `feedback:` key prefix rather than
 * taking its own namespace — the review tool is short-lived per project and
 * this avoids a Cloudflare provisioning step. If it outlives its usefulness
 * here, split it onto a dedicated binding; only the two constants below and
 * the wrangler.toml entry would need to change.
 *
 * Falls back to an in-memory store for local dev, matching lib/stock/kv.ts.
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

const INDEX_KEY = 'feedback:index'

function itemKey(id: string): string {
  return `feedback:${id}`
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

/** All notes, newest first. Pass a path to scope to a single page. */
export async function getAllFeedback(path?: string): Promise<FeedbackNote[]> {
  const ids = await getIndex()
  const notes: FeedbackNote[] = []

  for (const id of ids) {
    const raw = await kvGet(itemKey(id))
    if (!raw) continue
    try {
      const note: FeedbackNote = JSON.parse(raw)
      if (!path || note.path === path) notes.push(note)
    } catch {
      // Skip malformed entries
    }
  }

  notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return notes
}

export async function getFeedbackById(id: string): Promise<FeedbackNote | null> {
  const raw = await kvGet(itemKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function createFeedback(data: CreateFeedbackInput): Promise<FeedbackNote> {
  const now = new Date().toISOString()
  const note: FeedbackNote = {
    ...data,
    id: crypto.randomUUID(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
  }

  await kvPut(itemKey(note.id), JSON.stringify(note))
  const ids = await getIndex()
  ids.push(note.id)
  await setIndex(ids)

  return note
}

export async function updateFeedback(
  id: string,
  data: UpdateFeedbackInput
): Promise<FeedbackNote | null> {
  const existing = await getFeedbackById(id)
  if (!existing) return null

  const updated: FeedbackNote = {
    ...existing,
    ...data,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }

  await kvPut(itemKey(id), JSON.stringify(updated))
  return updated
}

export async function deleteFeedbackById(id: string): Promise<boolean> {
  const existing = await getFeedbackById(id)
  if (!existing) return false

  await kvDelete(itemKey(id))
  const ids = await getIndex()
  await setIndex(ids.filter((i) => i !== id))

  return true
}
