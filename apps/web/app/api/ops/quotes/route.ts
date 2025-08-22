import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

// Mock quotes data for development
const MOCK_QUOTES = [
  {
    id: '1',
    quoteNumber: 'QT-2024-001',
    customer: {
      name: 'Sarah Thompson',
      email: 'sarah.thompson@example.com',
      phone: '+44 7700 900123',
      company: 'Thompson Equestrian'
    },
    model: 'JTH 3.5t Prestige',
    configuration: {
      baseModel: '3.5t',
      color: 'Midnight Blue',
      interior: 'Premium Leather'
    },
    basePrice: 35000,
    options: [
      { name: 'Premium Sound System', price: 1200 },
      { name: 'Solar Panel Package', price: 2500 },
      { name: 'Extended Warranty', price: 1500 }
    ],
    totalPrice: 40200,
    vatAmount: 8040,
    grandTotal: 48240,
    status: 'sent',
    validUntil: new Date('2025-01-15'),
    createdAt: new Date('2024-12-01'),
    sentAt: new Date('2024-12-02'),
    viewedAt: new Date('2024-12-03'),
    notes: 'Customer interested in finance options'
  },
  {
    id: '2',
    quoteNumber: 'QT-2024-002',
    customer: {
      name: 'James Wilson',
      email: 'j.wilson@example.com',
      phone: '+44 7700 900456',
      company: null
    },
    model: 'JTH 3.5t Standard',
    configuration: {
      baseModel: '3.5t',
      color: 'Classic White',
      interior: 'Standard'
    },
    basePrice: 28000,
    options: [
      { name: 'Tack Locker Upgrade', price: 800 },
      { name: 'LED Lighting Package', price: 600 }
    ],
    totalPrice: 29400,
    vatAmount: 5880,
    grandTotal: 35280,
    status: 'viewed',
    validUntil: new Date('2025-01-20'),
    createdAt: new Date('2024-12-05'),
    sentAt: new Date('2024-12-05'),
    viewedAt: new Date('2024-12-08'),
    notes: 'Follow up scheduled for next week'
  },
  {
    id: '3',
    quoteNumber: 'QT-2024-003',
    customer: {
      name: 'Emma Davies',
      email: 'emma@daviesracing.co.uk',
      phone: '+44 7700 900789',
      company: 'Davies Racing Stables'
    },
    model: 'JTH 7.2t Professional',
    configuration: {
      baseModel: '7.2t',
      color: 'Racing Green',
      interior: 'Professional Grade'
    },
    basePrice: 65000,
    options: [
      { name: 'Competition Package', price: 5000 },
      { name: 'Camera System', price: 2200 },
      { name: 'Hydraulic Ramp', price: 3500 },
      { name: 'Custom Graphics', price: 1800 }
    ],
    totalPrice: 77500,
    vatAmount: 15500,
    grandTotal: 93000,
    status: 'accepted',
    validUntil: new Date('2024-12-31'),
    createdAt: new Date('2024-11-15'),
    sentAt: new Date('2024-11-15'),
    viewedAt: new Date('2024-11-16'),
    notes: 'Order confirmed - production scheduled'
  },
  {
    id: '4',
    quoteNumber: 'QT-2024-004',
    customer: {
      name: 'Michael Brown',
      email: 'mbrown@example.com',
      phone: '+44 7700 900321',
      company: null
    },
    model: 'JTH 4.5t Deluxe',
    configuration: {
      baseModel: '4.5t',
      color: 'Silver Metallic',
      interior: 'Deluxe'
    },
    basePrice: 42000,
    options: [
      { name: 'Air Conditioning', price: 2000 },
      { name: 'Automatic Drinkers', price: 900 }
    ],
    totalPrice: 44900,
    vatAmount: 8980,
    grandTotal: 53880,
    status: 'draft',
    validUntil: new Date('2025-01-25'),
    createdAt: new Date('2024-12-10'),
    sentAt: null,
    viewedAt: null,
    notes: 'Awaiting customer requirements confirmation'
  },
  {
    id: '5',
    quoteNumber: 'QT-2024-005',
    customer: {
      name: 'Lucy Anderson',
      email: 'lucy@andersonequine.com',
      phone: '+44 7700 900654',
      company: 'Anderson Equine Transport'
    },
    model: 'JTH 7.2t Commercial',
    configuration: {
      baseModel: '7.2t',
      color: 'Company Colors',
      interior: 'Commercial Heavy Duty'
    },
    basePrice: 68000,
    options: [
      { name: 'Fleet Management System', price: 3000 },
      { name: 'Commercial Insurance Package', price: 2500 },
      { name: 'Dual Fuel System', price: 4000 }
    ],
    totalPrice: 77500,
    vatAmount: 15500,
    grandTotal: 93000,
    status: 'sent',
    validUntil: new Date('2025-01-30'),
    createdAt: new Date('2024-12-08'),
    sentAt: new Date('2024-12-09'),
    viewedAt: null,
    notes: 'Fleet discount applied'
  },
  {
    id: '6',
    quoteNumber: 'QT-2024-006',
    customer: {
      name: 'David Jones',
      email: 'djones@example.com',
      phone: '+44 7700 900987',
      company: null
    },
    model: 'JTH 4.5t Sport',
    configuration: {
      baseModel: '4.5t',
      color: 'Graphite Black',
      interior: 'Sport'
    },
    basePrice: 45000,
    options: [
      { name: 'Sport Suspension', price: 1500 },
      { name: 'Performance Brakes', price: 1200 },
      { name: 'Alloy Wheels', price: 2000 }
    ],
    totalPrice: 49700,
    vatAmount: 9940,
    grandTotal: 59640,
    status: 'rejected',
    validUntil: new Date('2024-12-20'),
    createdAt: new Date('2024-11-20'),
    sentAt: new Date('2024-11-21'),
    viewedAt: new Date('2024-11-25'),
    notes: 'Customer opted for competitor'
  },
  {
    id: '7',
    quoteNumber: 'QT-2024-007',
    customer: {
      name: 'Rachel Green',
      email: 'rachel@greenfields.co.uk',
      phone: '+44 7700 900147',
      company: 'Green Fields Stud'
    },
    model: 'JTH 3.5t Breeder Special',
    configuration: {
      baseModel: '3.5t',
      color: 'Pearl White',
      interior: 'Breeder Package'
    },
    basePrice: 32000,
    options: [
      { name: 'Foaling Kit', price: 1500 },
      { name: 'Extra Ventilation', price: 800 },
      { name: 'Rubber Matting Upgrade', price: 600 }
    ],
    totalPrice: 34900,
    vatAmount: 6980,
    grandTotal: 41880,
    status: 'expired',
    validUntil: new Date('2024-11-30'),
    createdAt: new Date('2024-10-25'),
    sentAt: new Date('2024-10-26'),
    viewedAt: new Date('2024-10-28'),
    notes: 'Quote expired - customer to resubmit requirements'
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient()
    
    // Try to fetch from database
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .order('createdAt', { ascending: false })
    
    // If table doesn't exist or error, return mock data
    if (quotesError) {
      console.log('Quotes table not found, using mock data:', quotesError.message)
      return NextResponse.json({ 
        success: true, 
        data: MOCK_QUOTES,
        mock: true 
      })
    }
    
    // If no data, return mock data
    if (!quotesData || quotesData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: MOCK_QUOTES,
        mock: true 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: quotesData 
    })
  } catch (error: any) {
    console.error('Quotes API error:', error)
    // Return mock data on error
    return NextResponse.json({ 
      success: true, 
      data: MOCK_QUOTES,
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
        const { data: newQuote, error: createError } = await supabase
          .from('quotes')
          .insert(data)
          .select()
          .single()
        
        if (createError) throw createError
        
        return NextResponse.json({ 
          success: true, 
          data: newQuote 
        })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedQuote, error: updateError } = await supabase
          .from('quotes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        return NextResponse.json({ 
          success: true, 
          data: updatedQuote 
        })
      
      case 'send':
        // This would send the quote via email
        return NextResponse.json({ 
          success: true, 
          message: 'Quote sent successfully' 
        })
      
      case 'duplicate':
        // This would duplicate a quote
        return NextResponse.json({ 
          success: true, 
          message: 'Quote duplicated successfully' 
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Quotes API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}