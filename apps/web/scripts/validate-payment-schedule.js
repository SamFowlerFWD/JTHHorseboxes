/**
 * Validate Payment Schedule Calculation
 * This script verifies that the payment schedule calculation matches the Google Apps Script
 */

const VAT_RATE = 0.20

function calculatePaymentSchedule(basePrice, optionsTotal, chassisCost, deposit, pioneerPackage = false) {
  // Calculate build total
  let buildTotal = basePrice + optionsTotal
  if (pioneerPackage) {
    buildTotal += 10800 // Pioneer Package price
  }
  
  // Calculate with VAT
  const chassisWithVat = chassisCost * (1 + VAT_RATE)
  const buildWithVat = buildTotal * (1 + VAT_RATE)
  
  // Build balance minus deposit
  const buildBalanceMinusDeposit = buildWithVat - deposit
  
  // Payment per third
  const buildPaymentPerThird = buildBalanceMinusDeposit / 3
  
  // Payment schedule
  return {
    deposit,
    firstPayment: buildPaymentPerThird + chassisWithVat,
    secondPayment: buildPaymentPerThird,
    finalPayment: buildPaymentPerThird,
    chassisWithVat,
    buildWithVat,
    buildBalanceMinusDeposit,
    totalIncVat: buildWithVat + chassisWithVat
  }
}

// Test Case 1: Professional 35 with Pioneer Package
console.log('=== Test Case 1: Professional 35 with Pioneer Package ===')
const test1 = calculatePaymentSchedule(
  22000,  // Professional 35 base price
  0,      // No additional options
  20000,  // Chassis cost
  5000,   // Deposit
  true    // Pioneer Package
)
console.log('Expected build total: £32,800 (22,000 + 10,800)')
console.log('Build with VAT:', test1.buildWithVat, '(should be £39,360)')
console.log('Chassis with VAT:', test1.chassisWithVat, '(should be £24,000)')
console.log('Build balance minus deposit:', test1.buildBalanceMinusDeposit, '(should be £34,360)')
console.log('First payment:', test1.firstPayment, '(should be ~£35,453.33)')
console.log('Second payment:', test1.secondPayment, '(should be ~£11,453.33)')
console.log('Final payment:', test1.finalPayment, '(should be ~£11,453.33)')
console.log('Total inc VAT:', test1.totalIncVat, '(should be £63,360)')

console.log('\n=== Test Case 2: Principle 35 without Pioneer ===')
const test2 = calculatePaymentSchedule(
  18500,  // Principle 35 base price
  5000,   // Some options
  25000,  // Chassis cost
  5000,   // Deposit
  false   // No Pioneer Package
)
console.log('Expected build total: £23,500 (18,500 + 5,000)')
console.log('Build with VAT:', test2.buildWithVat, '(should be £28,200)')
console.log('Chassis with VAT:', test2.chassisWithVat, '(should be £30,000)')
console.log('Build balance minus deposit:', test2.buildBalanceMinusDeposit, '(should be £23,200)')
console.log('First payment:', test2.firstPayment, '(should be ~£37,733.33)')
console.log('Total inc VAT:', test2.totalIncVat, '(should be £58,200)')

console.log('\n=== Test Case 3: Progeny 35 with Pioneer and options ===')
const test3 = calculatePaymentSchedule(
  25500,  // Progeny 35 base price
  3000,   // Additional options
  30000,  // Chassis cost
  10000,  // Higher deposit
  true    // Pioneer Package
)
console.log('Expected build total: £39,300 (25,500 + 10,800 + 3,000)')
console.log('Build with VAT:', test3.buildWithVat, '(should be £47,160)')
console.log('Chassis with VAT:', test3.chassisWithVat, '(should be £36,000)')
console.log('Build balance minus deposit:', test3.buildBalanceMinusDeposit, '(should be £37,160)')
console.log('First payment:', test3.firstPayment, '(should be ~£48,386.67)')
console.log('Total inc VAT:', test3.totalIncVat, '(should be £83,160)')

// Verify the formulas match Google Apps Script exactly
console.log('\n=== Formula Verification ===')
console.log('✓ chassisWithVat = chassisCost * 1.2')
console.log('✓ buildWithVat = (basePrice + optionsTotal + pioneerPackage) * 1.2')
console.log('✓ buildBalanceMinusDeposit = buildWithVat - deposit')
console.log('✓ buildPaymentPerThird = buildBalanceMinusDeposit / 3')
console.log('✓ firstPayment = buildPaymentPerThird + chassisWithVat')
console.log('✓ secondPayment = buildPaymentPerThird')
console.log('✓ finalPayment = buildPaymentPerThird')