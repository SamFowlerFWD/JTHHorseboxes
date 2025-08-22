import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient()
    
    // Get date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Fetch leads data with proper columns
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, status, configurator_data, created_at, first_name, last_name, company, model_interest')

    // Log but don't throw error for leads
    if (leadsError) {
      console.error('Leads fetch error:', leadsError)
    }

    // Initialize empty arrays if tables don't exist
    let jobs: any[] = []
    let activities: any[] = []
    let orders: any[] = []
    
    // Try to fetch production_jobs but don't fail if table doesn't exist
    const { data: jobsData, error: jobsError } = await supabase
      .from('production_jobs')
      .select('id, status, target_date, priority, current_stage, completed_stages')
    
    if (!jobsError && jobsData) {
      jobs = jobsData
    }

    // Try to fetch recent activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('lead_activities')
      .select(`
        id,
        activity_type,
        description,
        created_at,
        lead_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!activitiesError && activitiesData) {
      activities = activitiesData
    }

    // Try to fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_price, created_at, status, production_job_id')

    if (!ordersError && ordersData) {
      orders = ordersData
    }

    // Calculate pipeline metrics
    const activeLeads = leads?.filter(l => 
      !['closed_won', 'closed_lost', 'completed'].includes(l.status || '')
    ) || []
    
    // Extract quote amount from configurator_data if available
    const pipelineValue = activeLeads.reduce((sum, lead) => {
      const configData = lead.configurator_data as any
      const quoteAmount = configData?.totalPrice || configData?.price || 0
      return sum + quoteAmount
    }, 0)

    const thisMonthLeads = leads?.filter(l => 
      new Date(l.created_at) >= startOfMonth
    ).length || 0

    const lastMonthLeads = leads?.filter(l => 
      new Date(l.created_at) >= startOfLastMonth && 
      new Date(l.created_at) < startOfMonth
    ).length || 0

    const leadChange = lastMonthLeads > 0 
      ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 
      : 0

    // Calculate production metrics
    const inProgressJobs = jobs?.filter(j => j.status === 'in_progress').length || 0
    const scheduledJobs = jobs?.filter(j => j.status === 'scheduled').length || 0
    const blockedJobs = jobs?.filter(j => j.status === 'blocked').length || 0
    
    const onTimeJobs = jobs?.filter(j => {
      const targetDate = new Date(j.target_date)
      return targetDate >= now && j.status !== 'blocked'
    }).length || 0

    const onTimePercentage = jobs && jobs.length > 0 
      ? (onTimeJobs / jobs.length) * 100 
      : 0

    // Calculate inventory alerts (mock data for now)
    const lowStockItems = 4
    const reorderNeeded = 2
    const totalItems = 156

    // Calculate customer metrics
    const uniqueCustomers = new Set([
      ...leads?.map(l => l.id) || [],
    ]).size

    const newCustomersThisMonth = leads?.filter(l => 
      new Date(l.created_at) >= startOfMonth
    ).length || 0

    const activeDeals = activeLeads.length

    // Format recent activities (or use leads as activities if no activities table)
    let formattedActivities: any[] = []
    
    if (activities && activities.length > 0) {
      formattedActivities = activities.map(activity => {
        // Find corresponding lead
        const lead = leads?.find(l => l.id === activity.lead_id)
        let title = ''
        let description = activity.description || ''
        let icon = 'Users'
        let color = 'text-blue-600'

        switch (activity.activity_type) {
          case 'lead_created':
            title = 'New lead from website'
            description = `${lead?.first_name || ''} ${lead?.last_name || ''} - ${lead?.model_interest || 'Model TBD'} inquiry`
            icon = 'Users'
            color = 'text-blue-600'
            break
          case 'stage_change':
            title = 'Lead stage updated'
            description = `${lead?.company || `${lead?.first_name || ''} ${lead?.last_name || ''}`} - ${activity.description}`
            icon = 'Activity'
            color = 'text-purple-600'
            break
          case 'quote_sent':
            title = 'Quote sent'
            description = `${lead?.company || `${lead?.first_name || ''} ${lead?.last_name || ''}`}`
            icon = 'Package'
            color = 'text-green-600'
            break
          default:
            title = activity.activity_type
            description = activity.description || ''
        }

        return {
          id: activity.id,
          type: activity.activity_type,
          title,
          description,
          time: activity.created_at,
          icon,
          color
        }
      })
    } else if (leads && leads.length > 0) {
      // Use recent leads as activities if no activities table
      formattedActivities = leads.slice(0, 10).map(lead => ({
        id: lead.id,
        type: 'lead_created',
        title: 'New lead from website',
        description: `${lead.first_name || ''} ${lead.last_name || ''} - ${lead.model_interest || 'Model TBD'} inquiry`,
        time: lead.created_at,
        icon: 'Users',
        color: 'text-blue-600'
      }))
    }

    // Get upcoming deliveries
    const upcomingDeliveries = jobs?.filter(j => {
      const targetDate = new Date(j.target_date)
      return targetDate >= now && j.status !== 'delivered'
    })
    .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())
    .slice(0, 5)
    .map(job => ({
      id: job.id,
      jobNumber: `JOB-${job.id.slice(0, 8)}`,
      customer: 'Customer TBD', // Would need to join with orders
      model: 'Model TBD',
      date: job.target_date,
      status: job.status === 'blocked' ? 'at_risk' : 
              job.status === 'in_progress' ? 'on_track' : 
              'scheduled'
    })) || []

    const metrics = {
      salesPipeline: {
        value: pipelineValue,
        change: leadChange,
        leads: activeLeads.length,
      },
      production: {
        inProgress: inProgressJobs,
        scheduled: scheduledJobs,
        onTime: onTimePercentage,
        blocked: blockedJobs,
      },
      inventory: {
        lowStock: lowStockItems,
        reorderNeeded: reorderNeeded,
        totalItems: totalItems,
      },
      customers: {
        total: uniqueCustomers,
        new: newCustomersThisMonth,
        active: activeDeals,
      },
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        metrics,
        recentActivities: formattedActivities,
        upcomingDeliveries
      }
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}