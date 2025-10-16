import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useSavingsSelection = () => {
  const [selectedSavingsType, setSelectedSavingsType] = useState("")
  const navigate = useNavigate()

  const handleSavingsSelect = useCallback((savingsId) => {
    setSelectedSavingsType(savingsId)
    // 적금 상품 선택 시 주소 선택 페이지로 네비게이션
    navigate(`/savings-address/${savingsId}`)
  }, [navigate])

  const resetSelection = useCallback(() => {
    setSelectedSavingsType("")
  }, [])

  const isProductSelected = useCallback((productId) => {
    return selectedSavingsType === productId
  }, [selectedSavingsType])

  return {
    selectedSavingsType,
    handleSavingsSelect,
    resetSelection,
    isProductSelected
  }
}
