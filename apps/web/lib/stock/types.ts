export interface StockListing {
  id: string
  model: string
  year: number
  mileage: number
  color: string
  price: number
  description: string
  features: string[]
  images: string[]
  primaryImage: number
  status: 'available' | 'sold' | 'reserved'
  createdAt: string
  updatedAt: string
}

export type CreateStockInput = Omit<StockListing, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateStockInput = Partial<Omit<StockListing, 'id' | 'createdAt' | 'updatedAt'>>
