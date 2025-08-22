"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Package,
  FileText,
  Clock,
  AlertCircle,
  Star,
  MoreHorizontal,
  Filter,
  Download
} from "lucide-react"
import { format } from "date-fns"

interface Customer {
  id: string
  firstName: string
  lastName: string
  company?: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    county: string
    postcode: string
    country: string
  }
  status: string
  type: string
  createdAt: Date
  lastContact: Date
  totalOrders: number
  totalValue: number
  notes?: string
  tags: string[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/customers')
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      
      const result = await response.json()
      
      if (result.success) {
        const parsedCustomers = result.data.map((customer: any) => ({
          ...customer,
          createdAt: new Date(customer.createdAt),
          lastContact: new Date(customer.lastContact)
        }))
        setCustomers(parsedCustomers)
      } else {
        throw new Error(result.error || 'Failed to fetch customers')
      }
    } catch (err: any) {
      console.error('Customers error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const metrics = {
    totalCustomers: customers.length,
    newThisMonth: customers.filter(c => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return c.createdAt >= monthAgo
    }).length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalValue, 0)
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === "all" || customer.type === filterType
    
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'lead': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer relationships and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customer data...</p>
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
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Customers</CardDescription>
                <CardTitle className="text-2xl">{metrics.totalCustomers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New This Month</CardDescription>
                <CardTitle className="text-2xl">{metrics.newThisMonth}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Customers</CardDescription>
                <CardTitle className="text-2xl">{metrics.activeCustomers}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl">£{metrics.totalRevenue.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Customer List */}
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCustomer(customer)
                  setIsDetailOpen(true)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {getInitials(customer.firstName, customer.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <Badge variant={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                        {customer.company && (
                          <p className="text-sm text-muted-foreground">{customer.company}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address.city}, {customer.address.postcode}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{customer.totalOrders} orders</p>
                      <p className="text-lg font-semibold">£{customer.totalValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last contact: {format(customer.lastContact, "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCustomers.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customers found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </DialogTitle>
                <DialogDescription>
                  Customer since {format(selectedCustomer.createdAt, "MMMM yyyy")}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <Label>Company</Label>
                      <p className="font-medium">{selectedCustomer.company || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Badge>{selectedCustomer.type}</Badge>
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <p className="font-medium">
                        {selectedCustomer.address.street}<br />
                        {selectedCustomer.address.city}, {selectedCustomer.address.county}<br />
                        {selectedCustomer.address.postcode}<br />
                        {selectedCustomer.address.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline">Edit Details</Button>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Order history will appear here
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Communication history will appear here
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Customer notes will appear here
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter customer details to create a new record
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Smith" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+44 7700 900000" />
            </div>
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input id="company" placeholder="Smith Stables" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)}>
                Cancel
              </Button>
              <Button>Add Customer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}