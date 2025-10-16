import { useState, useCallback } from 'react'

export const useRegionSelection = () => {
  const [selectedSido, setSelectedSido] = useState('')
  const [selectedSigungu, setSelectedSigungu] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [openDropdowns, setOpenDropdowns] = useState({
    sido: false,
    sigungu: false,
    neighborhood: false
  })

  const handleSidoSelect = useCallback((sidoId, regionData) => {
    if (sidoId && regionData[sidoId]) {
      setSelectedSido(sidoId)
      setSelectedSigungu('')
      setSelectedNeighborhood('')
      setOpenDropdowns(prev => ({ ...prev, sido: false }))
    }
  }, [])

  const handleSigunguSelect = useCallback((sigunguId, regionData) => {
    if (sigunguId && selectedSido && regionData[selectedSido]?.districts?.[sigunguId]) {
      setSelectedSigungu(sigunguId)
      setSelectedNeighborhood('')
      setOpenDropdowns(prev => ({ ...prev, sigungu: false }))
    }
  }, [selectedSido])

  const handleNeighborhoodSelect = useCallback((neighborhoodId, regionData) => {
    if (neighborhoodId && selectedSido && selectedSigungu && 
        regionData[selectedSido]?.districts?.[selectedSigungu]?.neighborhoods) {
      setSelectedNeighborhood(neighborhoodId)
      setOpenDropdowns(prev => ({ ...prev, neighborhood: false }))
    }
  }, [selectedSido, selectedSigungu])

  const toggleDropdown = useCallback((dropdownType) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownType]: !prev[dropdownType]
    }))
  }, [])

  const resetSelection = useCallback(() => {
    setSelectedSido('')
    setSelectedSigungu('')
    setSelectedNeighborhood('')
    setOpenDropdowns({
      sido: false,
      sigungu: false,
      neighborhood: false
    })
  }, [])

  const isSelectionComplete = useCallback(() => {
    return selectedSido && selectedSigungu && selectedNeighborhood
  }, [selectedSido, selectedSigungu, selectedNeighborhood])

  return {
    selectedSido,
    selectedSigungu,
    selectedNeighborhood,
    openDropdowns,
    handleSidoSelect,
    handleSigunguSelect,
    handleNeighborhoodSelect,
    toggleDropdown,
    resetSelection,
    isSelectionComplete
  }
}
