import { NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'

export const runtime = 'edge'

export async function GET() {
  try {
    const cfg = await loadPricingConfig()
    return NextResponse.json({ agents: cfg.agents })
  } catch (error: any) {
    console.error('Error loading agents:', error)
    return NextResponse.json(
      { error: 'Failed to load agents' },
      { status: 500 }
    )
  }
}
