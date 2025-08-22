import { NextRequest, NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'

// Sample saved configurations for development
const SAVED_CONFIGS: Record<string, any> = {
  'sample-35t-config': {
    id: 'sample-35t-config',
    name: 'Sample 3.5t Configuration',
    modelId: '35t',
    chassisCostPence: 6000000,
    depositPence: 1000000,
    selectedOptions: [
      { id: 'electric_pack', quantity: 1 },
      { id: 'solar_panel', quantity: 1 },
      { id: 'rear_tack_locker', quantity: 1 }
    ],
    pioneerEnabled: true,
    pioneerChassisFeet: 12,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  'sample-72t-config': {
    id: 'sample-72t-config',
    name: 'Sample 7.2t Configuration',
    modelId: '72t',
    chassisCostPence: 12000000,
    depositPence: 2000000,
    selectedOptions: [
      { id: 'living_area', quantity: 1 },
      { id: 'shower', quantity: 1 },
      { id: 'hot_water', quantity: 1 },
      { id: 'awning', perFoot: 10 }
    ],
    pioneerEnabled: false,
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z'
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      )
    }

    const cfg = await loadPricingConfig()
    
    // Check if this is a model ID (e.g., '35t', '45t', '72t')
    const model = cfg.models.find(m => m.id === id)
    
    if (model) {
      // Return model configuration
      const pioneer = cfg.packages.find(
        p => p.id === 'pioneer' && p.appliesTo.includes(model.id)
      ) ?? null
      
      return NextResponse.json({
        type: 'model',
        model,
        options: cfg.options.filter(opt => 
          !opt.appliesTo || opt.appliesTo.length === 0 || opt.appliesTo.includes(model.id)
        ),
        pioneer,
        vatRate: cfg.vatRate,
        depositDefaultPence: cfg.depositDefaultPence
      })
    }
    
    // Check if this is a saved configuration ID
    const savedConfig = SAVED_CONFIGS[id]
    
    if (savedConfig) {
      // Get the model for this saved config
      const configModel = cfg.models.find(m => m.id === savedConfig.modelId)
      
      if (!configModel) {
        return NextResponse.json(
          { error: `Model ${savedConfig.modelId} not found for saved configuration` },
          { status: 404 }
        )
      }
      
      const pioneer = cfg.packages.find(
        p => p.id === 'pioneer' && p.appliesTo.includes(configModel.id)
      ) ?? null
      
      return NextResponse.json({
        type: 'saved',
        config: savedConfig,
        model: configModel,
        options: cfg.options.filter(opt => 
          !opt.appliesTo || opt.appliesTo.length === 0 || opt.appliesTo.includes(configModel.id)
        ),
        pioneer,
        vatRate: cfg.vatRate,
        depositDefaultPence: savedConfig.depositPence || cfg.depositDefaultPence
      })
    }
    
    // Not found
    return NextResponse.json(
      { 
        error: `Configuration '${id}' not found`,
        availableModels: cfg.models.map(m => m.id),
        sampleConfigs: Object.keys(SAVED_CONFIGS)
      },
      { status: 404 }
    )
    
  } catch (error: any) {
    console.error('Error in GET /api/config/[id]:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

// POST handler for saving configurations
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()
    
    // In production, this would save to database
    // For now, just return a success response with a generated ID
    const configId = id || `config-${Date.now()}`
    
    const savedConfig = {
      id: configId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Store in memory (would be database in production)
    SAVED_CONFIGS[configId] = savedConfig
    
    console.log('Configuration saved:', savedConfig)
    
    return NextResponse.json({
      success: true,
      id: configId,
      config: savedConfig,
      message: 'Configuration saved successfully'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error in POST /api/config/[id]:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
