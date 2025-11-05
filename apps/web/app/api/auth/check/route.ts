import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient()
    
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session'
      })
    }
    
    // Try to get profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, department, is_active')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      // Profile table might not exist or user might not have a profile
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email
        },
        profile: null,
        profileError: profileError.message
      })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile
    })
  } catch (error: any) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      authenticated: false,
      error: error.message
    })
  }
}