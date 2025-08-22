#!/usr/bin/env node

// Seed script for JTH 3.5t models pricing based on Google Apps Script
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Define the 3.5t models and their options
const pricingData = {
  models: [
    { name: 'Professional 35', base_price: 22000, description: 'Premium features', order: 1 },
    { name: 'Principle 35', base_price: 18500, description: 'Great value', order: 2 },
    { name: 'Progeny 35', base_price: 25500, description: 'Top of the range', order: 3 }
  ],
  
  // Pioneer Package - special bundled option
  pioneerPackage: {
    name: 'Pioneer Package',
    price: 10800,
    description: 'Complete living package including L4 upgrade, uprating to 4.5T, full fitout with cabinets, seating, sink/hob, water, fridge, windows, electrics and more',
    includes: [
      'L4 surcharge',
      'Uprating to 4.5T (L4 chassis only)',
      'Standard external tack locker (1x)',
      'Professionally Upholstered seat coverings',
      'Wall cabinets including lighting',
      'Base cabinets',
      'Additional Shelf',
      'Full length seating on one side (Upholstered)',
      'Sink/hob unit with gas locker',
      'Water tank and installation',
      'Fridge/Freezer',
      'Large window (2x)',
      'Window blinds + pads (2x)',
      'Wood Effect internals',
      'Leisure battery and electrics including installation',
      '240v hook up including trickle charger and 2x sockets'
    ]
  },
  
  // Common options across all models
  commonOptions: {
    chassis: [
      { name: 'Rear chassis extension', price_per_unit: 1000, max_quantity: 3, unit: 'ft', category: 'chassis' }
    ],
    exterior: [
      { name: 'External tie rings', price: 0, category: 'exterior' },
      { name: 'Additional rear and side loading lights', price: 180, category: 'exterior' },
      { name: 'Reversing lights', price: 180, category: 'exterior' },
      { name: 'Spare Key', price: 150, category: 'exterior' },
      { name: 'Reversing Sensors', price: 240, category: 'exterior' },
      { name: 'Standard external tack locker', price: 655, max_quantity: 2, unit: 'locker', category: 'exterior' },
      { name: 'Large external tack locker', price: 750, category: 'exterior' }
    ],
    cab: [
      { name: 'Front Cab seat covers', price: 0, category: 'cab' },
      { name: 'Professionally Upholstered seat coverings', price: 950, category: 'cab' },
      { name: 'L4 surcharge', price: 1000, category: 'cab' },
      { name: 'Uprating to 4.5T (L4 chassis only)', price: 2000, category: 'cab' }
    ],
    horseArea: [
      { name: 'Sliding Partition', price: 1800, category: 'horse_area' },
      { name: 'Door in Z wall', price: 240, category: 'horse_area' },
      { name: 'Z wall top sliding doors', price: 650, category: 'horse_area' },
      { name: 'Temperature monitoring system', price: 284, category: 'horse_area' },
      { name: 'Door on Luton Compartment', price: 320, category: 'horse_area' },
      { name: 'Extra (small) window', price: 180, category: 'horse_area' },
      { name: 'Extra (Large) window', price: 240, category: 'horse_area' }
    ],
    groomsArea: [
      { name: 'Large window', price: 120, max_quantity: 2, unit: 'window', category: 'grooms_area' },
      { name: 'Window blinds + pads (fly screen and blackout)', price: 189, max_quantity: 2, unit: 'set', category: 'grooms_area' },
      { name: 'Wood Effect internals', price: 800, category: 'grooms_area' },
      { name: 'Wall cabinets including lighting', price: 1650, category: 'grooms_area' },
      { name: 'Base cabinets (refer to spec sheet for layout)', price: 1350, category: 'grooms_area' },
      { name: 'Full length seating on one side (Upholstered)', price: 870, category: 'grooms_area' },
      { name: 'Additional Shelf', price: 150, category: 'grooms_area' },
      { name: 'Water tank and installation', price: 680, category: 'grooms_area' },
      { name: 'Horse shower and pump', price: 700, category: 'grooms_area' },
      { name: '240v hook up including trickle charger and 2x sockets', price: 300, category: 'electrical' },
      { name: '240v Inverter Supplied and installed', price: 1000, category: 'electrical' },
      { name: 'Fridge/Freezer', price: 348, category: 'electrical', requires: 'Leisure battery and electrics including installation' },
      { name: 'Sink/hob unit with gas locker', price: 1500, category: 'grooms_area' },
      { name: 'Solar Panels and chargers', price: 465, category: 'electrical' },
      { name: 'Leisure battery and electrics including installation', price: 1180, category: 'electrical' }
    ]
  },
  
  // Model-specific options
  professionalOnly: [
    // Most options are common, but seat covers are included in Progeny
  ],
  
  principleOnly: [
    { name: 'Metallic colour respray', price: 2500, category: 'exterior' },
    { name: 'Metallic two colour respray', price: 2750, category: 'exterior' },
    { name: 'Horse head and partition padding', price: 600, category: 'horse_area' },
    { name: 'Reversing camera', price: 100, category: 'exterior' },
    { name: '4 adjustable tie ring track', price: 200, category: 'horse_area' },
    { name: 'Reinforced heavy duty steel window bars', price: 300, category: 'horse_area' },
    { name: 'Climate control horse fan', price: 350, category: 'horse_area' },
    { name: 'Loading light', price: 108, category: 'exterior' },
    { name: 'Storage bench seats', price: 250, category: 'grooms_area' }
  ],
  
  progenyOnly: [
    { name: 'External small crewcab doors', price: 240, category: 'exterior' },
    { name: '2x crewcab windows (seating level)', price: 190, max_quantity: 2, unit: 'window', category: 'exterior' },
    { name: '2x Luton windows', price: 120, max_quantity: 2, unit: 'window', category: 'exterior' },
    { name: 'Single passenger seat', price: 600, category: 'cab' }
  ]
}

