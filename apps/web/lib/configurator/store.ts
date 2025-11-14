// Zustand Store for Configurator State Management

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ConfigurationData,
  SelectedOption,
  Model,
  LeadFormData,
  PricingOption,
  PaymentSchedule,
  ModelSpecification,
  WeightCalculation,
  LivingAreaCalculation,
  CalculationWarning
} from './types'
import { PIONEER_PACKAGE } from './types'
import {
  calculateConfiguration,
  getChassisExtensionPricePerFoot
} from './engines'

interface ConfiguratorState {
  // Customer Information
  customerName: string
  customerEmail: string
  customerPhone: string
  agentName: string

  // Vehicle & Chassis
  selectedModel: Model | null
  basePrice: number
  chassisCost: number
  deposit: number
  color: string

  // Options
  pioneerPackage: boolean
  pioneerHorseArea: '1ft' | '3ft' | null
  selectedOptions: SelectedOption[]
  availableOptions: PricingOption[]

  // Pricing
  optionsTotal: number
  buildSubtotal: number
  totalExVat: number
  vatAmount: number
  totalIncVat: number

  // Payment Schedule
  paymentSchedule: PaymentSchedule

  // NEW: Model Specifications & Advanced Calculations
  modelSpecification: ModelSpecification | null
  weightCalculation: WeightCalculation | null
  livingAreaCalculation: LivingAreaCalculation | null
  calculationWarnings: CalculationWarning[]
  chassisExtensionPricePerFoot: number

  // UI State
  activeCategory: string
  currentStep: number
  isLoading: boolean
  error: string | null
  
  // Actions - Customer
  setCustomerInfo: (info: { name?: string; email?: string; phone?: string; agent?: string }) => void

  // Actions - Vehicle
  setModel: (model: Model) => void
  setChassisCost: (cost: number) => void
  setDeposit: (deposit: number) => void
  setColor: (color: string) => void

  // Actions - Options
  setPioneerPackage: (enabled: boolean, horseArea?: '1ft' | '3ft') => void
  addOption: (option: PricingOption, quantity?: number) => void
  removeOption: (optionId: string) => void
  updateOptionQuantity: (optionId: string, quantity: number) => void
  setAvailableOptions: (options: PricingOption[]) => void

  // Actions - UI
  setActiveCategory: (category: string) => void
  setCurrentStep: (step: number) => void

  // Actions - Calculations
  calculateTotals: () => void
  calculatePaymentSchedule: () => void

  // NEW: Actions - Model Specifications & Advanced Calculations
  loadModelSpecification: (modelCode: string) => Promise<void>
  recalculateAll: () => void
  setChassisExtensionPricePerFoot: (price: number) => void

  // Actions - State Management
  resetConfiguration: () => void
  getConfiguration: () => ConfigurationData | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const VAT_RATE = 0.20 // 20% VAT

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      // Initial state - Customer
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      agentName: '',
      
      // Initial state - Vehicle
      selectedModel: null,
      basePrice: 0,
      chassisCost: 0,
      deposit: 5000, // Default £5,000 deposit
      color: '',
      
      // Initial state - Options
      pioneerPackage: false,
      pioneerHorseArea: null,
      selectedOptions: [],
      availableOptions: [],
      
      // Initial state - Pricing
      optionsTotal: 0,
      buildSubtotal: 0,
      totalExVat: 0,
      vatAmount: 0,
      totalIncVat: 0,
      
      // Initial state - Payment Schedule
      paymentSchedule: {
        deposit: 5000,
        firstPayment: 0,
        secondPayment: 0,
        finalPayment: 0,
        chassisWithVat: 0,
        buildWithVat: 0,
        buildBalanceMinusDeposit: 0
      },

      // Initial state - Model Specifications & Advanced Calculations
      modelSpecification: null,
      weightCalculation: null,
      livingAreaCalculation: null,
      calculationWarnings: [],
      chassisExtensionPricePerFoot: 1000, // Default £1000 per foot

