import { useState } from 'react';
import toast from 'react-hot-toast';

export const useLoanCapacity = () => {
  // 대출 가능액 평가 모달 관련 상태
  const [isLoanCapacityModalOpen, setIsLoanCapacityModalOpen] = useState(false);
  const [propertyPrice, setPropertyPrice] = useState("");
  const [region, setRegion] = useState("seoul"); // seoul, non-seoul
  const [housingStatus, setHousingStatus] = useState("none"); // none, single, multiple
  const [ltvRate, setLtvRate] = useState("70");
  const [annualIncome, setAnnualIncome] = useState("");
  const [dsrRatio, setDsrRatio] = useState("40");
  const [loanInterestRate, setLoanInterestRate] = useState("");
  const [loanTermYears, setLoanTermYears] = useState("30");
  const [existingLoanRepayment, setExistingLoanRepayment] = useState("");
  const [loanCapacityResult, setLoanCapacityResult] = useState(null);

  // 🔥 새로 추가된 상태들
  const [borrowerType, setBorrowerType] = useState("general"); // general, first-time, newlywed, youth
  const [creditGrade, setCreditGrade] = useState("3"); // 1-10등급
  const [downPaymentRatio, setDownPaymentRatio] = useState("20"); // 보증금 비율
  const [collateralRatio, setCollateralRatio] = useState("100"); // 담보인정 비율

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePropertyPriceChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(value)) {
      setPropertyPrice(formatNumber(value));
    }
  };

  const handleAnnualIncomeChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(value)) {
      setAnnualIncome(formatNumber(value));
    }
  };

  const handleExistingLoanChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(value)) {
      setExistingLoanRepayment(formatNumber(value));
    }
  };

  const calculateLoanCapacity = () => {
    const propertyValue = parseFloat(propertyPrice.replace(/,/g, "")) * 10000; // 만원 → 원
    const income = parseFloat(annualIncome.replace(/,/g, "")) * 10000; // 만원 → 원
    const dsr = parseFloat(dsrRatio) / 100;
    const baseRate = parseFloat(loanInterestRate) / 100;
    const term = parseInt(loanTermYears);
    const existingPayment = parseFloat(existingLoanRepayment.replace(/,/g, "") || "0") * 10000; // 만원 → 원
    const creditGradeNum = parseInt(creditGrade);
    const downPayment = parseFloat(downPaymentRatio) / 100;
    const collateralRecognition = parseFloat(collateralRatio) / 100;

    if (!propertyValue || !income || !baseRate || !term) {
      toast.error("모든 필수 항목을 입력해주세요. ⚠️");
      return;
    }

    // 🔥 1. 다주택자 수도권 LTV = 0% 처리
    let adjustedLtv = parseFloat(ltvRate) / 100;
    let ltvWarnings = [];
    
    if (region === "seoul" && housingStatus === "multiple") {
      // 정부 방침에 따른 다주택자 LTV = 0% (대출 불가) 강화
      adjustedLtv = 0;
      ltvWarnings.push("⚠️ 수도권 다주택자는 LTV 0% 적용으로 대출이 불가능할 수 있습니다.");
    } else if (region === "seoul") {
      // 수도권 규제 적용
      if (housingStatus === "single") {
        adjustedLtv = Math.min(adjustedLtv, 0.6); // 1주택자 60% 제한
      }
      // 무주택자는 기본 LTV 적용
    }

    // 🔥 2. 생애최초·신혼부부·청년 특례 조건 적용
    if (housingStatus === "none") { // 무주택자만 특례 적용 가능
      if (borrowerType === "first-time") {
        adjustedLtv = Math.min(adjustedLtv + 0.1, 0.8); // 생애최초 +10%p (최대 80%)
        ltvWarnings.push("✅ 생애최초 특례 적용: LTV +10%p 우대");
      } else if (borrowerType === "newlywed") {
        adjustedLtv = Math.min(adjustedLtv + 0.15, 0.85); // 신혼부부 +15%p (최대 85%)
        ltvWarnings.push("✅ 신혼부부 특례 적용: LTV +15%p 우대");
      } else if (borrowerType === "youth") {
        adjustedLtv = Math.min(adjustedLtv + 0.2, 0.9); // 청년 +20%p (최대 90%)
        ltvWarnings.push("✅ 청년층 특례 적용: LTV +20%p 우대");
      }
    }

    // 🔥 3. 신용등급에 따른 LTV 조정
    if (creditGradeNum >= 7) {
      adjustedLtv = adjustedLtv * 0.9; // 7등급 이하 10% 감소
      ltvWarnings.push("⚠️ 신용등급 7등급 이하로 LTV 10% 감소 적용");
    } else if (creditGradeNum >= 5) {
      adjustedLtv = adjustedLtv * 0.95; // 5-6등급 5% 감소
      ltvWarnings.push("⚠️ 신용등급 5-6등급으로 LTV 5% 감소 적용");
    }

    // 🔥 4. 담보인정 평가 비율 적용
    const effectivePropertyValue = propertyValue * collateralRecognition;
    let ltvAmount = effectivePropertyValue * adjustedLtv;
    
    // 수도권 규제지역 최대 6억원 한도 적용
    if (region === "seoul") {
      ltvAmount = Math.min(ltvAmount, 600000000); // 6억원
    }

    // 🔥 5. 스트레스 금리 지역 차등화 (수도권 +1.5%p, 지방 +0.75%p)
    const stressRateAdd = region === "seoul" ? 0.015 : 0.0075;
    const stressRate = baseRate + stressRateAdd;
    
    // 🔥 6. 보증금 비율에 따른 DSR 조정
    let adjustedDsr = dsr;
    if (downPayment < 0.2) { // 보증금 20% 미만 시 DSR 5%p 감소
      adjustedDsr = Math.max(dsr - 0.05, 0.3); // 최소 30%
      ltvWarnings.push("⚠️ 보증금 20% 미만으로 DSR 5%p 감소 적용");
    }
    
    // 7. DSR 기준 대출 가능액 (스트레스 금리 적용)
    const availableAnnualPayment = income * adjustedDsr - existingPayment;
    const availableMonthlyPayment = availableAnnualPayment / 12;
    
    if (availableMonthlyPayment <= 0) {
      toast.error("현재 소득과 기존 대출로는 추가 대출이 어려울 수 있습니다. 💸");
      return;
    }

    // 스트레스 금리로 원리금균등상환 공식 역산
    const monthlyStressRate = stressRate / 12;
    const totalMonths = term * 12;
    const dsrAmount = availableMonthlyPayment * 
      ((Math.pow(1 + monthlyStressRate, totalMonths) - 1) / 
       (monthlyStressRate * Math.pow(1 + monthlyStressRate, totalMonths)));

    // 8. 최종 대출 가능액 (둘 중 작은 값)
    const maxLoanAmount = Math.min(ltvAmount, dsrAmount);

    // 9. 만기 제한 확인
    let maturityWarning = "";
    if (region === "seoul" && term > 30) {
      maturityWarning = "수도권 규제지역은 최대 30년까지 가능합니다.";
    }

    setLoanCapacityResult({
      ltvAmount: Math.round(ltvAmount / 10000), // 원 → 만원
      dsrAmount: Math.round(dsrAmount / 10000), // 원 → 만원
      maxLoanAmount: Math.round(maxLoanAmount / 10000), // 원 → 만원
      availableMonthlyPayment: Math.round(availableMonthlyPayment / 10000), // 원 → 만원
      adjustedLtv: adjustedLtv * 100, // 조정된 LTV (%)
      originalLtv: parseFloat(ltvRate), // 원래 희망 LTV (%)
      stressRate: stressRate * 100, // 스트레스 금리 (%)
      isSeoulRegulated: region === "seoul",
      maturityWarning: maturityWarning,
      residencyRequirement: region === "seoul" ? "주택담보대출 시 6개월 전입 의무가 있습니다." : "",
      ltvWarnings: ltvWarnings,
      creditGrade: creditGradeNum,
      downPaymentRatio: downPayment * 100,
      collateralRatio: collateralRecognition * 100,
      borrowerTypeText: getBorrowerTypeText(borrowerType),
    });
  };

  const getBorrowerTypeText = (type) => {
    switch(type) {
      case "first-time": return "생애최초";
      case "newlywed": return "신혼부부";
      case "youth": return "청년층";
      default: return "일반";
    }
  };

  const resetLoanCapacityModal = () => {
    setPropertyPrice("");
    setRegion("seoul");
    setHousingStatus("none");
    setLtvRate("70");
    setAnnualIncome("");
    setDsrRatio("40");
    setLoanInterestRate("");
    setLoanTermYears("30");
    setExistingLoanRepayment("");
    // 🔥 새로 추가된 상태들 초기화
    setBorrowerType("general");
    setCreditGrade("3");
    setDownPaymentRatio("20");
    setCollateralRatio("100");
    setLoanCapacityResult(null);
  };

  const closeLoanCapacityModal = () => {
    setIsLoanCapacityModalOpen(false);
    resetLoanCapacityModal();
  };

  return {
    isLoanCapacityModalOpen,
    setIsLoanCapacityModalOpen,
    propertyPrice,
    region,
    setRegion,
    housingStatus,
    setHousingStatus,
    ltvRate,
    setLtvRate,
    annualIncome,
    dsrRatio,
    setDsrRatio,
    loanInterestRate,
    setLoanInterestRate,
    loanTermYears,
    setLoanTermYears,
    existingLoanRepayment,
    loanCapacityResult,
    borrowerType,
    setBorrowerType,
    creditGrade,
    setCreditGrade,
    downPaymentRatio,
    setDownPaymentRatio,
    collateralRatio,
    setCollateralRatio,
    handlePropertyPriceChange,
    handleAnnualIncomeChange,
    handleExistingLoanChange,
    calculateLoanCapacity,
    closeLoanCapacityModal,
    resetLoanCapacityModal
  };
};
