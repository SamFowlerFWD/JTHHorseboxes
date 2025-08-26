"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Package,
  Truck,
  Image,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Shield,
  Wrench,
  Zap,
  Paintbrush,
  Phone,
  Mail
} from "lucide-react"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"

// Customer-friendly stage names and descriptions
const CUSTOMER_STAGES = [
  { 
    id: "order_confirmed", 
    name: "Order Confirmed", 
    icon: CheckCircle2,
    description: "Your order has been confirmed and scheduled for production"
  },
  { 
    id: "chassis_preparation", 
    name: "Chassis Preparation", 
    icon: Wrench,
    description: "Preparing the base chassis and framework for your horsebox"
  },
  { 
    id: "frame_construction", 
    name: "Frame Construction", 
    icon: Package,
    description: "Building the main structure, walls, and flooring"
  },
  { 
    id: "systems_installation", 
    name: "Systems Installation", 
    icon: Zap,
    description: "Installing electrical and plumbing systems"
  },
  { 
    id: "interior_work", 
    name: "Interior Fit-Out", 
    icon: Shield,
    description: "Crafting and fitting the interior components and fixtures"
  },
  { 
    id: "finishing_touches", 
    name: "Finishing Touches", 
    icon: Paintbrush,
    description: "Painting, detailing, and final aesthetic work"
  },
  { 
    id: "quality_control", 
    name: "Quality Control", 
    icon: Shield,
    description: "Comprehensive testing and quality checks"
  },
  { 
    id: "ready_for_collection", 
    name: "Ready for Collection", 
    icon: Truck,
    description: "Your horsebox is complete and ready for delivery or collection"
  }
]

interface BuildData {
  id: string
  buildNumber: string
  model: string
  status: string
  currentStage: number
  estimatedCompletion: Date
  configuration: any
  updates: Array<{
    id: string
    stageName: string
    message: string
    photos: string[]
    publishedAt: Date
    isMilestone: boolean
  }>
  photos: Array<{
    url: string
    caption: string
    stage: string
    date: Date
  }>
  documents: Array<{
    name: string
    type: string
    url: string
  }>
}

