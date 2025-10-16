import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const useSignup = (onComplete) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    userNm: "",
    email: "",
    password: "",
    passwordConfirm: "",
    zipcode: "",
    address: "",
    detailAddress: "",
    sido: "",
    sigungu: "",
    eupmyeondong: "",
    roadNm: "",
    lat: null,
    lon: null
  })
  
  const [errors, setErrors] = useState({})

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // 실시간 유효성 검사
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }))
    }
  }, [errors])

  // 주소 검색 기능
  const openAddressSearch = useCallback(() => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        console.log("다음 주소 API 응답:", data)
        
        // 선택한 주소 정보를 폼에 입력
        setFormData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
          sido: data.sido,
          sigungu: data.sigungu,
          eupmyeondong: data.bname || data.bname1 || data.bname2 || data.roadname || "",
          roadNm: data.roadAddress || data.jibunAddress,
          // 기본 좌표 (서울시청) - 실제 서비스에서는 좌표 변환 API 사용 권장
          lat: 37.5665,
          lon: 126.9780
        }))
        
        // 상세주소 입력란으로 포커스
        document.getElementById("detailAddress").focus()
      }
    }).open()
  }, [])

  // 폼 유효성 검사
  const validateForm = useCallback(() => {
    const newErrors = {}

    // 이름 검증
    if (!formData.userNm) {
      newErrors.userNm = "이름을 입력해주세요"
    } else if (formData.userNm.trim().length < 2) {
      newErrors.userNm = "이름은 2자 이상 입력해주세요"
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요"
    }



    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요"
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상 입력해주세요"
    }

    // 비밀번호 확인 검증
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요"
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다"
    }

    // 주소 검증
    if (!formData.address) {
      newErrors.address = "주소를 입력해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      // FormData에서 inviteToken 추출
      const formElement = e.target;
      const formDataObj = new FormData(formElement);
      const inviteToken = formDataObj.get('inviteToken');
      
      // 첫 번째 단계에서는 API 호출 없이 데이터만 저장
      const basicData = {
        userNm: formData.userNm,
        email: formData.email,
        password: formData.password,
        sido: formData.sido,
        sigungu: formData.sigungu,
        eupmyeondong: formData.eupmyeondong,
        roadNm: formData.roadNm + (formData.detailAddress ? ` ${formData.detailAddress}` : ""),
        address: formData.address,
        detailAddress: formData.detailAddress,
        lat: formData.lat || 37.5665,
        lon: formData.lon || 126.9780,
        inviteToken: inviteToken // 초대 토큰 추가
      }
      
      console.log('초대 토큰:', inviteToken);

      console.log("기본 회원가입 데이터 저장:", basicData)

      toast.success("기본 정보가 저장되었습니다! 📝", {
        duration: 2000,
      })

      // onComplete 콜백이 있으면 다음 단계로, 없으면 로그인 페이지로 이동
      if (onComplete) {
        onComplete(basicData)
      } else {
        navigate("/login")
      }
      
    } catch (error) {
      console.error("회원가입 오류:", error)
      const errorMessage = error.message || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateForm, navigate, onComplete])



  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword])

  const togglePasswordConfirmVisibility = useCallback(() => {
    setShowPasswordConfirm(!showPasswordConfirm)
  }, [showPasswordConfirm])

  const resetForm = useCallback(() => {
    setFormData({
      userNm: "",
      email: "",
      password: "",
      passwordConfirm: "",
      zipcode: "",
      address: "",
      detailAddress: "",
      sido: "",
      sigungu: "",
      eupmyeondong: "",
      roadNm: "",
      lat: null,
      lon: null
    })
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    isLoading,
    showPassword,
    showPasswordConfirm,
    handleInputChange,
    handleSubmit,
    openAddressSearch,
    togglePasswordVisibility,
    togglePasswordConfirmVisibility,
    resetForm
  }
}
