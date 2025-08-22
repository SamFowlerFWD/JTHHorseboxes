import { NextRequest, NextResponse } from 'next/server'
import { opsServer } from '@/lib/supabase/ops'

export async function GET(request: NextRequest) {
  try {
    const leads = await opsServer.getAllLeads()
    
    // Group leads by stage
    const leadsByStage = leads.reduce((acc: any, lead) => {
      const stage = lead.stage || 'inquiry'
      if (!acc[stage]) {
        acc[stage] = []
      }
      acc[stage].push({
        id: lead.id,
        organization: lead.company || `${lead.first_name} ${lead.last_name}`,
        contact: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        phone: lead.phone,
        value: lead.quote_amount || 0,
        model: lead.model_interest || 'Not specified',
        assignedTo: lead.assigned_to || 'Unassigned',
        createdAt: lead.created_at,
        nextAction: lead.next_action,
        nextActionDate: lead.next_action_date,
        score: lead.lead_score || 50,
        tags: lead.tags || [],
        stage: stage,
        notes: lead.notes,
        activities: lead.lead_activities || []
      })
      return acc
    }, {})

    // Ensure all stages have arrays
    const stages = ['inquiry', 'qualification', 'specification', 'quotation', 'negotiation', 'closed_won', 'closed_lost']
    stages.forEach(stage => {
      if (!leadsByStage[stage]) {
        leadsByStage[stage] = []
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: leadsByStage,
      total: leads.length 
    })
  } catch (error: any) {
    console.error('Pipeline API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pipeline data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'updateStage') {
      const { leadId, newStage } = body
      const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
      const client = await supabase
      
      const { data, error } = await client
        .from('leads')
        .update({ 
          stage: newStage, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await client.from('lead_activities').insert({
        lead_id: leadId,
        activity_type: 'stage_change',
        description: `Lead moved to ${newStage}`,
        metadata: { new_stage: newStage }
      })

      return NextResponse.json({ success: true, data })
    }

    if (body.action === 'createLead') {
      const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
      const client = await supabase
      
      const { data, error } = await client
        .from('leads')
        .insert({
          first_name: body.firstName,
          last_name: body.lastName,
          email: body.email,
          phone: body.phone,
          company: body.organization,
          model_interest: body.model,
          source: body.source || 'manual',
          stage: 'inquiry',
          lead_score: 50
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await client.from('lead_activities').insert({
        lead_id: data.id,
        activity_type: 'lead_created',
        description: 'Lead created manually',
      })

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Pipeline POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}