async function seedPricing() {
  try {
    console.log('🧹 Clearing existing pricing options...')
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('pricing_options')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error clearing data:', deleteError)
    }
    
    console.log('📝 Inserting 3.5t models and options...')
    
    let displayOrder = 0
    const allOptions = []
    
    // Add base models
    for (const model of pricingData.models) {
      console.log(`\n📦 Adding base model ${model.name}...`)
      allOptions.push({
        model: '3.5t',
        category: 'base',
        name: model.name,
        description: model.description,
        price: model.base_price,
        vat_rate: 20,
        is_available: true,
        is_default: false,
        display_order: displayOrder++,
        applies_to: model.name
      })
    }
    
    // Add Pioneer Package (single entry, applies to all 3.5t models)
    console.log('\n📦 Adding Pioneer Package...')
    allOptions.push({
      model: '3.5t',
      category: 'pioneer',
      name: pricingData.pioneerPackage.name,
      description: pricingData.pioneerPackage.description,
      price: pricingData.pioneerPackage.price,
      vat_rate: 20,
      is_available: true,
      is_default: false,
      display_order: displayOrder++,
      applies_to: 'all'
    })
    
    // Add common options (single entry for each, applies to all models)
    console.log('\n📦 Adding common options...')
    const allCommonOptions = [
      ...pricingData.commonOptions.chassis,
      ...pricingData.commonOptions.exterior,
      ...pricingData.commonOptions.cab,
      ...pricingData.commonOptions.horseArea,
      ...pricingData.commonOptions.groomsArea
    ]
    
    for (const option of allCommonOptions) {
      allOptions.push({
        model: '3.5t',
        category: option.category,
        name: option.name,
        description: option.unit ? `Price per ${option.unit}. Max: ${option.max_quantity || 1}` : option.description || null,
        price: option.price_per_unit || option.price || 0,
        vat_rate: 20,
        is_available: true,
        is_default: false,
        display_order: displayOrder++,
        applies_to: 'all',
        requires: option.requires || null
      })
    }
    
    // Add model-specific options (with model scope)
    console.log('\n📦 Adding Principle 35 specific options...')
    for (const option of pricingData.principleOnly) {
      allOptions.push({
        model: '3.5t',
        category: option.category,
        name: option.name,
        description: option.unit ? `Price per ${option.unit}. Max: ${option.max_quantity || 1}` : null,
        price: option.price || 0,
        vat_rate: 20,
        is_available: true,
        is_default: false,
        display_order: displayOrder++,
        applies_to: 'Principle 35'
      })
    }
    
    console.log('\n📦 Adding Progeny 35 specific options...')
    for (const option of pricingData.progenyOnly) {
      allOptions.push({
        model: '3.5t',
        category: option.category,
        name: option.name,
        description: option.unit ? `Price per ${option.unit}. Max: ${option.max_quantity || 1}` : null,
        price: option.price || 0,
        vat_rate: 20,
        is_available: true,
        is_default: false,
        display_order: displayOrder++,
        applies_to: 'Progeny 35'
      })
    }
    
    // Insert all options in batches
    const batchSize = 50
    for (let i = 0; i < allOptions.length; i += batchSize) {
      const batch = allOptions.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('pricing_options')
        .insert(batch)
      
      if (insertError) {
        console.error('Error inserting batch:', insertError)
        throw insertError
      }
      
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allOptions.length/batchSize)}`)
    }
    
    console.log(`\n✅ Successfully seeded ${allOptions.length} pricing options for 3.5t models`)
    console.log('\n📊 Summary:')
    console.log(`- Models: ${pricingData.models.map(m => m.name).join(', ')}`)
    console.log(`- Pioneer Package: £${pricingData.pioneerPackage.price.toLocaleString()}`)
    console.log(`- Common options: ${allCommonOptions.length}`)
    console.log(`- Principle-specific options: ${pricingData.principleOnly.length}`)
    console.log(`- Progeny-specific options: ${pricingData.progenyOnly.length}`)
    console.log(`- Total unique options: ${allOptions.length}`)
    console.log('\n💡 Note: Aeos, Zenos, and Helios models will be added later')
    
  } catch (error) {
    console.error('❌ Error seeding pricing:', error)
    process.exit(1)
  }
}

seedPricing()