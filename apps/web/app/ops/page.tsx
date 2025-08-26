"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Truck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

export default function OpsDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    salesPipeline: {
      value: 0,
      change: 0,
      leads: 0,
    },
    production: {
      inProgress: 0,
      scheduled: 0,
      onTime: 0,
      blocked: 0,
    },
    inventory: {
      lowStock: 0,
      reorderNeeded: 0,
      totalItems: 0,
    },
    customers: {
      total: 0,
      new: 0,
      active: 0,
    },
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time subscriptions
    const supabase = createClient()
    
    const leadsChannel = supabase
      .channel('dashboard_leads')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads' 
      }, () => {
        fetchDashboardData()
      })
      .subscribe()

    const jobsChannel = supabase
      .channel('dashboard_jobs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'production_jobs' 
      }, () => {
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(jobsChannel)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/dashboard')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data.metrics)
        setRecentActivities(result.data.recentActivities)
        setUpcomingDeliveries(result.data.upcomingDeliveries)
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Operations Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="sm:size-default">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </Button>
          <Button size="sm" className="sm:size-default">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchDashboardData}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {!loading && !error && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Pipeline Value</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{formatCurrency(stats.salesPipeline.value)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {stats.salesPipeline.change >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-blue-700" />
                  <span className="text-blue-700">+{stats.salesPipeline.change.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{stats.salesPipeline.change.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs last month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.salesPipeline.leads} active leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Production Status</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.production.inProgress} Active</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.production.onTime} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {stats.production.onTime.toFixed(0)}% on schedule
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{stats.production.scheduled} scheduled</span>
              {stats.production.blocked > 0 && (
                <span className="text-orange-600">{stats.production.blocked} blocked</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Inventory Alerts</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.inventory.lowStock} Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">{stats.inventory.reorderNeeded} reorder needed</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.inventory.totalItems} total items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs sm:text-sm">Customers</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.customers.total} Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">+{stats.customers.new} new</span>
              <span className="text-muted-foreground">this month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.customers.active} active deals
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {!loading && !error && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => {
                // Map icon names to components
                const iconMap: any = {
                  'Users': Users,
                  'Activity': Activity,
                  'Package': Package,
                  'CheckCircle2': CheckCircle2,
                  'AlertCircle': AlertCircle,
                }
                const Icon = iconMap[activity.icon] || Users
                
                return (
                  <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${activity.color}`}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(new Date(activity.time))}
                    </span>
                  </div>
                )
              }) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Deliveries</CardTitle>
            <CardDescription>Next scheduled completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeliveries.length > 0 ? upcomingDeliveries.map((delivery) => (
                <div key={delivery.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">{delivery.jobNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{delivery.customer}</p>
                    </div>
                    <Badge variant={
                      delivery.status === "on_track" ? "default" :
                      delivery.status === "at_risk" ? "destructive" :
                      "secondary"
                    }>
                      {delivery.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span>{format(new Date(delivery.date), "dd MMM yyyy")}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming deliveries
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Quick Actions */}
      {!loading && !error && (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">Add Lead</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">Create Quote</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial hidden sm:inline-flex">Update Production</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial hidden sm:inline-flex">Check Inventory</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial hidden sm:inline-flex">View Reports</Button>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}