      // Initial state - UI
      activeCategory: 'exterior',
      currentStep: 1,
      isLoading: false,
      error: null,

      // Set customer information
      setCustomerInfo: (info) => {
        set((state) => ({
          customerName: info.name ?? state.customerName,
          customerEmail: info.email ?? state.customerEmail,
          customerPhone: info.phone ?? state.customerPhone,
          agentName: info.agent ?? state.agentName
        }))
      },

      // Set the selected model
      setModel: (model: Model | null) => {
        if (!model) {
          set({
            selectedModel: null,
            basePrice: 0,
            selectedOptions: [],
            pioneerPackage: false,
            pioneerHorseArea: null,
            modelSpecification: null,
            weightCalculation: null,
            livingAreaCalculation: null,
            calculationWarnings: [],
            error: null
          })
          return
        }

        set({
          selectedModel: model,
          basePrice: model.base_price || 0,
          selectedOptions: [],
          pioneerPackage: false,
          pioneerHorseArea: null,
          error: null
        })

        // Load model specifications for weight and living area calculations
        // This happens asynchronously but doesn't block the UI
        get().loadModelSpecification(model.slug).catch(err => {
          console.warn('Failed to load model specification:', err)
          // Don't set error - model specs are optional enhancement
        })

        // Only calculate totals for configurable models with pricing
        if (model.availability === 'configurable' && model.base_price !== null) {
          get().calculateTotals()
        }
      },

      // Set chassis cost
      setChassisCost: (cost: number) => {
        set({ chassisCost: cost })
        get().calculatePaymentSchedule()
      },

      // Set deposit
      setDeposit: (deposit: number) => {
        set({ deposit })
        get().calculatePaymentSchedule()
      },

      // Set color
      setColor: (color: string) => {
        set({ color })
      },

      // Set Pioneer Package
      setPioneerPackage: (enabled: boolean, horseArea?: '1ft' | '3ft') => {
        const state = get()
        const { selectedModel, availableOptions } = state
        
        if (!selectedModel) return
        
        // Only allow Pioneer Package for eligible 4.5T models
        if (!selectedModel.pioneer_package_eligible) {
          console.warn('Pioneer Package not available for this model')
          return
        }
        
        set({ 
          pioneerPackage: enabled,
          pioneerHorseArea: enabled ? (horseArea || null) : null
        })
        
        if (enabled) {
          // Auto-select included options for Pioneer Package
          const pioneerOptions = PIONEER_PACKAGE.includedOptions
          const currentOptions = state.selectedOptions
          
          pioneerOptions.forEach(optionName => {
            const option = availableOptions.find(o => 
              o.name.toLowerCase().includes(optionName.toLowerCase())
            )
            if (option && !currentOptions.find(o => o.id === option.id)) {
              get().addOption(option, optionName.includes('Window') || optionName.includes('Blind') ? 2 : 1)
            }
          })
        } else {
          // Remove Pioneer Package options when disabled
          const pioneerOptions = PIONEER_PACKAGE.includedOptions
          const currentOptions = state.selectedOptions
          
          const filteredOptions = currentOptions.filter(option => {
            return !pioneerOptions.some(pioneerOption => 
              option.name.toLowerCase().includes(pioneerOption.toLowerCase())
            )
          })
          
          set({ selectedOptions: filteredOptions })
        }
        
        // Only recalculate totals for configurable models
        if (selectedModel.availability === 'configurable' && selectedModel.base_price !== null) {
          get().recalculateAll()
        }
      },

