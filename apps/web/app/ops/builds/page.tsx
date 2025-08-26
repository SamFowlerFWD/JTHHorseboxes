"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar,
  Clock,
  Truck,
  User,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Upload,
  Camera,
  FileText,
  Settings,
  BarChart3,
  Wrench,
  Package,
  Zap,
  Droplets,
  Paintbrush,
  Shield,
  Flag
} from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"

// Production stages with icons
const PRODUCTION_STAGES = [
  { id: "chassis_prep", name: "Chassis Preparation", icon: Wrench, estimatedHours: 16 },
  { id: "floor_walls", name: "Floor & Walls", icon: Package, estimatedHours: 24 },
  { id: "electrical", name: "Electrical Installation", icon: Zap, estimatedHours: 16 },
  { id: "plumbing", name: "Plumbing", icon: Droplets, estimatedHours: 12 },
  { id: "interior", name: "Interior Fit Out", icon: Settings, estimatedHours: 32 },
  { id: "painting", name: "Painting", icon: Paintbrush, estimatedHours: 20 },
  { id: "testing", name: "Testing & QC", icon: Shield, estimatedHours: 8 },
  { id: "final", name: "Final Inspection", icon: CheckCircle2, estimatedHours: 4 },
]

// Empty initial state
const EMPTY_JOBS: ProductionJob[] = []

interface ProductionJob {
  id: string
  jobNumber: string
  orderNumber: string
  customer: string
  model: string
  chassisNumber: string
  registration: string
  status: string
  currentStage: string | null
  priority: number
  startDate: Date
  targetDate: Date
  completedStages: string[]
  stageProgress: Record<string, { status: string; completion: number; hours: number }>
  assignedTeam: string[]
  issues: Array<{ stage: string; description: string; severity: string }>
  photos: Array<{ stage: string; url: string; caption: string; date: Date }>
}

