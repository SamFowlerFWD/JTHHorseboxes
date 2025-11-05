// Customer type definitions for J Taylor Horseboxes operations platform

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  
  // Address
  address: {
    street: string
    city: string
    county: string
    postcode: string
    country: string
  }
  
  // Business classification
  status: 'active' | 'inactive' | 'prospect'
  customerType: 'individual' | 'business' | 'dealer'
  
  // Acquisition tracking
  acquisitionSource?: string
  acquisitionCampaign?: string
  leadId?: string
  
  // Financial metrics
  totalOrders: number
  totalValue: number
  averageOrderValue: number
  lastOrderDate?: Date
  
  // Customer service
  notes?: string
  tags: string[]
  
  // Contact preferences
  lastContactDate?: Date
  preferredContactMethod?: 'email' | 'phone' | 'sms' | 'post'
  
  // Business fields
  vatNumber?: string
  creditLimit?: number
  paymentTerms?: number
  
  // System fields
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface CustomerCommunication {
  id: string
  customerId: string
  communicationType: 'email' | 'phone' | 'meeting' | 'note' | 'sms'
  direction?: 'inbound' | 'outbound' | 'internal'
  subject?: string
  content?: string
  outcome?: string
  performedBy?: string
  scheduledFollowUp?: Date
  createdAt: Date
}

export interface CustomerOrder {
  id: string
  customerId: string
  orderNumber: string
  quoteId?: string
  orderDate: Date
  totalAmount: number
  vatAmount?: number
  status: string
  buildId?: string
  deliveryDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Database to frontend field mapping
export function mapDatabaseCustomerToFrontend(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    firstName: dbCustomer.first_name,
    lastName: dbCustomer.last_name,
    email: dbCustomer.email,
    phone: dbCustomer.phone,
    company: dbCustomer.company,
    address: {
      street: dbCustomer.address_street || '',
      city: dbCustomer.address_city || '',
      county: dbCustomer.address_county || '',
      postcode: dbCustomer.address_postcode || '',
      country: dbCustomer.address_country || 'United Kingdom'
    },
    status: dbCustomer.status || 'prospect',
    customerType: dbCustomer.customer_type || 'individual',
    acquisitionSource: dbCustomer.acquisition_source,
    acquisitionCampaign: dbCustomer.acquisition_campaign,
    leadId: dbCustomer.lead_id,
    totalOrders: dbCustomer.total_orders || 0,
    totalValue: dbCustomer.total_value || 0,
    averageOrderValue: dbCustomer.average_order_value || 0,
    lastOrderDate: dbCustomer.last_order_date ? new Date(dbCustomer.last_order_date) : undefined,
    notes: dbCustomer.notes,
    tags: dbCustomer.tags || [],
    lastContactDate: dbCustomer.last_contact_date ? new Date(dbCustomer.last_contact_date) : undefined,
    preferredContactMethod: dbCustomer.preferred_contact_method,
    vatNumber: dbCustomer.vat_number,
    creditLimit: dbCustomer.credit_limit,
    paymentTerms: dbCustomer.payment_terms,
    createdAt: new Date(dbCustomer.created_at),
    updatedAt: new Date(dbCustomer.updated_at),
    createdBy: dbCustomer.created_by
  }
}

// Frontend to database field mapping
export function mapFrontendCustomerToDatabase(customer: Partial<Customer>): any {
  const dbCustomer: any = {}
  
  if (customer.id) dbCustomer.id = customer.id
  if (customer.firstName) dbCustomer.first_name = customer.firstName
  if (customer.lastName) dbCustomer.last_name = customer.lastName
  if (customer.email) dbCustomer.email = customer.email
  if (customer.phone !== undefined) dbCustomer.phone = customer.phone
  if (customer.company !== undefined) dbCustomer.company = customer.company
  
  if (customer.address) {
    if (customer.address.street) dbCustomer.address_street = customer.address.street
    if (customer.address.city) dbCustomer.address_city = customer.address.city
    if (customer.address.county) dbCustomer.address_county = customer.address.county
    if (customer.address.postcode) dbCustomer.address_postcode = customer.address.postcode
    if (customer.address.country) dbCustomer.address_country = customer.address.country
  }
  
  if (customer.status) dbCustomer.status = customer.status
  if (customer.customerType) dbCustomer.customer_type = customer.customerType
  if (customer.acquisitionSource !== undefined) dbCustomer.acquisition_source = customer.acquisitionSource
  if (customer.acquisitionCampaign !== undefined) dbCustomer.acquisition_campaign = customer.acquisitionCampaign
  if (customer.leadId !== undefined) dbCustomer.lead_id = customer.leadId
  
  if (customer.totalOrders !== undefined) dbCustomer.total_orders = customer.totalOrders
  if (customer.totalValue !== undefined) dbCustomer.total_value = customer.totalValue
  if (customer.averageOrderValue !== undefined) dbCustomer.average_order_value = customer.averageOrderValue
  if (customer.lastOrderDate !== undefined) dbCustomer.last_order_date = customer.lastOrderDate
  
  if (customer.notes !== undefined) dbCustomer.notes = customer.notes
  if (customer.tags !== undefined) dbCustomer.tags = customer.tags
  
  if (customer.lastContactDate !== undefined) dbCustomer.last_contact_date = customer.lastContactDate
  if (customer.preferredContactMethod !== undefined) dbCustomer.preferred_contact_method = customer.preferredContactMethod
  
  if (customer.vatNumber !== undefined) dbCustomer.vat_number = customer.vatNumber
  if (customer.creditLimit !== undefined) dbCustomer.credit_limit = customer.creditLimit
  if (customer.paymentTerms !== undefined) dbCustomer.payment_terms = customer.paymentTerms
  
  return dbCustomer
}