import { useState } from 'react';
import toast from 'react-hot-toast';

export const useLoanSimulation = () => {
  const [loanType, setLoanType] = useState("home");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPeriod, setLoanPeriod] = useState("20");
  const [interestRate, setInterestRate] = useState("");
  const [repaymentType, setRepaymentType] = useState("equal");
  const [simulationResult, setSimulationResult] = useState(null);

  const loanTypes = [
    {
      id: "home",
      name: "주택담보대출",
      icon: "Home",
      rate: "3.5~5.5%",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      activeColor: "bg-blue-100 border-blue-400",
    },
    {
      id: "credit",
      name: "신용대출",
      icon: "CreditCard",
      rate: "4.5~15.0%",
      color: "bg-green-50 border-green-200 text-green-700",
      activeColor: "bg-green-100 border-green-400",
    },
    {
      id: "business",
      name: "사업자대출",
      icon: "Building",
      rate: "3.0~8.0%",
      color: "bg-purple-50 border-purple-200 text-purple-700",
      activeColor: "bg-purple-100 border-purple-400",
    },
  ];

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount.replace(/,/g, ""));
    const annualRate = parseFloat(interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = parseInt(loanPeriod) * 12;

    if (!principal || !annualRate || !totalMonths) {
      toast.error("모든 필드를 올바르게 입력해주세요. ⚠️");
      return;
    }

    let monthlyPayment;
    let totalInterest;

    if (repaymentType === "equal") {
      // 원리금균등상환
      monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
      totalInterest = monthlyPayment * totalMonths - principal;
    } else {
      // 원금균등상환
      const principalPayment = principal / totalMonths;
      monthlyPayment = principalPayment + principal * monthlyRate;
      totalInterest = (principal * monthlyRate * (totalMonths + 1)) / 2;
    }

    setSimulationResult({
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(principal + totalInterest),
      principal: principal,
    });
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(value)) {
      setLoanAmount(formatNumber(value));
    }
  };

  return {
    loanType,
    setLoanType,
    loanAmount,
    loanPeriod,
    setLoanPeriod,
    interestRate,
    setInterestRate,
    repaymentType,
    setRepaymentType,
    simulationResult,
    loanTypes,
    calculateLoan,
    formatNumber,
    handleAmountChange
  };
};
