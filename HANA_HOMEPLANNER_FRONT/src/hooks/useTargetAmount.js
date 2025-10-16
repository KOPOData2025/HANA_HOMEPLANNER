import { useState, useCallback } from 'react'

export const useTargetAmount = () => {
  const [targetAmount, setTargetAmount] = useState('')

  const handleTargetAmountChange = useCallback((value) => {
    setTargetAmount(value)
  }, [])

  const calculateTargetAmountFromHouse = useCallback((house) => {
    if (house && house.supplyAmount && typeof house.supplyAmount === 'number') {
      const calculatedAmount = Math.round(house.supplyAmount * 0.1) // 분양가의 10%
      const roundedAmount = Math.round(calculatedAmount / 100) * 100 // 100만원 단위로 반올림
      setTargetAmount(roundedAmount.toString())
    }
  }, [])

  const resetTargetAmount = useCallback(() => {
    setTargetAmount('')
  }, [])

  const isValidTargetAmount = useCallback(() => {
    return targetAmount && !isNaN(parseInt(targetAmount)) && parseInt(targetAmount) > 0
  }, [targetAmount])

  const getFormattedTargetAmount = useCallback(() => {
    return parseInt(targetAmount || 0).toLocaleString()
  }, [targetAmount])

  return {
    targetAmount,
    handleTargetAmountChange,
    calculateTargetAmountFromHouse,
    resetTargetAmount,
    isValidTargetAmount,
    getFormattedTargetAmount
  }
}
