import { NextRequest, NextResponse } from 'next/server'
import { getPipelineDataOptimized, invalidateLeadsCache } from '@/lib/supabase/optimized-queries'

export async function GET(request: NextRequest) {
  try {
    // Use optimized pipeline query (with caching and no N+1 problem)
    const leadsByStage = await getPipelineDataOptimized()

    return NextResponse.json({
      success: true,
      data: leadsByStage,
      total: Object.values(leadsByStage).flat().length
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
    const supabase = await import('@/lib/supabase/server').then(m => m.createServiceClient())
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

        // Invalidate leads cache after mutation
        invalidateLeadsCache()

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

        // Invalidate leads cache after mutation
        invalidateLeadsCache()

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

        // Invalidate leads cache after mutation
        invalidateLeadsCache()

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
  
  // Get deal details first - needed for multiple actions (with specific columns)
  const { data: deal } = await client
    .from('leads')
    .select('id, model_interest, configurator_snapshot')
    .eq('id', dealId)
    .single()
  
  if (actions.create_build && deal) {
    // Generate build number
    const year = new Date().getFullYear()
    const { count } = await client
      .from('builds')
      .select('id', { count: 'exact', head: true })
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