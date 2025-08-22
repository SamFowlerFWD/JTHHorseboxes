"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText,
  Search,
  Plus,
  Download,
  Send,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Copy,
  Mail,
  Truck,
  User,
  Filter
} from "lucide-react"
import { format } from "date-fns"

interface Quote {
  id: string
  quoteNumber: string
  customer: {
    name: string
    email: string
    phone: string
    company?: string
  }
  model: string
  configuration: any
  basePrice: number
  options: Array<{ name: string; price: number }>
  totalPrice: number
  vatAmount: number
  grandTotal: number
  status: string
  validUntil: Date
  createdAt: Date
  sentAt?: Date
  viewedAt?: Date
  notes?: string
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/quotes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes')
      }
      
      const result = await response.json()
      
      if (result.success) {
        const parsedQuotes = result.data.map((quote: any) => ({
          ...quote,
          createdAt: new Date(quote.createdAt),
          validUntil: new Date(quote.validUntil),
          sentAt: quote.sentAt ? new Date(quote.sentAt) : undefined,
          viewedAt: quote.viewedAt ? new Date(quote.viewedAt) : undefined
        }))
        setQuotes(parsedQuotes)
      } else {
        throw new Error(result.error || 'Failed to fetch quotes')
      }
    } catch (err: any) {
      console.error('Quotes error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const metrics = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'draft').length,
    sentQuotes: quotes.filter(q => q.status === 'sent').length,
    convertedQuotes: quotes.filter(q => q.status === 'accepted').length,
    totalValue: quotes.reduce((sum, q) => sum + q.grandTotal, 0),
    conversionRate: quotes.length > 0 
      ? (quotes.filter(q => q.status === 'accepted').length / quotes.length * 100)
      : 0
  }

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || quote.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline'
      case 'sent': return 'secondary'
      case 'viewed': return 'default'
      case 'accepted': return 'default'
      case 'rejected': return 'destructive'
      case 'expired': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'expired': return <Clock className="h-4 w-4" />
      case 'viewed': return <Eye className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quote Management</h1>
          <p className="text-muted-foreground">Create and track customer quotes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Quotes</CardDescription>
                <CardTitle className="text-2xl">{metrics.totalQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl">{metrics.pendingQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sent</CardDescription>
                <CardTitle className="text-2xl">{metrics.sentQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Converted</CardDescription>
                <CardTitle className="text-2xl">{metrics.convertedQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Conversion Rate</CardDescription>
                <CardTitle className="text-2xl">{metrics.conversionRate.toFixed(0)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-2xl">£{(metrics.totalValue / 1000).toFixed(0)}k</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quotes</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Quotes List */}
          <div className="grid gap-4">
            {filteredQuotes.map((quote) => (
              <Card 
                key={quote.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedQuote(quote)
                  setIsDetailOpen(true)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{quote.quoteNumber}</h3>
                        <Badge variant={getStatusColor(quote.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(quote.status)}
                            {quote.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{quote.customer.name}</p>
                      {quote.customer.company && (
                        <p className="text-sm text-muted-foreground">{quote.customer.company}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {quote.model}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {format(quote.createdAt, "dd MMM yyyy")}
                        </div>
                        {quote.sentAt && (
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent {format(quote.sentAt, "dd MMM")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">£{quote.grandTotal.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">inc. VAT</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Valid until {format(quote.validUntil, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredQuotes.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quotes found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Quote Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedQuote.quoteNumber}</DialogTitle>
                <DialogDescription>
                  Quote for {selectedQuote.customer.name}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="items">Items & Options</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Customer</Label>
                      <p className="font-medium">{selectedQuote.customer.name}</p>
                      {selectedQuote.customer.company && (
                        <p className="text-sm text-muted-foreground">{selectedQuote.customer.company}</p>
                      )}
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <p className="font-medium">{selectedQuote.customer.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedQuote.customer.phone}</p>
                    </div>
                    <div>
                      <Label>Model</Label>
                      <p className="font-medium">{selectedQuote.model}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge variant={getStatusColor(selectedQuote.status)}>
                        {selectedQuote.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <p className="font-medium">{format(selectedQuote.createdAt, "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <Label>Valid Until</Label>
                      <p className="font-medium">{format(selectedQuote.validUntil, "dd MMM yyyy")}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Base Price</span>
                      <span className="font-medium">£{selectedQuote.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Options</span>
                      <span className="font-medium">
                        £{selectedQuote.options.reduce((sum, opt) => sum + opt.price, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>VAT (20%)</span>
                      <span>£{selectedQuote.vatAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>£{selectedQuote.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Quote
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button variant="outline">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Options</h4>
                    {selectedQuote.options.map((option, i) => (
                      <div key={i} className="flex justify-between py-2 border-b">
                        <span>{option.name}</span>
                        <span className="font-medium">£{option.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Quote activity timeline will appear here
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}