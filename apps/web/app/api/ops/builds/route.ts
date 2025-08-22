import { NextRequest, NextResponse } from 'next/server'
import { opsServer } from '@/lib/supabase/ops'

export async function GET(request: NextRequest) {
  try {
    const jobs = await opsServer.getAllProductionJobs()
    
    // Format jobs for the UI
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      jobNumber: job.job_number,
      orderNumber: job.order_number,
      customer: job.customer_name,
      model: job.model,
      chassisNumber: job.chassis_number || 'Pending',
      registration: job.registration || 'Pending',
      status: job.status,
      currentStage: job.current_stage,
      priority: job.priority,
      startDate: job.start_date,
      targetDate: job.target_date,
      completedStages: job.completed_stages || [],
      stageProgress: job.stage_progress || {},
      assignedTeam: job.assigned_team || [],
      issues: job.issues || [],
      photos: job.photos || [],
      notes: job.notes,
      order: job.orders
    }))

    return NextResponse.json({ 
      success: true, 
      data: formattedJobs,
      total: formattedJobs.length 
    })
  } catch (error: any) {
    console.error('Builds API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch production jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'updateStage') {
      const { jobId, stageId, progress } = body
      const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
      const client = await supabase
      
      // Get current job
      const { data: job, error: fetchError } = await client
        .from('production_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (fetchError) throw fetchError

      // Update stage progress
      const stageProgress = (job.stage_progress as any) || {}
      stageProgress[stageId] = { ...stageProgress[stageId], ...progress }

      // Update completed stages if needed
      let completedStages = job.completed_stages || []
      if (progress.status === 'completed' && !completedStages.includes(stageId)) {
        completedStages.push(stageId)
      }

      // Update current stage if in progress
      let currentStage = job.current_stage
      if (progress.status === 'in_progress') {
        currentStage = stageId
      }

      // Determine overall job status
      let status = job.status
      if (progress.status === 'blocked') {
        status = 'blocked'
      } else if (completedStages.length === 8) { // All stages complete
        status = 'ready'
      } else if (currentStage) {
        status = 'in_progress'
      }

      const { data, error } = await client
        .from('production_jobs')
        .update({
          stage_progress: stageProgress,
          completed_stages: completedStages,
          current_stage: currentStage,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }

    if (body.action === 'createJob') {
      const jobNumber = `JOB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      
      const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
      const client = await supabase
      
      // Initialize stage progress
      const stages = ['chassis_prep', 'floor_walls', 'electrical', 'plumbing', 'interior', 'painting', 'testing', 'final']
      const stageProgress = stages.reduce((acc, stage) => ({
        ...acc,
        [stage]: { status: 'pending', completion: 0, hours: 0 }
      }), {})

      const { data, error } = await client
        .from('production_jobs')
        .insert({
          job_number: jobNumber,
          order_number: body.orderNumber,
          customer_name: body.customerName,
          model: body.model,
          chassis_number: body.chassisNumber,
          registration: body.registration,
          status: 'scheduled',
          priority: body.priority || 999,
          start_date: body.startDate,
          target_date: body.targetDate,
          stage_progress: stageProgress,
          completed_stages: [],
          assigned_team: body.assignedTeam || []
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }

    if (body.action === 'addIssue') {
      const { jobId, issue } = body
      const supabase = await import('@/lib/supabase/server').then(m => m.createServiceSupabaseClient())
      const client = await supabase
      
      // Get current job
      const { data: job, error: fetchError } = await client
        .from('production_jobs')
        .select('issues, status')
        .eq('id', jobId)
        .single()

      if (fetchError) throw fetchError

      const issues = job.issues || []
      issues.push({
        id: crypto.randomUUID(),
        stage: issue.stage,
        description: issue.description,
        severity: issue.severity,
        created_at: new Date().toISOString()
      })

      const { data, error } = await client
        .from('production_jobs')
        .update({ 
          issues,
          status: issue.severity === 'high' ? 'blocked' : job.status
        })
        .eq('id', jobId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Builds POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}