export default function CustomerTrackerPage() {
  const params = useParams()
  const buildId = params.buildId as string
  const [buildData, setBuildData] = useState<BuildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("progress")

  useEffect(() => {
    fetchBuildData()
    
    // Set up real-time subscription for updates
    const supabase = createClient()
    const channel = supabase
      .channel(`build-${buildId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customer_updates',
        filter: `build_id=eq.${buildId}`
      }, () => {
        fetchBuildData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [buildId])

  const fetchBuildData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch build information
      const { data: build, error: buildError } = await supabase
        .from('builds')
        .select(`
          *,
          build_stages (
            *,
            build_media (*)
          ),
          customer_updates (*)
        `)
        .eq('id', buildId)
        .single()

      if (buildError) throw buildError

      // Map internal stages to customer-friendly stages
      const currentStageIndex = mapInternalToCustomerStage(build)
      
      // Calculate estimated completion
      const estimatedCompletion = new Date(build.scheduled_end || Date.now() + 30 * 24 * 60 * 60 * 1000)
      
      // Format updates
      const updates = build.customer_updates?.map((update: any) => ({
        id: update.id,
        stageName: update.stage_name,
        message: update.message,
        photos: update.photos_json || [],
        publishedAt: new Date(update.published_at),
        isMilestone: update.is_milestone
      })) || []
      
      // Collect visible photos
      const photos = build.build_stages?.flatMap((stage: any) => 
        stage.build_media?.filter((media: any) => media.is_customer_visible)
          .map((media: any) => ({
            url: media.file_url,
            caption: media.caption,
            stage: stage.customer_stage_name || stage.name,
            date: new Date(media.uploaded_at)
          }))
      ) || []
      
      // Mock documents for now
      const documents = [
        { name: "Build Specification", type: "PDF", url: "#" },
        { name: "Warranty Information", type: "PDF", url: "#" },
        { name: "Care & Maintenance Guide", type: "PDF", url: "#" }
      ]
      
      setBuildData({
        id: build.id,
        buildNumber: build.build_number,
        model: build.model,
        status: build.status,
        currentStage: currentStageIndex,
        estimatedCompletion,
        configuration: build.configuration,
        updates: updates.sort((a: any, b: any) => b.publishedAt - a.publishedAt),
        photos,
        documents
      })
    } catch (err: any) {
      console.error('Error fetching build data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const mapInternalToCustomerStage = (build: any): number => {
    // Map internal build stages to customer-friendly stages
    const stageMapping: Record<string, number> = {
      'pending': 0,
      'chassis_prep': 1,
      'floor_walls': 2,
      'electrical': 3,
      'plumbing': 3,
      'interior': 4,
      'painting': 5,
      'testing': 6,
      'final': 7,
      'completed': 7,
      'delivered': 7
    }
    
    // Find the highest completed stage
    const completedStages = build.build_stages?.filter((s: any) => s.status === 'completed') || []
    const highestStage = Math.max(0, ...completedStages.map((s: any) => stageMapping[s.name] || 0))
    
    return Math.min(highestStage, CUSTOMER_STAGES.length - 1)
  }

  const calculateProgress = () => {
    if (!buildData) return 0
    return ((buildData.currentStage + 1) / CUSTOMER_STAGES.length) * 100
  }

  const getDaysRemaining = () => {
    if (!buildData) return null
    const days = differenceInDays(buildData.estimatedCompletion, new Date())
    if (days < 0) return { value: 0, label: "Complete", color: "text-blue-700" }
    if (days === 0) return { value: 0, label: "Today!", color: "text-blue-700" }
    if (days === 1) return { value: 1, label: "Tomorrow", color: "text-orange-600" }
    if (days <= 7) return { value: days, label: `${days} days`, color: "text-orange-600" }
    if (days <= 30) return { value: Math.floor(days / 7), label: `${Math.floor(days / 7)} weeks`, color: "text-blue-600" }
    return { value: Math.floor(days / 30), label: `${Math.floor(days / 30)} months`, color: "text-gray-600" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your build information...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !buildData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
          <Card className="bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p>Unable to load build information. Please check your build ID or contact support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const daysInfo = getDaysRemaining()
  const currentStage = CUSTOMER_STAGES[buildData.currentStage]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Build Progress</h1>
          <p className="text-muted-foreground">
            Track the progress of your {buildData.model} build
          </p>
        </div>

        {/* Build Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Build Number</p>
                <p className="text-xl font-bold">{buildData.buildNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="text-xl font-bold">{buildData.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Completion</p>
                <p className="text-xl font-bold">
                  {format(buildData.estimatedCompletion, "dd MMM yyyy")}
                </p>
                {daysInfo && (
                  <p className={`text-sm ${daysInfo.color}`}>
                    {daysInfo.value > 0 ? `${daysInfo.value} ${daysInfo.label} remaining` : daysInfo.label}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Currently in: {currentStage.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Stage Timeline */}
            <div className="space-y-4">
              {CUSTOMER_STAGES.map((stage, index) => {
                const Icon = stage.icon
                const isCompleted = index < buildData.currentStage
                const isCurrent = index === buildData.currentStage
                const isPending = index > buildData.currentStage
                
                return (
                  <div key={stage.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        isCompleted ? "bg-blue-100 text-blue-700" :
                        isCurrent ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600 ring-offset-2" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      {index < CUSTOMER_STAGES.length - 1 && (
                        <div className={`w-0.5 h-12 ${
                          isCompleted ? "bg-blue-700" : "bg-gray-300"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${
                          isCurrent ? "text-primary" : ""
                        }`}>
                          {stage.name}
                        </h3>
                        {isCurrent && (
                          <Badge variant="default" className="animate-pulse">
                            In Progress
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="secondary">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Updates, Photos, Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Build Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="mt-6">
                <div className="space-y-4">
                  {buildData.updates.length > 0 ? (
                    buildData.updates.map((update) => (
                      <Card key={update.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{update.stageName}</h4>
                                {update.isMilestone && (
                                  <Badge variant="default">Milestone</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {update.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(update.publishedAt, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No updates yet</p>
                      <p className="text-sm mt-2">We'll post updates as your build progresses</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buildData.photos.length > 0 ? (
                    buildData.photos.map((photo, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.stage} - {format(photo.date, "dd MMM yyyy")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No photos available yet</p>
                      <p className="text-sm mt-2">Photos will appear here as your build progresses</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <div className="space-y-2">
                  {buildData.documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.type}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Call Workshop
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}