export default function ProductionTrackingPage() {
  const [jobs, setJobs] = useState<ProductionJob[]>(EMPTY_JOBS)
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdateStageOpen, setIsUpdateStageOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchJobs()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('production_jobs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'production_jobs' 
      }, () => {
        fetchJobs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/builds')
      
      if (!response.ok) {
        throw new Error('Failed to fetch production jobs')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Parse dates and ensure proper structure
        const parsedJobs = result.data.map((job: any) => ({
          ...job,
          startDate: new Date(job.startDate),
          targetDate: new Date(job.targetDate),
          stageProgress: job.stageProgress || {},
          completedStages: job.completedStages || [],
          assignedTeam: job.assignedTeam || [],
          issues: job.issues || [],
          photos: job.photos || []
        }))
        setJobs(parsedJobs)
      } else {
        throw new Error(result.error || 'Failed to fetch jobs')
      }
    } catch (err: any) {
      console.error('Production error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate overall progress for a job
  const calculateOverallProgress = (job: ProductionJob) => {
    const totalStages = PRODUCTION_STAGES.length
    const completedCount = job.completedStages.length
    const currentStageProgress = job.currentStage && job.stageProgress[job.currentStage]
      ? job.stageProgress[job.currentStage].completion / 100 
      : 0
    return ((completedCount + currentStageProgress) / totalStages) * 100
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-gray-500"
      case "in_progress": return "bg-blue-500"
      case "blocked": return "bg-orange-500"
      case "quality_check": return "bg-purple-500"
      case "ready": return "bg-blue-500"
      case "delivered": return "bg-emerald-600"
      default: return "bg-gray-400"
    }
  }

  // Get stage status color
  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-gray-400"
      case "in_progress": return "text-blue-500"
      case "blocked": return "text-orange-500"
      case "completed": return "text-blue-500"
      default: return "text-gray-400"
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (targetDate: Date) => {
    const days = differenceInDays(targetDate, new Date())
    if (days < 0) return { value: Math.abs(days), label: "overdue", color: "text-red-600" }
    if (days <= 7) return { value: days, label: "days left", color: "text-orange-600" }
    return { value: days, label: "days left", color: "text-gray-600" }
  }

  // Filter jobs
  const filteredJobs = filterStatus === "all" 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus)

  // Calculate metrics
  const metrics = {
    totalJobs: jobs.length,
    inProgress: jobs.filter(j => j.status === "in_progress").length,
    onSchedule: jobs.filter(j => differenceInDays(j.targetDate, new Date()) >= 0).length,
    avgCompletion: jobs.reduce((sum, job) => sum + calculateOverallProgress(job), 0) / jobs.length,
  }

  const handleStageUpdate = async (jobId: string, stageId: string, update: any) => {
    try {
      setIsUpdating(true)
      
      const response = await fetch('/api/ops/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStage',
          jobId,
          stageId,
          progress: update
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update stage')
      }

      // Refresh jobs list
      await fetchJobs()
      setIsUpdateStageOpen(false)
    } catch (err: any) {
      console.error('Error updating stage:', err)
      alert('Failed to update stage: ' + err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Production Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor build progress across all jobs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading production data...</p>
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
              <Button size="sm" variant="outline" onClick={fetchJobs}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      {!loading && !error && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Total Jobs</CardDescription>
            <CardTitle className="text-lg sm:text-2xl">{metrics.totalJobs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">In Progress</CardDescription>
            <CardTitle className="text-lg sm:text-2xl">{metrics.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">On Schedule</CardDescription>
            <CardTitle className="text-lg sm:text-2xl">{metrics.onSchedule}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Avg Completion</CardDescription>
            <CardTitle className="text-lg sm:text-2xl">{metrics.avgCompletion.toFixed(0)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>
      )}

      {/* Production Jobs Grid */}
      {!loading && !error && (
      <div className="grid gap-4">
        {filteredJobs.map((job) => {
          const progress = calculateOverallProgress(job)
          const daysInfo = getDaysRemaining(job.targetDate)
          
          return (
            <Card 
              key={job.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedJob(job)
                setIsDetailOpen(true)
              }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-semibold">{job.jobNumber}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace("_", " ")}
                      </Badge>
                      {job.priority === 1 && (
                        <Badge variant="destructive">
                          <Flag className="h-3 w-3 mr-1" />
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {job.customer} - {job.model}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm font-medium">Order: {job.orderNumber}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {job.registration !== "Pending" ? job.registration : "Registration pending"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Stage Progress - Mobile View */}
                <div className="flex sm:hidden items-center gap-1 mb-4 overflow-x-auto pb-2">
                  {PRODUCTION_STAGES.map((stage) => {
                    const stageData = job.stageProgress[stage.id] || { status: "pending", completion: 0, hours: 0 }
                    const isCompleted = stageData.status === "completed"
                    const isCurrent = job.currentStage === stage.id
                    const isPending = stageData.status === "pending"
                    
                    return (
                      <div
                        key={stage.id}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted ? "bg-blue-100 text-blue-700" :
                          isCurrent ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600" :
                          isPending ? "bg-gray-100 text-gray-400" :
                          "bg-orange-100 text-orange-600"
                        }`}
                      >
                        <span className="text-xs font-medium">{stage.id.substring(0, 1).toUpperCase()}</span>
                      </div>
                    )
                  })}
                </div>
                
                {/* Stage Progress - Desktop View */}
                <div className="hidden sm:flex items-center gap-2 mb-4">
                  {PRODUCTION_STAGES.map((stage, index) => {
                    const stageData = job.stageProgress[stage.id] || { status: "pending", completion: 0, hours: 0 }
                    const Icon = stage.icon
                    const isCompleted = stageData.status === "completed"
                    const isCurrent = job.currentStage === stage.id
                    const isPending = stageData.status === "pending"
                    
                    return (
                      <div key={stage.id} className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            isCompleted ? "bg-blue-100 text-blue-700" :
                            isCurrent ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600" :
                            isPending ? "bg-gray-100 text-gray-400" :
                            "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {index < PRODUCTION_STAGES.length - 1 && (
                          <ChevronRight className={`h-4 w-4 mx-1 ${
                            isCompleted ? "text-blue-700" : "text-gray-300"
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Footer Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">Start: {format(job.startDate, "dd MMM")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm">Target: {format(job.targetDate, "dd MMM")}</span>
                    </div>
                    <div className={`flex items-center gap-1 font-medium ${daysInfo.color}`}>
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{daysInfo.value} {daysInfo.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.assignedTeam.map((member, i) => (
                      <Avatar key={i} className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                {/* Issues Alert */}
                {job.issues.length > 0 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {job.issues[0].description}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No production jobs found</p>
                <p className="text-sm mt-2">Jobs will appear here when orders are confirmed</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-auto sm:max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.jobNumber} - {selectedJob.customer}</DialogTitle>
                <DialogDescription>
                  {selectedJob.model} | Order: {selectedJob.orderNumber}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="stages" className="mt-4">
                <TabsList>
                  <TabsTrigger value="stages">Stage Progress</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="quality">Quality Checks</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="stages" className="space-y-4">
                  <div className="grid gap-3">
                    {PRODUCTION_STAGES.map((stage) => {
                      const stageData = selectedJob.stageProgress[stage.id] || { status: "pending", completion: 0, hours: 0 }
                      const Icon = stage.icon
                      
                      return (
                        <Card key={stage.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  stageData?.status === "completed" ? "bg-blue-100" :
                                  stageData?.status === "in_progress" ? "bg-blue-100" :
                                  stageData?.status === "blocked" ? "bg-orange-100" :
                                  "bg-gray-100"
                                }`}>
                                  <Icon className={`h-5 w-5 ${getStageStatusColor(stageData?.status || "pending")}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{stage.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {stageData?.hours > 0 
                                      ? `${stageData.hours}h / ${stage.estimatedHours}h estimated`
                                      : `${stage.estimatedHours}h estimated`
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  stageData?.status === "completed" ? "default" :
                                  stageData?.status === "in_progress" ? "secondary" :
                                  stageData?.status === "blocked" ? "destructive" :
                                  "outline"
                                }>
                                  {stageData?.status || "pending"}
                                </Badge>
                                {stageData?.status === "in_progress" && (
                                  <span className="text-sm font-medium">
                                    {stageData?.completion || 0}%
                                  </span>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedStage(stage.id)
                                    setIsUpdateStageOpen(true)
                                  }}
                                >
                                  Update
                                </Button>
                              </div>
                            </div>
                            {stageData?.status === "in_progress" && (
                              <Progress value={stageData?.completion || 0} className="mt-2 h-1" />
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" className="sm:size-default">
                      <Camera className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Upload Photos</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedJob.photos.map((photo, i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRODUCTION_STAGES.find(s => s.id === photo.stage)?.name} - {format(photo.date, "dd MMM yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                  {selectedJob.photos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No photos uploaded yet
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quality" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <span>Chassis alignment</span>
                          <Badge variant="default">Passed</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span>Electrical systems</span>
                          <Badge variant="default">Passed</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span>Plumbing pressure test</span>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span>Paint finish</span>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Chassis Number</Label>
                      <p className="font-medium">{selectedJob.chassisNumber || "Pending"}</p>
                    </div>
                    <div>
                      <Label>Registration</Label>
                      <p className="font-medium">{selectedJob.registration || "Pending"}</p>
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <p className="font-medium">{format(selectedJob.startDate, "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <Label>Target Delivery</Label>
                      <p className="font-medium">{format(selectedJob.targetDate, "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <Label>Assigned Team</Label>
                      <p className="font-medium">{selectedJob.assignedTeam.join(", ")}</p>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Badge variant={selectedJob.priority === 1 ? "destructive" : "secondary"}>
                        Priority {selectedJob.priority}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Stage Dialog */}
      <Dialog open={isUpdateStageOpen} onOpenChange={setIsUpdateStageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stage Progress</DialogTitle>
            <DialogDescription>
              {selectedStage && PRODUCTION_STAGES.find(s => s.id === selectedStage)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="completion">Completion %</Label>
              <Input id="completion" type="number" min="0" max="100" />
            </div>
            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input id="hours" type="number" min="0" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} placeholder="Add any notes or issues..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateStageOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isUpdating} onClick={async () => {
                if (!selectedJob || !selectedStage) return
                
                const statusEl = document.querySelector('[id="status"] + button') as HTMLElement
                const completionEl = document.getElementById('completion') as HTMLInputElement
                const hoursEl = document.getElementById('hours') as HTMLInputElement
                const notesEl = document.getElementById('notes') as HTMLTextAreaElement
                
                const update = {
                  status: statusEl?.textContent?.replace('Select status', '') || 'pending',
                  completion: parseInt(completionEl?.value || '0'),
                  hours: parseInt(hoursEl?.value || '0')
                }
                
                await handleStageUpdate(selectedJob.id, selectedStage, update)
              }}>
                {isUpdating ? 'Updating...' : 'Update Stage'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}