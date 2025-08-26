'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company: string | null
  status: string
  source: string | null
  created_at: string
  quote_amount: number | null
}

function LeadsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLeads, setTotalLeads] = useState(0)

  useEffect(() => {
    fetchLeads()
  }, [currentPage, statusFilter])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Check auth status
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user?.email)
      
      const limit = 20
      const offset = (currentPage - 1) * limit
      
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error, count } = await query
      
      if (error) {
        console.error('Error fetching leads:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        setLeads([])
        setTotalPages(0)
        setTotalLeads(0)
        return
      }
      
      console.log(`Fetched ${data?.length} leads, total count: ${count}`)
      setLeads(data || [])
      setTotalPages(Math.ceil((count || 0) / limit))
      setTotalLeads(count || 0)
    } catch (error) {
      console.error('Error fetching leads:', error)
      setLeads([])
      setTotalPages(0)
      setTotalLeads(0)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) {
        console.error('Error updating lead status:', error)
      } else {
        fetchLeads()
      }
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const handleExport = async () => {
    // Convert leads to CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created At']
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone || '',
        lead.company || '',
        lead.status,
        lead.source || '',
        new Date(lead.created_at).toLocaleDateString(),
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredLeads = leads.filter(lead =>
    searchTerm === '' ||
    lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-900 dark:bg-blue-950/30 dark:text-blue-400'
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Total: {totalLeads} leads</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Status</SelectItem>
                    <SelectItem value="new" className="text-gray-900 dark:text-gray-100">New</SelectItem>
                    <SelectItem value="contacted" className="text-gray-900 dark:text-gray-100">Contacted</SelectItem>
                    <SelectItem value="qualified" className="text-gray-900 dark:text-gray-100">Qualified</SelectItem>
                    <SelectItem value="proposal" className="text-gray-900 dark:text-gray-100">Proposal</SelectItem>
                    <SelectItem value="won" className="text-gray-900 dark:text-gray-100">Won</SelectItem>
                    <SelectItem value="lost" className="text-gray-900 dark:text-gray-100">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Company</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Source</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-600 dark:text-gray-400">
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {lead.first_name} {lead.last_name}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{lead.email}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{lead.company || '-'}</TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => handleStatusChange(lead.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <SelectItem value="new" className="text-gray-900 dark:text-gray-100">New</SelectItem>
                              <SelectItem value="contacted" className="text-gray-900 dark:text-gray-100">Contacted</SelectItem>
                              <SelectItem value="qualified" className="text-gray-900 dark:text-gray-100">Qualified</SelectItem>
                              <SelectItem value="proposal" className="text-gray-900 dark:text-gray-100">Proposal</SelectItem>
                              <SelectItem value="won" className="text-gray-900 dark:text-gray-100">Won</SelectItem>
                              <SelectItem value="lost" className="text-gray-900 dark:text-gray-100">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">{lead.source || 'Website'}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/leads/${lead.id}`)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            aria-label={`View details for ${lead.first_name} ${lead.last_name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No leads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading leads...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <LeadsContent />
    </Suspense>
  )
}