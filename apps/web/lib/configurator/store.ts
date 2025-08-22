// Zustand Store for Configurator State Management

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ConfigurationData, 
  SelectedOption, 
  Model,
  LeadFormData,
  PricingOption,
  PaymentSchedule 
} from './types'
import { PIONEER_PACKAGE } from './types'

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
      setModel: (model: Model) => {
        set({ 
          selectedModel: model,
          basePrice: model.base_price,
          selectedOptions: [],
          pioneerPackage: false,
          pioneerHorseArea: null,
          error: null
        })
        get().calculateTotals()
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
        
        set({ 
          pioneerPackage: enabled,
          pioneerHorseArea: enabled ? (horseArea || null) : null
        })
        
        if (enabled) {
          // For Progeny model, auto-select 3ft extension
          if (selectedModel.name === 'Progeny 35') {
            set({ pioneerHorseArea: '3ft' })
          }
          
          // Auto-select included options
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
        
        get().calculateTotals()
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
          // Add new option
          const newOption: SelectedOption = {
            id: option.id,
            name: option.name,
            price: option.price,
            quantity,
            category: option.category,
            subcategory: option.subcategory,
            sku: option.sku,
            vat_rate: option.vat_rate
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
        
        get().calculateTotals()
      },

      // Remove an option from the configuration
      removeOption: (optionId: string) => {
        const currentOptions = get().selectedOptions
        set({ 
          selectedOptions: currentOptions.filter(o => o.id !== optionId),
          error: null
        })
        get().calculateTotals()
      },

      // Update option quantity
      updateOptionQuantity: (optionId: string, quantity: number) => {
        const currentOptions = get().selectedOptions
        const updatedOptions = currentOptions.map(option => 
          option.id === optionId ? { ...option, quantity } : option
        )
        set({ selectedOptions: updatedOptions })
        get().calculateTotals()
      },

      // Set available options from database
      setAvailableOptions: (options: PricingOption[]) => {
        set({ availableOptions: options })
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

        // Calculate options total (including quantities)
        let optionsTotal = selectedOptions.reduce((sum, option) => 
          sum + (option.price * option.quantity), 0
        )
        
        // Add Pioneer Package if selected
        if (pioneerPackage) {
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
        const { chassisCost, basePrice, optionsTotal, pioneerPackage, deposit } = state
        
        // Calculate chassis with VAT
        const chassisWithVat = chassisCost * (1 + VAT_RATE)
        
        // Calculate build total with VAT
        let buildTotal = basePrice + optionsTotal
        if (pioneerPackage) {
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
          chassisCost: state.chassisCost,
          deposit: state.deposit,
          color: state.color,
          
          // Options
          pioneerPackage: state.pioneerPackage,
          pioneerHorseArea: state.pioneerHorseArea || undefined,
          selected_options: state.selectedOptions,
          
          // Pricing
          options_total: state.optionsTotal,
          build_subtotal: state.buildSubtotal,
          total_ex_vat: state.totalExVat,
          vat_amount: state.vatAmount,
          total_inc_vat: state.totalIncVat,
          
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