      // Add an option to the configuration
      addOption: (option: PricingOption, quantity: number = 1) => {
        const currentOptions = get().selectedOptions

        // Check if option already exists
        const existingIndex = currentOptions.findIndex(o => o.id === option.id)

        if (existingIndex >= 0) {
          // Update quantity if option exists
          const updatedOptions = [...currentOptions]
          updatedOptions[existingIndex].quantity = quantity
          set({ selectedOptions: updatedOptions })
        } else {
          // Add new option - include weight and living area properties
          const newOption: SelectedOption = {
            id: option.id,
            name: option.name,
            price: option.price,
            quantity,
            category: option.category,
            subcategory: option.subcategory,
            sku: option.sku,
            vat_rate: option.vat_rate,
            weight_kg: option.weight_kg,
            living_area_units: option.living_area_units,
            per_foot_pricing: option.per_foot_pricing,
            price_per_foot: option.price_per_foot,
            feet_selected: 0 // Default to 0, can be updated later
          }

          set({
            selectedOptions: [...currentOptions, newOption],
            error: null
          })
        }

        // Handle dependencies (e.g., Fridge requires Battery)
        if (option.dependencies) {
          const deps = typeof option.dependencies === 'string'
            ? JSON.parse(option.dependencies)
            : option.dependencies

          if (deps.requires) {
            deps.requires.forEach((depName: string) => {
              const depOption = get().availableOptions.find(o =>
                o.name.toLowerCase().includes(depName.toLowerCase())
              )
              if (depOption && !currentOptions.find(o => o.id === depOption.id)) {
                get().addOption(depOption)
              }
            })
          }
        }

        // Trigger comprehensive recalculation (includes weight, living area, and pricing)
        get().recalculateAll()
      },

      // Remove an option from the configuration
      removeOption: (optionId: string) => {
        const currentOptions = get().selectedOptions
        set({
          selectedOptions: currentOptions.filter(o => o.id !== optionId),
          error: null
        })
        // Trigger comprehensive recalculation
        get().recalculateAll()
      },

      // Update option quantity
      updateOptionQuantity: (optionId: string, quantity: number) => {
        const currentOptions = get().selectedOptions
        const updatedOptions = currentOptions.map(option =>
          option.id === optionId ? { ...option, quantity } : option
        )
        set({ selectedOptions: updatedOptions })
        // Trigger comprehensive recalculation
        get().recalculateAll()
      },

      // Set available options from database
      setAvailableOptions: (options: PricingOption[]) => {
        set({ availableOptions: options })

        // Auto-detect chassis extension price from options
        const extensionPrice = getChassisExtensionPricePerFoot(options)
        if (extensionPrice !== 1000) { // If we found a real price (not default)
          set({ chassisExtensionPricePerFoot: extensionPrice })
        }
      },

      // Set the active category for UI display
      setActiveCategory: (category: string) => {
        set({ activeCategory: category })
      },

      // Set current step
      setCurrentStep: (step: number) => {
        set({ currentStep: step })
      },

      // Calculate totals including VAT
      calculateTotals: () => {
        const state = get()
        const { selectedModel, selectedOptions, basePrice, pioneerPackage } = state
        
        if (!selectedModel) {
          set({ 
            optionsTotal: 0,
            buildSubtotal: 0,
            totalExVat: 0,
            vatAmount: 0,
            totalIncVat: 0
          })
          return
        }

        // Only calculate for configurable models with pricing
        if (selectedModel.availability !== 'configurable' || selectedModel.base_price === null) {
          set({ 
            optionsTotal: 0,
            buildSubtotal: 0,
            totalExVat: 0,
            vatAmount: 0,
            totalIncVat: 0
          })
          return
        }

        // Calculate options total (including quantities)
        let optionsTotal = selectedOptions.reduce((sum, option) => 
          sum + (option.price * option.quantity), 0
        )
        
        // Add Pioneer Package if selected and model is eligible
        if (pioneerPackage && selectedModel.pioneer_package_eligible) {
          optionsTotal += PIONEER_PACKAGE.price
        }
        
        // Build subtotal is base price + options
        const buildSubtotal = basePrice + optionsTotal
        
        // Total ex VAT includes chassis cost
        const totalExVat = buildSubtotal + state.chassisCost
        
        // Calculate VAT
        const vatAmount = totalExVat * VAT_RATE
        const totalIncVat = totalExVat + vatAmount

        set({ 
          optionsTotal,
          buildSubtotal,
          totalExVat,
          vatAmount,
          totalIncVat
        })
        
        // Recalculate payment schedule
        get().calculatePaymentSchedule()
      },

