import { createClient } from './client'
import { createServiceSupabaseClient } from './server'
import type { Database } from './types'

// Types for operations
export type Lead = Database['public']['Tables']['leads']['Row']
export type ProductionJob = Database['public']['Tables']['production_jobs']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type LeadActivity = Database['public']['Tables']['lead_activities']['Row']

// Pipeline stages
export const PIPELINE_STAGES = [
  { id: 'inquiry', name: 'Inquiry', color: 'bg-gray-500', probability: 10 },
  { id: 'qualification', name: 'Qualification', color: 'bg-blue-500', probability: 20 },
  { id: 'specification', name: 'Specification', color: 'bg-purple-500', probability: 40 },
  { id: 'quotation', name: 'Quotation', color: 'bg-yellow-500', probability: 60 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', probability: 80 },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-500', probability: 100 },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-500', probability: 0 },
]

// Production stages
export const PRODUCTION_STAGES = [
  { id: 'chassis_prep', name: 'Chassis Preparation', estimatedHours: 16 },
  { id: 'floor_walls', name: 'Floor & Walls', estimatedHours: 24 },
  { id: 'electrical', name: 'Electrical Installation', estimatedHours: 16 },
  { id: 'plumbing', name: 'Plumbing', estimatedHours: 12 },
  { id: 'interior', name: 'Interior Fit Out', estimatedHours: 32 },
  { id: 'painting', name: 'Painting', estimatedHours: 20 },
  { id: 'testing', name: 'Testing & QC', estimatedHours: 8 },
  { id: 'final', name: 'Final Inspection', estimatedHours: 4 },
]

// Helper functions for client-side operations
export const opsClient = {
  // Fetch leads for pipeline
  async getLeads() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Update lead stage
  async updateLeadStage(leadId: string, stage: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      activity_type: 'stage_change',
      description: `Lead moved to ${stage}`,
      metadata: { new_stage: stage }
    })

    return data
  },

  // Create new lead
  async createLead(lead: Omit<Database['public']['Tables']['leads']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: data.id,
      activity_type: 'lead_created',
      description: 'Lead created',
    })

    return data
  },

  // Fetch production jobs
  async getProductionJobs() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('production_jobs')
      .select('*')
      .order('priority', { ascending: true })

    if (error) throw error
    return data
  },

  // Update production stage
  async updateProductionStage(jobId: string, stageId: string, progress: any) {
    const supabase = createClient()
    
    // First get the current job
    const { data: job, error: fetchError } = await supabase
      .from('production_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError) throw fetchError

    // Update stage progress
    const stageProgress = job.stage_progress as any || {}
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

    const { data, error } = await supabase
      .from('production_jobs')
      .update({
        stage_progress: stageProgress,
        completed_stages: completedStages,
        current_stage: currentStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Fetch dashboard metrics
  async getDashboardMetrics() {
    const supabase = createClient()
    
    // Fetch leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, stage, quote_amount, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (leadsError) throw leadsError

    // Fetch production jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('production_jobs')
      .select('id, status, target_date')

    if (jobsError) throw jobsError

    // Fetch recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('lead_activities')
      .select('*, leads!inner(first_name, last_name, company)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (activitiesError) throw activitiesError

    // Calculate metrics
    const pipelineValue = leads?.reduce((sum, lead) => sum + (lead.quote_amount || 0), 0) || 0
    const activeLeads = leads?.filter(l => !['closed_won', 'closed_lost'].includes(l.stage || '')).length || 0
    const inProgressJobs = jobs?.filter(j => j.status === 'in_progress').length || 0
    const onScheduleJobs = jobs?.filter(j => new Date(j.target_date) >= new Date()).length || 0

    return {
      pipelineValue,
      activeLeads,
      inProgressJobs,
      onScheduleJobs,
      totalJobs: jobs?.length || 0,
      recentActivities: activities || []
    }
  },

  // Subscribe to real-time updates
  subscribeToLeads(callback: (payload: any) => void) {
    const supabase = createClient()
    return supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, callback)
      .subscribe()
  },

  subscribeToProductionJobs(callback: (payload: any) => void) {
    const supabase = createClient()
    return supabase
      .channel('production_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production_jobs' }, callback)
      .subscribe()
  }
}

// Helper functions for server-side operations (with service role)
export const opsServer = {
  // Get all leads with full details
  async getAllLeads() {
    const supabase = await createServiceSupabaseClient()
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_activities (
          id,
          activity_type,
          description,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get all production jobs with full details
  async getAllProductionJobs() {
    const supabase = await createServiceSupabaseClient()
    const { data, error } = await supabase
      .from('production_jobs')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name,
          total_price
        )
      `)
      .order('priority', { ascending: true })

    if (error) throw error
    return data
  },

  // Create production job from order
  async createProductionJob(orderId: string, jobDetails: any) {
    const supabase = await createServiceSupabaseClient()
    
    // Generate job number
    const jobNumber = `JOB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    
    const { data, error } = await supabase
      .from('production_jobs')
      .insert({
        job_number: jobNumber,
        ...jobDetails,
        stage_progress: PRODUCTION_STAGES.reduce((acc, stage) => ({
          ...acc,
          [stage.id]: { status: 'pending', completion: 0, hours: 0 }
        }), {}),
        completed_stages: [],
        status: 'scheduled'
      })
      .select()
      .single()

    if (error) throw error

    // Update order with production job ID
    await supabase
      .from('orders')
      .update({ production_job_id: data.id })
      .eq('id', orderId)

    return data
  }
}