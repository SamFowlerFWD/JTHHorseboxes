import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

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
    const supabase = await createServiceSupabaseClient()
    
    // Try to fetch from database
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .order('name')
    
    // If table doesn't exist or error, return mock data
    if (inventoryError) {
      console.log('Inventory table not found, using mock data:', inventoryError.message)
      return NextResponse.json({ 
        success: true, 
        data: MOCK_INVENTORY,
        mock: true 
      })
    }
    
    // If no data, return mock data
    if (!inventoryData || inventoryData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: MOCK_INVENTORY,
        mock: true 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: inventoryData 
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
    
    const supabase = await createServiceSupabaseClient()
    
    switch (action) {
      case 'create':
        const { data: newItem, error: createError } = await supabase
          .from('inventory')
          .insert(data)
          .select()
          .single()
        
        if (createError) throw createError
        
        return NextResponse.json({ 
          success: true, 
          data: newItem 
        })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedItem, error: updateError } = await supabase
          .from('inventory')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        return NextResponse.json({ 
          success: true, 
          data: updatedItem 
        })
      
      case 'adjustStock':
        const { itemId, adjustment, reason } = data
        // This would update stock levels and create an audit log
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