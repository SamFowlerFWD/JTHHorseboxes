import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getInventoryList, invalidateInventoryCache, INVENTORY_COLUMNS } from '@/lib/supabase/optimized-queries'

// Mock inventory data for development
const MOCK_INVENTORY = [
  {
    id: '1',
    partNumber: 'CHK-001',
    name: 'Chassis Main Beam',
    category: 'chassis',
    description: '3.5t chassis main support beam',
    currentStock: 12,
    minStock: 5,
    maxStock: 50,
    reorderPoint: 10,
    unit: 'units',
    location: 'Warehouse A - Rack 1',
    supplier: 'Steel Supplies Ltd',
    lastRestocked: new Date('2024-12-01'),
    unitCost: 450.00,
    status: 'in_stock'
  },
  {
    id: '2',
    partNumber: 'ELC-045',
    name: 'LED Tail Light Assembly',
    category: 'electrical',
    description: 'Complete LED tail light unit with indicators',
    currentStock: 3,
    minStock: 10,
    maxStock: 40,
    reorderPoint: 15,
    unit: 'units',
    location: 'Warehouse B - Shelf 3',
    supplier: 'Auto Electrics UK',
    lastRestocked: new Date('2024-11-15'),
    unitCost: 125.50,
    status: 'low_stock'
  },
  {
    id: '3',
    partNumber: 'PLB-012',
    name: 'Water Tank 100L',
    category: 'plumbing',
    description: '100 litre fresh water tank with fittings',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 7,
    unit: 'units',
    location: 'Warehouse A - Bay 2',
    supplier: 'Plumbing Wholesale',
    lastRestocked: new Date('2024-12-10'),
    unitCost: 185.00,
    status: 'in_stock'
  },
  {
    id: '4',
    partNumber: 'INT-089',
    name: 'Tack Locker Door',
    category: 'interior',
    description: 'Aluminum tack locker door with lock',
    currentStock: 0,
    minStock: 5,
    maxStock: 25,
    reorderPoint: 8,
    unit: 'units',
    location: 'Warehouse C - Section 2',
    supplier: 'Horsebox Fittings Ltd',
    lastRestocked: new Date('2024-10-20'),
    unitCost: 275.00,
    status: 'out_of_stock'
  },
  {
    id: '5',
    partNumber: 'HRD-234',
    name: 'M12 Bolt Set',
    category: 'hardware',
    description: 'M12 stainless steel bolt set (pack of 50)',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 30,
    unit: 'packs',
    location: 'Warehouse A - Drawer 5',
    supplier: 'Industrial Fasteners',
    lastRestocked: new Date('2024-12-05'),
    unitCost: 22.50,
    status: 'in_stock'
  },
  {
    id: '6',
    partNumber: 'EXT-067',
    name: 'Side Window Kit',
    category: 'exterior',
    description: 'Double glazed side window with frame',
    currentStock: 6,
    minStock: 8,
    maxStock: 30,
    reorderPoint: 12,
    unit: 'units',
    location: 'Warehouse B - Rack 4',
    supplier: 'Glass Solutions',
    lastRestocked: new Date('2024-11-28'),
    unitCost: 320.00,
    status: 'low_stock'
  },
  {
    id: '7',
    partNumber: 'CHK-015',
    name: 'Axle Assembly 3.5t',
    category: 'chassis',
    description: 'Complete axle assembly for 3.5t model',
    currentStock: 4,
    minStock: 2,
    maxStock: 10,
    reorderPoint: 3,
    unit: 'units',
    location: 'Warehouse A - Heavy Storage',
    supplier: 'Chassis Components Ltd',
    lastRestocked: new Date('2024-11-10'),
    unitCost: 1250.00,
    status: 'in_stock'
  },
  {
    id: '8',
    partNumber: 'INT-102',
    name: 'Rubber Matting',
    category: 'interior',
    description: 'Heavy duty rubber floor matting (per m²)',
    currentStock: 85,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    unit: 'm²',
    location: 'Warehouse C - Roll Storage',
    supplier: 'Rubber Products UK',
    lastRestocked: new Date('2024-12-08'),
    unitCost: 45.00,
    status: 'in_stock'
  },
  {
    id: '9',
    partNumber: 'ELC-078',
    name: 'Control Panel Switch',
    category: 'electrical',
    description: 'Illuminated rocker switch for control panel',
    currentStock: 12,
    minStock: 20,
    maxStock: 60,
    reorderPoint: 25,
    unit: 'units',
    location: 'Warehouse B - Bin 12',
    supplier: 'Electronic Components',
    lastRestocked: new Date('2024-11-22'),
    unitCost: 8.50,
    status: 'reorder'
  },
  {
    id: '10',
    partNumber: 'PLB-025',
    name: 'Waste Water Valve',
    category: 'plumbing',
    description: 'Waste water outlet valve with seal',
    currentStock: 18,
    minStock: 10,
    maxStock: 40,
    reorderPoint: 15,
    unit: 'units',
    location: 'Warehouse A - Shelf 8',
    supplier: 'Plumbing Wholesale',
    lastRestocked: new Date('2024-12-03'),
    unitCost: 32.00,
    status: 'in_stock'
  }
]

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const usePagination = searchParams.get('paginate') !== 'false'

    if (!usePagination) {
      // Legacy unpaginated request (for dropdowns, etc.)
      const inventoryData = await getInventoryList()

      if (!inventoryData || inventoryData.length === 0) {
        return NextResponse.json({
          success: true,
          data: MOCK_INVENTORY,
          mock: true
        })
      }

      const mappedData = inventoryData.map(item => ({
        id: item.id,
        partNumber: item.sku,
        name: item.name,
        category: item.category,
        description: item.name,
        currentStock: Number(item.quantity || 0),
        minStock: 5,
        maxStock: 100,
        reorderPoint: 10,
        unit: 'units',
        location: item.location,
        supplier: 'Unknown',
        lastRestocked: item.updated_at ? new Date(item.updated_at) : new Date(),
        unitCost: Number(item.unit_price || 0),
        status: item.status || 'unknown'
      }))

      return NextResponse.json({
        success: true,
        data: mappedData
      })
    }

    // Use optimized paginated inventory query with caching
    const { getInventoryPaginated } = await import('@/lib/supabase/optimized-queries')
    const result = await getInventoryPaginated(page, limit, { category, status })

    // If no data, return mock data
    if (!result.items || result.items.length === 0) {
      return NextResponse.json({
        success: true,
        data: MOCK_INVENTORY.slice(0, limit),
        pagination: {
          page,
          limit,
          total: MOCK_INVENTORY.length,
          totalPages: Math.ceil(MOCK_INVENTORY.length / limit)
        },
        mock: true
      })
    }

    // Map database fields to frontend expected format
    const mappedData = result.items.map(item => ({
      id: item.id,
      partNumber: item.sku,
      name: item.name,
      category: item.category,
      description: item.name,
      currentStock: Number(item.quantity || 0),
      minStock: 5,
      maxStock: 100,
      reorderPoint: 10,
      unit: 'units',
      location: item.location,
      supplier: 'Unknown',
      lastRestocked: item.updated_at ? new Date(item.updated_at) : new Date(),
      unitCost: Number(item.unit_price || 0),
      status: item.status || 'unknown'
    }))

    return NextResponse.json({
      success: true,
      data: mappedData,
      pagination: result.pagination
    })
  } catch (error: any) {
    console.error('Inventory API error:', error)
    // Return mock data on error
    return NextResponse.json({
      success: true,
      data: MOCK_INVENTORY,
      mock: true,
      error: error.message
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    const supabase = await createServiceClient()

    switch (action) {
      case 'create':
        // Map frontend fields to database fields
        const createData = {
          sku: data.partNumber,
          name: data.name,
          category: data.category,
          quantity: data.currentStock || 0,
          unit_price: data.unitCost || 0,
          location: data.location,
          status: 'active'
        }

        const { data: newItem, error: createError } = await supabase
          .from('inventory')
          .insert(createData)
          .select()
          .single()

        if (createError) throw createError

        // Map back to frontend format
        const mappedNewItem = {
          id: newItem.id,
          partNumber: newItem.sku,
          name: newItem.name,
          category: newItem.category,
          description: newItem.name,
          currentStock: Number(newItem.quantity),
          minStock: 5,
          maxStock: 100,
          reorderPoint: 10,
          unit: 'units',
          location: newItem.location,
          supplier: 'Unknown',
          lastRestocked: new Date(newItem.created_at),
          unitCost: Number(newItem.unit_price),
          status: newItem.status
        }

        // Invalidate inventory cache after mutation
        invalidateInventoryCache()

        return NextResponse.json({
          success: true,
          data: mappedNewItem
        })

      case 'update':
        const { id, ...frontendData } = data

        // Map frontend fields to database fields
        const updateData: any = {}
        if (frontendData.partNumber !== undefined) updateData.sku = frontendData.partNumber
        if (frontendData.name !== undefined) updateData.name = frontendData.name
        if (frontendData.category !== undefined) updateData.category = frontendData.category
        if (frontendData.currentStock !== undefined) updateData.quantity = frontendData.currentStock
        if (frontendData.location !== undefined) updateData.location = frontendData.location
        if (frontendData.unitCost !== undefined) updateData.unit_price = frontendData.unitCost

        const { data: updatedItem, error: updateError } = await supabase
          .from('inventory')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        // Map back to frontend format
        const mappedUpdatedItem = {
          id: updatedItem.id,
          partNumber: updatedItem.sku,
          name: updatedItem.name,
          category: updatedItem.category,
          description: updatedItem.name,
          currentStock: Number(updatedItem.quantity),
          minStock: 5,
          maxStock: 100,
          reorderPoint: 10,
          unit: 'units',
          location: updatedItem.location,
          supplier: 'Unknown',
          lastRestocked: new Date(updatedItem.updated_at),
          unitCost: Number(updatedItem.unit_price),
          status: updatedItem.status
        }

        // Invalidate inventory cache after mutation
        invalidateInventoryCache()

        return NextResponse.json({
          success: true,
          data: mappedUpdatedItem
        })

      case 'adjustStock':
        const { itemId, adjustment, reason } = data

        // Get current user ID (in production, get from session)
        const { data: { user } } = await supabase.auth.getUser()

        // Call the database function to adjust stock
        const { error: adjustError } = await supabase.rpc('adjust_inventory_stock', {
          p_inventory_id: itemId,
          p_adjustment: adjustment,
          p_reason: reason || 'Manual adjustment',
          p_user_id: user?.id || null
        })

        if (adjustError) throw adjustError

        // Invalidate inventory cache after mutation
        invalidateInventoryCache()

        return NextResponse.json({
          success: true,
          message: 'Stock adjusted successfully'
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}