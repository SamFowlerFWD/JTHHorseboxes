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
    const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
    const client = await supabase
    
    switch (body.action) {
      case 'updateStage': {
        const { leadId, newStage, previousStage } = body
        
        // Update lead stage
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
        await client.from('deal_activities').insert({
          deal_id: leadId,
          activity_type: 'stage_change',
          description: `Deal moved from ${previousStage || 'unknown'} to ${newStage}`,
          metadata: { 
            previous_stage: previousStage,
            new_stage: newStage 
          }
        })

        // Check for automation rules
        const { data: automations } = await client
          .from('pipeline_automations')
          .select('*')
          .eq('from_stage', previousStage)
          .eq('to_stage', newStage)
          .eq('active', true)

        // Execute automations
        if (automations && automations.length > 0) {
          for (const automation of automations) {
            await executeAutomation(client, leadId, automation)
          }
        }

        return NextResponse.json({ success: true, data })
      }

      case 'createLead': {
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
            lead_score: 50,
            assigned_to: body.assignedTo || 'Unassigned'
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await client.from('deal_activities').insert({
          deal_id: data.id,
          activity_type: 'lead_created',
          description: 'Lead created manually',
          metadata: { source: body.source || 'manual' }
        })

        return NextResponse.json({ success: true, data })
      }

      case 'updateDeal': {
        const { dealId, updates } = body
        
        const { data, error } = await client
          .from('leads')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', dealId)
          .select()
          .single()

        if (error) throw error

        // Log activity
        await client.from('deal_activities').insert({
          deal_id: dealId,
          activity_type: 'deal_updated',
          description: 'Deal information updated',
          metadata: { updates }
        })

        return NextResponse.json({ success: true, data })
      }

      case 'logActivity': {
        const { dealId, activityType, description, metadata } = body
        
        const { data, error } = await client
          .from('deal_activities')
          .insert({
            deal_id: dealId,
            activity_type: activityType,
            description,
            metadata
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
      }

      case 'createContract': {
        const { dealId, contractData } = body
        
        // Create contract
        const { data: contract, error: contractError } = await client
          .from('contracts')
          .insert({
            deal_id: dealId,
            ...contractData
          })
          .select()
          .single()

        if (contractError) throw contractError

        // Update deal with contract ID
        await client
          .from('leads')
          .update({ 
            contract_id: contract.id,
            contract_status: 'draft'
          })
          .eq('id', dealId)

        // Log activity
        await client.from('deal_activities').insert({
          deal_id: dealId,
          activity_type: 'contract_created',
          description: 'Contract draft created',
          metadata: { contract_id: contract.id }
        })

        return NextResponse.json({ success: true, data: contract })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Pipeline POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}

// Helper function to execute automations
async function executeAutomation(client: any, dealId: string, automation: any) {
  const actions = automation.actions || {}
  
  // Get deal details first - needed for multiple actions
  const { data: deal } = await client
    .from('leads')
    .select('*')
    .eq('id', dealId)
    .single()
  
  if (actions.create_build && deal) {
    // Generate build number
    const year = new Date().getFullYear()
    const { count } = await client
      .from('builds')
      .select('*', { count: 'exact', head: true })
      .like('build_number', `JTH-${year}-%`)
    
    const buildNumber = `JTH-${year}-${String((count || 0) + 1).padStart(4, '0')}`
    
    // Create build record
    await client.from('builds').insert({
      build_number: buildNumber,
      deal_id: dealId,
      model: deal.model_interest,
      configuration: deal.configurator_snapshot || {},
      status: 'pending',
      scheduled_start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      scheduled_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    })
  }
  
  if (actions.send_email) {
    // Queue email notification
    console.log(`Email queued: ${actions.send_email} for deal ${dealId}`)
  }
  
  if (actions.lock_configuration && deal?.configurator_snapshot) {
    // Configuration is already locked in snapshot
    console.log(`Configuration locked for deal ${dealId}`)
  }
}