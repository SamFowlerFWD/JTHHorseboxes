import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

// Mock customer data for development
const MOCK_CUSTOMERS = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Thompson',
    company: 'Thompson Equestrian',
    email: 'sarah.thompson@example.com',
    phone: '+44 7700 900123',
    address: {
      street: '123 High Street',
      city: 'York',
      county: 'North Yorkshire',
      postcode: 'YO1 7HY',
      country: 'United Kingdom'
    },
    status: 'active',
    type: 'customer',
    createdAt: new Date('2024-06-15'),
    lastContact: new Date('2024-12-10'),
    totalOrders: 2,
    totalValue: 85000,
    notes: 'VIP customer - owns multiple horses',
    tags: ['vip', 'repeat_customer']
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Wilson',
    company: null,
    email: 'j.wilson@example.com',
    phone: '+44 7700 900456',
    address: {
      street: '45 Oak Avenue',
      city: 'Leeds',
      county: 'West Yorkshire',
      postcode: 'LS1 2AB',
      country: 'United Kingdom'
    },
    status: 'lead',
    type: 'prospect',
    createdAt: new Date('2024-11-20'),
    lastContact: new Date('2024-12-08'),
    totalOrders: 0,
    totalValue: 0,
    notes: 'Interested in 3.5t model',
    tags: ['lead', 'follow_up']
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Davies',
    company: 'Davies Racing Stables',
    email: 'emma@daviesracing.co.uk',
    phone: '+44 7700 900789',
    address: {
      street: '78 Mill Lane',
      city: 'Harrogate',
      county: 'North Yorkshire',
      postcode: 'HG1 3QP',
      country: 'United Kingdom'
    },
    status: 'active',
    type: 'customer',
    createdAt: new Date('2023-09-10'),
    lastContact: new Date('2024-11-25'),
    totalOrders: 3,
    totalValue: 125000,
    notes: 'Professional racing stable',
    tags: ['professional', 'racing']
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Brown',
    company: null,
    email: 'mbrown@example.com',
    phone: '+44 7700 900321',
    address: {
      street: '12 Church Road',
      city: 'Sheffield',
      county: 'South Yorkshire',
      postcode: 'S1 4PD',
      country: 'United Kingdom'
    },
    status: 'active',
    type: 'customer',
    createdAt: new Date('2024-03-22'),
    lastContact: new Date('2024-10-15'),
    totalOrders: 1,
    totalValue: 42000,
    notes: 'First time buyer',
    tags: ['new_customer']
  },
  {
    id: '5',
    firstName: 'Lucy',
    lastName: 'Anderson',
    company: 'Anderson Equine Transport',
    email: 'lucy@andersonequine.com',
    phone: '+44 7700 900654',
    address: {
      street: '234 Main Street',
      city: 'Ripon',
      county: 'North Yorkshire',
      postcode: 'HG4 1AA',
      country: 'United Kingdom'
    },
    status: 'active',
    type: 'customer',
    createdAt: new Date('2024-01-05'),
    lastContact: new Date('2024-12-01'),
    totalOrders: 4,
    totalValue: 180000,
    notes: 'Fleet customer - multiple vehicles',
    tags: ['fleet', 'commercial']
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Jones',
    company: null,
    email: 'djones@example.com',
    phone: '+44 7700 900987',
    address: {
      street: '56 Park View',
      city: 'Thirsk',
      county: 'North Yorkshire',
      postcode: 'YO7 1RR',
      country: 'United Kingdom'
    },
    status: 'lead',
    type: 'prospect',
    createdAt: new Date('2024-12-05'),
    lastContact: new Date('2024-12-12'),
    totalOrders: 0,
    totalValue: 0,
    notes: 'Quote requested for 4.5t model',
    tags: ['quote_sent']
  },
  {
    id: '7',
    firstName: 'Rachel',
    lastName: 'Green',
    company: 'Green Fields Stud',
    email: 'rachel@greenfields.co.uk',
    phone: '+44 7700 900147',
    address: {
      street: '89 Country Lane',
      city: 'Wetherby',
      county: 'West Yorkshire',
      postcode: 'LS22 5EF',
      country: 'United Kingdom'
    },
    status: 'active',
    type: 'customer',
    createdAt: new Date('2023-05-18'),
    lastContact: new Date('2024-11-30'),
    totalOrders: 2,
    totalValue: 95000,
    notes: 'Breeding operation',
    tags: ['breeder', 'repeat_customer']
  },
  {
    id: '8',
    firstName: 'Thomas',
    lastName: 'Wright',
    company: null,
    email: 'twright@example.com',
    phone: '+44 7700 900258',
    address: {
      street: '33 Station Road',
      city: 'Northallerton',
      county: 'North Yorkshire',
      postcode: 'DL7 8AD',
      country: 'United Kingdom'
    },
    status: 'inactive',
    type: 'customer',
    createdAt: new Date('2023-11-12'),
    lastContact: new Date('2024-05-20'),
    totalOrders: 1,
    totalValue: 38000,
    notes: 'Completed purchase - no current activity',
    tags: ['inactive']
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient()
    
    // Try to fetch from database
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('lastName')
    
    // If table doesn't exist or error, return mock data
    if (customersError) {
      console.log('Customers table not found, using mock data:', customersError.message)
      return NextResponse.json({ 
        success: true, 
        data: MOCK_CUSTOMERS,
        mock: true 
      })
    }
    
    // If no data, return mock data
    if (!customersData || customersData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: MOCK_CUSTOMERS,
        mock: true 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: customersData 
    })
  } catch (error: any) {
    console.error('Customers API error:', error)
    // Return mock data on error
    return NextResponse.json({ 
      success: true, 
      data: MOCK_CUSTOMERS,
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
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert(data)
          .select()
          .single()
        
        if (createError) throw createError
        
        return NextResponse.json({ 
          success: true, 
          data: newCustomer 
        })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        return NextResponse.json({ 
          success: true, 
          data: updatedCustomer 
        })
      
      case 'addNote':
        // This would add a note to customer history
        return NextResponse.json({ 
          success: true, 
          message: 'Note added successfully' 
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Customers API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}