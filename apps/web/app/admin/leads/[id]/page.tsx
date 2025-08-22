import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building, Calendar, MapPin, MessageSquare, DollarSign, Truck, Package, CheckCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

async function getLead(id: string) {
  const supabase = await createClient()
  
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !lead) {
    notFound()
  }
  
  // Get lead activities
  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
  
  return { lead, activities: activities || [] }
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const { lead, activities } = await getLead(params.id)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'contacted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'proposal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'won': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/leads">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Leads
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lead.first_name} {lead.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Lead Details</p>
            </div>
          </div>
          <Badge className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
        </div>
        
        {/* Contact Information */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lead.email}</p>
                </div>
              </div>
              
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{lead.phone}</p>
                  </div>
                </div>
              )}
              
              {lead.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{lead.company}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(lead.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead Source & Campaign */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Source & Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Source</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{lead.source || 'Direct'}</p>
              </div>
              {lead.utm_source && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UTM Source</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lead.utm_source}</p>
                </div>
              )}
              {lead.utm_medium && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UTM Medium</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lead.utm_medium}</p>
                </div>
              )}
              {lead.utm_campaign && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UTM Campaign</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lead.utm_campaign}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quote Information */}
          {(lead.quote_amount || lead.configuration) && (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Quote Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.quote_amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quote Amount</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        £{lead.quote_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {lead.configuration && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Has Configuration</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Horsebox Configuration */}
        {lead.configuration && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Truck className="h-5 w-5" />
                Horsebox Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                try {
                  const config = typeof lead.configuration === 'string' 
                    ? JSON.parse(lead.configuration) 
                    : lead.configuration
                  
                  return (
                    <div className="space-y-6">
                      {/* Model Information */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Selected Model</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {config.model_name || config.model}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Base Price: £{((config.base_price || 0) / 100).toLocaleString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {config.model}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Selected Options */}
                      {config.selected_options && config.selected_options.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                            Selected Options ({config.selected_options.length})
                          </h4>
                          <div className="space-y-2">
                            {config.selected_options.reduce((acc: any[], option: any) => {
                              const category = option.category || 'Other'
                              const existingCategory = acc.find(c => c.category === category)
                              if (existingCategory) {
                                existingCategory.options.push(option)
                              } else {
                                acc.push({ category, options: [option] })
                              }
                              return acc
                            }, []).map((group: any) => (
                              <div key={group.category} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                  {group.category}
                                </p>
                                <div className="space-y-1">
                                  {group.options.map((option: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-900 dark:text-gray-100">{option.name}</span>
                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {option.price === 0 ? 'Included' : `£${(option.price / 100).toLocaleString()}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Pricing Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pricing Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              £{((config.total_price || 0) / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">VAT (20%)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              £{((config.vat_amount || 0) / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">Total (inc. VAT)</span>
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                £{((config.total_with_vat || 0) / 100).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Configuration Date */}
                      {config.created_at && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Configured on: {new Date(config.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      )}
                    </div>
                  )
                } catch (error) {
                  console.error('Error parsing configuration:', error)
                  return (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Unable to display configuration details</p>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-x-auto">
                        {JSON.stringify(lead.configuration, null, 2)}
                      </pre>
                    </div>
                  )
                }
              })()}
            </CardContent>
          </Card>
        )}
        
        {/* Notes */}
        {lead.notes && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.notes}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Activity Timeline */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.activity_type.replace('_', ' ').charAt(0).toUpperCase() + 
                         activity.activity_type.replace('_', ' ').slice(1)}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(activity.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No activities recorded yet
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Marketing Consent */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Marketing Consent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Marketing emails: {' '}
              <span className={`font-medium ${lead.consent_marketing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {lead.consent_marketing ? 'Consented' : 'Not consented'}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}