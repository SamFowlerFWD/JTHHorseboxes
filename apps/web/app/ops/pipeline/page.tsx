"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Phone, Mail, Calendar, User, Building, Tag, TrendingUp, Clock, FileText, Edit, MoreVertical, AlertCircle } from "lucide-react"
import { format } from "date-fns"

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { id: "inquiry", name: "Inquiry", color: "bg-gray-500", probability: 10 },
  { id: "qualification", name: "Qualification", color: "bg-blue-500", probability: 20 },
  { id: "specification", name: "Specification", color: "bg-purple-500", probability: 40 },
  { id: "quotation", name: "Quotation", color: "bg-yellow-500", probability: 60 },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-500", probability: 80 },
  { id: "closed_won", name: "Closed Won", color: "bg-blue-500", probability: 100 },
  { id: "closed_lost", name: "Closed Lost", color: "bg-red-500", probability: 0 },
]

// Initialize empty leads structure
const EMPTY_LEADS = {
  inquiry: [],
  qualification: [],
  specification: [],
  quotation: [],
  negotiation: [],
  closed_won: [],
  closed_lost: [],
}

interface Lead {
  id: string
  organization: string
  contact: string
  email: string
  phone: string
  value: number
  model: string
  assignedTo: string
  createdAt: Date
  nextAction: string
  nextActionDate: Date
  score: number
  tags: string[]
}

interface LeadsByStage {
  [key: string]: Lead[]
}

export default function SalesPipelinePage() {
  const [leads, setLeads] = useState<LeadsByStage>(EMPTY_LEADS)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchLeads()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('pipeline_leads')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'leads' 
      }, () => {
        fetchLeads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/pipeline')
      
      if (!response.ok) {
        throw new Error('Failed to fetch pipeline data')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setLeads(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch leads')
      }
    } catch (err: any) {
      console.error('Pipeline error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate pipeline metrics
  const calculateMetrics = () => {
    const totalLeads = Object.values(leads).flat().length
    const totalValue = Object.values(leads).flat().reduce((sum, lead) => sum + lead.value, 0)
    const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0
    const wonDeals = leads.closed_won?.length || 0
    const lostDeals = leads.closed_lost?.length || 0
    const winRate = wonDeals + lostDeals > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0

    return { totalLeads, totalValue, avgDealSize, winRate }
  }

  const metrics = calculateMetrics()

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceStage = source.droppableId
    const destStage = destination.droppableId

    if (sourceStage === destStage && source.index === destination.index) {
      return
    }

    const newLeads = { ...leads }
    const [movedLead] = newLeads[sourceStage].splice(source.index, 1)
    newLeads[destStage].splice(destination.index, 0, movedLead)

    setLeads(newLeads)

    // Update lead stage in Supabase
    try {
      setIsUpdating(true)
      const response = await fetch('/api/ops/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStage',
          leadId: movedLead.id,
          newStage: destStage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update lead stage')
      }
    } catch (err: any) {
      console.error('Error updating lead stage:', err)
      // Revert the change on error
      fetchLeads()
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-blue-700"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">Manage leads through the sales process</p>
        </div>
        <Button onClick={() => setIsAddLeadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalLeads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pipeline Value</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.totalValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Deal Size</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(metrics.avgDealSize)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl">{metrics.winRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pipeline Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-muted/50 rounded-lg p-4">
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold">{stage.name}</h3>
                    <Badge variant="secondary">{leads[stage.id]?.length || 0}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{stage.probability}%</span>
                </div>

                {/* Stage Value */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      leads[stage.id]?.reduce((sum, lead) => sum + lead.value, 0) || 0
                    )}
                  </p>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[400px] ${
                        snapshot.isDraggingOver ? "bg-muted/80 rounded" : ""
                      }`}
                    >
                      {leads[stage.id]?.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move ${
                                snapshot.isDragging ? "shadow-lg rotate-2" : ""
                              }`}
                              onClick={() => {
                                setSelectedLead(lead)
                                setIsDetailOpen(true)
                              }}
                            >
                              <CardContent className="p-4">
                                {/* Lead Header */}
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-sm">{lead.organization}</h4>
                                    <p className="text-xs text-muted-foreground">{lead.contact}</p>
                                  </div>
                                  <Badge className={getScoreColor(lead.score)}>
                                    {lead.score}
                                  </Badge>
                                </div>

                                {/* Lead Details */}
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    <span>{lead.model}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-semibold">{formatCurrency(lead.value)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{lead.assignedTo}</span>
                                  </div>
                                  {lead.nextActionDate && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                      <Clock className="h-3 w-3" />
                                      <span>{format(lead.nextActionDate, "dd MMM")}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                {lead.tags.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {lead.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Lead Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLead.organization}</DialogTitle>
                <DialogDescription>{selectedLead.contact}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="quotes">Quotes</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedLead.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Model Interest</Label>
                      <p>{selectedLead.model}</p>
                    </div>
                    <div>
                      <Label>Deal Value</Label>
                      <p className="font-semibold">{formatCurrency(selectedLead.value)}</p>
                    </div>
                    <div>
                      <Label>Lead Score</Label>
                      <Badge className={getScoreColor(selectedLead.score)}>
                        {selectedLead.score}/100
                      </Badge>
                    </div>
                    <div>
                      <Label>Assigned To</Label>
                      <p>{selectedLead.assignedTo}</p>
                    </div>
                    <div>
                      <Label>Next Action</Label>
                      <p>{selectedLead.nextAction}</p>
                    </div>
                    <div>
                      <Label>Next Action Date</Label>
                      <p>{format(selectedLead.nextActionDate, "dd MMM yyyy")}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quotes">
                  <div className="text-center py-8 text-muted-foreground">
                    No quotes generated yet
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Lead created</span>
                      <span className="text-muted-foreground">
                        {format(selectedLead.createdAt, "dd MMM yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <Textarea placeholder="Add notes about this lead..." rows={6} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>Enter the lead details below</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" placeholder="Company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" />
            </div>
            <div>
              <Label htmlFor="model">Model Interest</Label>
              <Select>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="principle-35">Principle 3.5t</SelectItem>
                  <SelectItem value="professional-35">Professional 3.5t</SelectItem>
                  <SelectItem value="progeny-35">Progeny 3.5t</SelectItem>
                  <SelectItem value="aeos-45">Aeos 4.5t</SelectItem>
                  <SelectItem value="aeos-45p">Aeos Plus 4.5t</SelectItem>
                  <SelectItem value="zenos-72">Zenos 7.2t</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Lead Source</Label>
              <Select>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="show">Show/Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  setIsUpdating(true)
                  
                  // Get form values
                  const formData = {
                    firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                    lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                    email: (document.getElementById('email') as HTMLInputElement)?.value,
                    phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                    organization: (document.getElementById('organization') as HTMLInputElement)?.value,
                    model: (document.querySelector('[id="model"] + button') as HTMLElement)?.textContent?.replace('Select a model', '') || '',
                    source: (document.querySelector('[id="source"] + button') as HTMLElement)?.textContent?.replace('Select source', '') || 'manual',
                  }

                  const response = await fetch('/api/ops/pipeline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'createLead',
                      ...formData
                    })
                  })

                  if (!response.ok) {
                    throw new Error('Failed to create lead')
                  }

                  setIsAddLeadOpen(false)
                  fetchLeads()
                } catch (err: any) {
                  console.error('Error creating lead:', err)
                  alert('Failed to create lead: ' + err.message)
                } finally {
                  setIsUpdating(false)
                }
              }}>
                {isUpdating ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}