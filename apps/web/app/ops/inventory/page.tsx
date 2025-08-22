"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  BarChart3,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Package2,
  Truck
} from "lucide-react"
import { format } from "date-fns"

interface InventoryItem {
  id: string
  partNumber: string
  name: string
  category: string
  description: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  unit: string
  location: string
  supplier: string
  lastRestocked: Date
  unitCost: number
  status: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ops/inventory')
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }
      
      const result = await response.json()
      
      if (result.success) {
        const parsedItems = result.data.map((item: any) => ({
          ...item,
          lastRestocked: new Date(item.lastRestocked)
        }))
        setItems(parsedItems)
      } else {
        throw new Error(result.error || 'Failed to fetch inventory')
      }
    } catch (err: any) {
      console.error('Inventory error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const metrics = {
    totalItems: items.length,
    lowStock: items.filter(i => i.currentStock <= i.minStock).length,
    outOfStock: items.filter(i => i.currentStock === 0).length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
    reorderNeeded: items.filter(i => i.currentStock <= i.reorderPoint).length,
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get status color
  const getStatusColor = (item: InventoryItem) => {
    if (item.currentStock === 0) return "destructive"
    if (item.currentStock <= item.minStock) return "destructive"
    if (item.currentStock <= item.reorderPoint) return "secondary"
    if (item.currentStock >= item.maxStock) return "default"
    return "outline"
  }

  const getStatusText = (item: InventoryItem) => {
    if (item.currentStock === 0) return "Out of Stock"
    if (item.currentStock <= item.minStock) return "Critical"
    if (item.currentStock <= item.reorderPoint) return "Reorder"
    if (item.currentStock >= item.maxStock) return "Overstocked"
    return "In Stock"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels and manage supplies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory data...</p>
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

      {/* Metrics Cards */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Items</CardDescription>
                <CardTitle className="text-2xl">{metrics.totalItems}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Low Stock</CardDescription>
                <CardTitle className="text-2xl text-orange-600">{metrics.lowStock}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Out of Stock</CardDescription>
                <CardTitle className="text-2xl text-red-600">{metrics.outOfStock}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reorder Needed</CardDescription>
                <CardTitle className="text-2xl text-yellow-600">{metrics.reorderNeeded}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-2xl">£{metrics.totalValue.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or part number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="chassis">Chassis Parts</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
                <SelectItem value="exterior">Exterior</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4">Part Number</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-center p-4">Current Stock</th>
                      <th className="text-center p-4">Min/Max</th>
                      <th className="text-center p-4">Unit Cost</th>
                      <th className="text-center p-4">Total Value</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/30 cursor-pointer"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDetailOpen(true)
                          }}>
                        <td className="p-4 font-mono text-sm">{item.partNumber}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{item.category}</Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-medium">{item.currentStock}</span>
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center text-sm">
                          {item.minStock} / {item.maxStock}
                        </td>
                        <td className="p-4 text-center">£{item.unitCost.toFixed(2)}</td>
                        <td className="p-4 text-center font-medium">
                          £{(item.currentStock * item.unitCost).toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={getStatusColor(item)}>
                            {getStatusText(item)}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No inventory items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Part Number: {selectedItem.partNumber}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current Stock</Label>
                      <p className="font-medium">{selectedItem.currentStock} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="font-medium">{selectedItem.location}</p>
                    </div>
                    <div>
                      <Label>Reorder Point</Label>
                      <p className="font-medium">{selectedItem.reorderPoint} {selectedItem.unit}</p>
                    </div>
                    <div>
                      <Label>Last Restocked</Label>
                      <p className="font-medium">{format(selectedItem.lastRestocked, "dd MMM yyyy")}</p>
                    </div>
                    <div>
                      <Label>Unit Cost</Label>
                      <p className="font-medium">£{selectedItem.unitCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Total Value</Label>
                      <p className="font-medium">£{(selectedItem.currentStock * selectedItem.unitCost).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button>Adjust Stock</Button>
                    <Button variant="outline">Create Purchase Order</Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Stock movement history will appear here
                  </div>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Supplier information will appear here
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input id="partNumber" placeholder="e.g., CHK-001" />
            </div>
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g., Chassis Bracket" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chassis">Chassis Parts</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock">Min Stock</Label>
                <Input id="minStock" type="number" placeholder="10" />
              </div>
              <div>
                <Label htmlFor="maxStock">Max Stock</Label>
                <Input id="maxStock" type="number" placeholder="100" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                Cancel
              </Button>
              <Button>Add Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}