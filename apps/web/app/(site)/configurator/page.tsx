'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConfiguratorStore } from '@/lib/configurator/store'
import { MODELS } from '@/lib/configurator/types'
import { ArrowLeft, ArrowRight, Save, Send, Info } from 'lucide-react'

// Import new components
import CustomerInfoStep from './components/CustomerInfoStep'
import VehicleChassisStep from './components/VehicleChassisStep'
import DepositStep from './components/DepositStep'
import OptionsStep from './components/OptionsStep'
import ReviewStep from './components/ReviewStep'

export default function ConfiguratorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    currentStep,
    setCurrentStep,
    selectedModel,
    setAvailableOptions,
    getConfiguration,
    resetConfiguration,
    setLoading,
    setError,
    error,
    isLoading,
    customerEmail
  } = useConfiguratorStore()

  // Fetch pricing options when model is selected
  useEffect(() => {
    if (selectedModel) {
      fetchPricingOptions(selectedModel.name)
    }
  }, [selectedModel])

  const fetchPricingOptions = async (modelName: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Get model slug from the selected model
      const modelSlug = modelName.toLowerCase().replace(/\s+/g, '-')
      
      // Fetch configuration from pricing.json via the config API
      const response = await fetch(`/api/config/${modelSlug}`)
      if (!response.ok) {
        throw new Error('Failed to fetch pricing options')
      }
      
      const data = await response.json()
      
      // Transform options to match the expected format
      const transformedOptions = data.options?.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        price: opt.pricePerUnitPence / 100, // Convert pence to pounds
        category: opt.category || 'general',
        type: opt.type,
        maxQty: opt.maxQty,
        unit: opt.unit,
        dependencies: opt.dependencies || []
      })) || []
      
      setAvailableOptions(transformedOptions)
    } catch (err) {
      console.error('Error fetching pricing options:', err)
      setError('Failed to load pricing options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      // Validate customer info
      const store = useConfiguratorStore.getState()
      if (!store.customerName || !store.customerEmail || !store.customerPhone) {
        setError('Please fill in all required customer information')
        return
      }
    } else if (currentStep === 2) {
      // Validate vehicle selection
      if (!selectedModel) {
        setError('Please select a model')
        return
      }
      
      // Only validate chassis cost for configurable models
      if (selectedModel.availability === 'configurable') {
        const store = useConfiguratorStore.getState()
        if (!store.chassisCost || store.chassisCost <= 0) {
          setError('Please enter a valid chassis cost')
          return
        }
      }
    }
    
    setError(null)
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitConfiguration = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const configuration = getConfiguration()
      if (!configuration) {
        throw new Error('No configuration to submit')
      }

      // Submit lead with configuration
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: configuration.customerName.split(' ')[0] || '',
          last_name: configuration.customerName.split(' ').slice(1).join(' ') || '',
          email: configuration.customerEmail,
          phone: configuration.customerPhone,
          source: 'configurator',
          configuration: configuration,
          quote_amount: configuration.total_inc_vat,
          agent_name: configuration.agentName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit configuration')
      }

      const result = await response.json()
      
      // Navigate to success page
      router.push(`/configurator/success?id=${result.id}`)
    } catch (err) {
      console.error('Error submitting configuration:', err)
      setError('Failed to submit your configuration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Customer Information'
      case 2:
        return 'Vehicle & Chassis'
      case 3:
        return 'Deposit'
      case 4:
        return 'Options & Packages'
      case 5:
        return 'Review & Submit'
      default:
        return 'Configure Your Horsebox'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Enter your contact details and select an agent if applicable'
      case 2:
        return 'Choose your range, tonnage, and specific model'
      case 3:
        return selectedModel?.availability === 'configurable' 
          ? 'Set your deposit amount (default £5,000)' 
          : 'Deposit information (for reference only)'
      case 4:
        if (!selectedModel) return 'Choose additional options and customizations'
        if (selectedModel.availability === 'pre-built') return 'Limited customization options available'
        if (selectedModel.availability === 'contact-only') return 'Options determined during consultation'
        return selectedModel.pioneer_package_eligible 
          ? 'Add Pioneer Package and additional options'
          : 'Choose additional options and customizations'
      case 5:
        return selectedModel?.availability === 'configurable'
          ? 'Review your configuration and payment schedule'
          : 'Review your selection and submit inquiry'
      default:
        return ''
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        const store = useConfiguratorStore.getState()
        return store.customerName && store.customerEmail && store.customerPhone
      case 2:
        if (!selectedModel) return false
        // For configurable models, require chassis cost
        if (selectedModel.availability === 'configurable') {
          return useConfiguratorStore.getState().chassisCost > 0
        }
        // For non-configurable models, just need model selection
        return true
      case 3:
        // For configurable models, require deposit
        if (selectedModel?.availability === 'configurable') {
          return useConfiguratorStore.getState().deposit > 0
        }
        return true
      case 4:
        return true // Options are optional
      case 5:
        return !isSubmitting
      default:
        return false
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{getStepTitle()}</h1>
              <p className="text-sm text-slate-600 mt-1">{getStepDescription()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Step {currentStep} of 5</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Customer Information */}
        {currentStep === 1 && <CustomerInfoStep />}

        {/* Step 2: Vehicle & Chassis */}
        {currentStep === 2 && <VehicleChassisStep />}

        {/* Step 3: Deposit */}
        {currentStep === 3 && <DepositStep />}

        {/* Step 4: Options */}
        {currentStep === 4 && <OptionsStep />}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && <ReviewStep onSubmit={handleSubmitConfiguration} isSubmitting={isSubmitting} />}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-4">
            {currentStep === 4 && (
              <button
                onClick={() => resetConfiguration()}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Reset Configuration
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  !canProceed()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitConfiguration}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Configuration'}
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}