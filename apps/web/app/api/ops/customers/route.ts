import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mapDatabaseCustomerToFrontend, mapFrontendCustomerToDatabase } from '@/lib/types/customer'
import { getCustomersPaginated, invalidateCustomersCache, CUSTOMER_COLUMNS } from '@/lib/supabase/optimized-queries'

// Mock customer data for development (fallback only)
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
    const supabase = await createServiceClient()

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Build query with specific columns (not SELECT *)
    let query = supabase
      .from('customers')
      .select(CUSTOMER_COLUMNS)
      .order('last_name')
      .order('first_name')
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (type && type !== 'all') {
      query = query.eq('customer_type', type)
    }
    
    // Execute query
    const { data: customersData, error: customersError } = await query
    
    // If table doesn't exist or error, return mock data
    if (customersError) {
      console.log('Customers table not found, using mock data:', customersError.message)
      return NextResponse.json({ 
        success: true, 
        data: MOCK_CUSTOMERS,
        mock: true 
      })
    }
    
    // If no data, check if table is empty or just no matches
    if (!customersData || customersData.length === 0) {
      // Check if table has any data at all (use id column only, not *)
      const { count } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
      
      if (count === 0) {
        // Table is empty, return mock data
        return NextResponse.json({ 
          success: true, 
          data: MOCK_CUSTOMERS,
          mock: true 
        })
      } else {
        // Table has data but no matches for filters
        return NextResponse.json({ 
          success: true, 
          data: [] 
        })
      }
    }
    
    // Map database fields to frontend format
    const mappedCustomers = customersData.map(mapDatabaseCustomerToFrontend)
    
    // Apply text search if provided (post-filter for now)
    let filteredCustomers = mappedCustomers
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCustomers = mappedCustomers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.company && customer.company.toLowerCase().includes(searchLower))
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: filteredCustomers 
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

    const supabase = await createServiceClient()

    switch (action) {
      case 'create':
        // Map frontend format to database format
        const createData = mapFrontendCustomerToDatabase(data)

        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert(createData)
          .select()
          .single()

        if (createError) throw createError

        // Map back to frontend format
        const mappedNewCustomer = mapDatabaseCustomerToFrontend(newCustomer)

        // Invalidate customers cache after mutation
        invalidateCustomersCache()

        return NextResponse.json({
          success: true,
          data: mappedNewCustomer
        })

      case 'update':
        const { id, ...updateFields } = data

        // Map frontend format to database format
        const updateData = mapFrontendCustomerToDatabase(updateFields)

        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) throw updateError

        // Map back to frontend format
        const mappedUpdatedCustomer = mapDatabaseCustomerToFrontend(updatedCustomer)

        // Invalidate customers cache after mutation
        invalidateCustomersCache()

        return NextResponse.json({
          success: true,
          data: mappedUpdatedCustomer
        })

      case 'delete':
        const { error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', data.id)

        if (deleteError) throw deleteError

        // Invalidate customers cache after mutation
        invalidateCustomersCache()

        return NextResponse.json({
          success: true,
          message: 'Customer deleted successfully'
        })
      
      case 'addCommunication':
        const { customerId, ...commData } = data

        // Add a communication record
        const { data: newComm, error: commError } = await supabase
          .from('customer_communications')
          .insert({
            customer_id: customerId,
            communication_type: commData.type || 'note',
            direction: commData.direction || 'internal',
            subject: commData.subject,
            content: commData.content,
            outcome: commData.outcome,
            performed_by: commData.performedBy,
            scheduled_follow_up: commData.scheduledFollowUp
          })
          .select()
          .single()

        if (commError) throw commError

        // Update last contact date on customer
        await supabase
          .from('customers')
          .update({ last_contact_date: new Date().toISOString() })
          .eq('id', customerId)

        // Invalidate customers cache after mutation
        invalidateCustomersCache()

        return NextResponse.json({
          success: true,
          data: newComm,
          message: 'Communication added successfully'
        })

      case 'convertLead':
        // Convert a lead to a customer using the database function
        const { data: convertedCustomer, error: convertError } = await supabase
          .rpc('convert_lead_to_customer', { p_lead_id: data.leadId })

        if (convertError) throw convertError

        // Fetch the full customer data
        const { data: customerData, error: fetchError } = await supabase
          .from('customers')
          .select(CUSTOMER_COLUMNS)
          .eq('id', convertedCustomer)
          .single()

        if (fetchError) throw fetchError

        const mappedCustomer = mapDatabaseCustomerToFrontend(customerData)

        // Invalidate customers cache after mutation
        invalidateCustomersCache()

        return NextResponse.json({
          success: true,
          data: mappedCustomer,
          message: 'Lead converted to customer successfully'
        })
      
      case 'search':
        // Use the database search function
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_customers', { search_term: data.searchTerm })
        
        if (searchError) throw searchError
        
        return NextResponse.json({ 
          success: true, 
          data: searchResults 
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