      // Calculate payment schedule based on Google Apps Script logic
      calculatePaymentSchedule: () => {
        const state = get()
        const { selectedModel, chassisCost, basePrice, optionsTotal, pioneerPackage, deposit } = state

        // Only calculate payment schedule for configurable models with pricing
        if (!selectedModel || selectedModel.availability !== 'configurable' || selectedModel.base_price === null) {
          set({
            paymentSchedule: {
              deposit: 0,
              firstPayment: 0,
              secondPayment: 0,
              finalPayment: 0,
              chassisWithVat: 0,
              buildWithVat: 0,
              buildBalanceMinusDeposit: 0
            }
          })
          return
        }

        // Calculate chassis with VAT
        const chassisWithVat = chassisCost * (1 + VAT_RATE)

        // Calculate build total with VAT
        let buildTotal = basePrice + optionsTotal
        if (pioneerPackage && selectedModel.pioneer_package_eligible) {
          buildTotal += PIONEER_PACKAGE.price
        }
        const buildWithVat = buildTotal * (1 + VAT_RATE)

        // Build balance minus deposit
        const buildBalanceMinusDeposit = buildWithVat - deposit

        // Payment per third
        const buildPaymentPerThird = buildBalanceMinusDeposit / 3

        // Payment schedule
        const paymentSchedule: PaymentSchedule = {
          deposit,
          firstPayment: buildPaymentPerThird + chassisWithVat,
          secondPayment: buildPaymentPerThird,
          finalPayment: buildPaymentPerThird,
          chassisWithVat,
          buildWithVat,
          buildBalanceMinusDeposit
        }

        set({ paymentSchedule })
      },

