import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, DollarSign, BookOpen, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

async function getStatistics() {
  const supabase = await createClient()
  
  // Get counts for each entity
  const [leads, blogPosts, pricingOptions, knowledgeBase] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('pricing_options').select('*', { count: 'exact', head: true }),
    supabase.from('knowledge_base').select('*', { count: 'exact', head: true }),
  ])

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('id, first_name, last_name, email, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from('lead_activities')
    .select('*, leads(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    stats: {
      leads: leads.count || 0,
      blogPosts: blogPosts.count || 0,
      pricingOptions: pricingOptions.count || 0,
      knowledgeBase: knowledgeBase.count || 0,
    },
    recentLeads: recentLeads || [],
    recentActivities: recentActivities || [],
  }
}

export default async function AdminDashboard() {
  const { stats, recentLeads, recentActivities } = await getStatistics()

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.leads,
      icon: Users,
      href: '/admin/leads',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      icon: FileText,
      href: '/admin/blog',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    },
    {
      title: 'Pricing Options',
      value: stats.pricingOptions,
      icon: DollarSign,
      href: '/admin/pricing',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Knowledge Base',
      value: stats.knowledgeBase,
      icon: BookOpen,
      href: '/admin/knowledge-base',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Click to manage
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Recent Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{lead.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === 'new'
                          ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-900 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {lead.status}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No leads yet</p>
                )}
              </div>
              <Link
                href="/admin/leads"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4"
              >
                View all leads →
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.leads?.first_name} {activity.leads?.last_name}
                          </span>
                          {' - '}
                          <span className="text-gray-600 dark:text-gray-400">
                            {activity.activity_type.replace('_', ' ')}
                          </span>
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No activities yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/leads?status=new"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">View New Leads</span>
              </Link>
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Create Blog Post</span>
              </Link>
              <Link
                href="/admin/pricing"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Update Pricing</span>
              </Link>
              <Link
                href="/admin/knowledge-base/new"
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">Add Knowledge</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}