      // NEW: Load model specification from API
      loadModelSpecification: async (modelCode: string) => {
        try {
          set({ isLoading: true })

          const response = await fetch(`/api/ops/pricing/model-specs?model=${modelCode}`)

          if (!response.ok) {
            throw new Error(`Failed to load model specification: ${response.statusText}`)
          }

          const modelSpec: ModelSpecification = await response.json()

          set({
            modelSpecification: modelSpec,
            isLoading: false
          })

          // Trigger recalculation with new model specs
          get().recalculateAll()
        } catch (error) {
          console.error('Error loading model specification:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load model specification'
          })
        }
      },

      // NEW: Comprehensive recalculation using calculation engines
      recalculateAll: () => {
        const state = get()
        const { selectedModel, modelSpecification, selectedOptions, pioneerPackage, chassisExtensionPricePerFoot, availableOptions } = state

        // Only run advanced calculations if we have model specification
        if (!modelSpecification || !selectedModel) {
          // Fall back to basic calculation
          get().calculateTotals()
          return
        }

        // Auto-detect chassis extension price if not already set
        let extensionPrice = chassisExtensionPricePerFoot
        if (extensionPrice === 1000 && availableOptions.length > 0) {
          // Try to get actual price from available options
          extensionPrice = getChassisExtensionPricePerFoot(availableOptions)
          set({ chassisExtensionPricePerFoot: extensionPrice })
        }

        // Run comprehensive calculation from engines.ts
        const result = calculateConfiguration({
          modelSpec: modelSpecification,
          selectedOptions,
          pioneerPackageEnabled: pioneerPackage,
          pioneerPackageCost: PIONEER_PACKAGE.price,
          chassisExtensionPricePerFoot: extensionPrice,
          vatRate: VAT_RATE
        })

        // Update state with calculation results
        set({
          weightCalculation: result.weight,
          livingAreaCalculation: result.living_area,
          calculationWarnings: result.warnings,

          // Update pricing with auto-added chassis extension
          optionsTotal: result.pricing.options_total,
          buildSubtotal: result.pricing.build_subtotal + state.basePrice,
          totalExVat: result.pricing.total_ex_vat + state.basePrice + state.chassisCost,
          vatAmount: (result.pricing.total_ex_vat + state.basePrice + state.chassisCost) * VAT_RATE,
          totalIncVat: (result.pricing.total_ex_vat + state.basePrice + state.chassisCost) * (1 + VAT_RATE)
        })

        // Recalculate payment schedule with updated totals
        get().calculatePaymentSchedule()
      },

      // NEW: Set chassis extension price per foot
      setChassisExtensionPricePerFoot: (price: number) => {
        set({ chassisExtensionPricePerFoot: price })
        // Trigger recalculation as this affects living area costs
        get().recalculateAll()
      },

      // Reset the entire configuration
      resetConfiguration: () => {
        set({
          // Customer
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          agentName: '',

          // Vehicle
          selectedModel: null,
          basePrice: 0,
          chassisCost: 0,
          deposit: 5000,
          color: '',

          // Options
          pioneerPackage: false,
          pioneerHorseArea: null,
          selectedOptions: [],

          // Pricing
          optionsTotal: 0,
          buildSubtotal: 0,
          totalExVat: 0,
          vatAmount: 0,
          totalIncVat: 0,

          // Payment Schedule
          paymentSchedule: {
            deposit: 5000,
            firstPayment: 0,
            secondPayment: 0,
            finalPayment: 0,
            chassisWithVat: 0,
            buildWithVat: 0,
            buildBalanceMinusDeposit: 0
          },

          // Model Specifications & Advanced Calculations
          modelSpecification: null,
          weightCalculation: null,
          livingAreaCalculation: null,
          calculationWarnings: [],
          chassisExtensionPricePerFoot: 1000,

          // UI
          activeCategory: 'exterior',
          currentStep: 1,
          error: null
        })
      },

      // Get the current configuration as a data object
      getConfiguration: () => {
        const state = get()
        const { selectedModel } = state
        
        if (!selectedModel) {
          return null
        }

        const configuration: ConfigurationData = {
          // Customer
          customerName: state.customerName,
          customerEmail: state.customerEmail,
          customerPhone: state.customerPhone,
          agentName: state.agentName,
          
          // Vehicle
          model: selectedModel.slug,
          model_name: selectedModel.name,
          base_price: state.basePrice,
          chassisCost: selectedModel.availability === 'configurable' ? state.chassisCost : 0,
          deposit: selectedModel.availability === 'configurable' ? state.deposit : 0,
          color: state.color,
          
          // Options - only for configurable models
          pioneerPackage: selectedModel.pioneer_package_eligible ? state.pioneerPackage : false,
          pioneerHorseArea: (selectedModel.pioneer_package_eligible && state.pioneerPackage) ? state.pioneerHorseArea || undefined : undefined,
          selected_options: selectedModel.availability === 'configurable' ? state.selectedOptions : [],
          
          // Pricing - only calculate for configurable models
          options_total: selectedModel.availability === 'configurable' ? state.optionsTotal : 0,
          build_subtotal: selectedModel.availability === 'configurable' ? state.buildSubtotal : 0,
          total_ex_vat: selectedModel.availability === 'configurable' ? state.totalExVat : 0,
          vat_amount: selectedModel.availability === 'configurable' ? state.vatAmount : 0,
          total_inc_vat: selectedModel.availability === 'configurable' ? state.totalIncVat : 0,
          
          // Payment Schedule
          payment_schedule: state.paymentSchedule,
          
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        return configuration
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Set error state
      setError: (error: string | null) => {
        set({ error })
      }
    }),
    {
      name: 'jth-configurator',
      partialize: (state) => ({
        // Customer
        customerName: state.customerName,
        customerEmail: state.customerEmail,
        customerPhone: state.customerPhone,
        agentName: state.agentName,
        
        // Vehicle
        selectedModel: state.selectedModel,
        basePrice: state.basePrice,
        chassisCost: state.chassisCost,
        deposit: state.deposit,
        color: state.color,
        
        // Options
        pioneerPackage: state.pioneerPackage,
        pioneerHorseArea: state.pioneerHorseArea,
        selectedOptions: state.selectedOptions,
        
        // Current step
        currentStep: state.currentStep
      })
    }
  )
)