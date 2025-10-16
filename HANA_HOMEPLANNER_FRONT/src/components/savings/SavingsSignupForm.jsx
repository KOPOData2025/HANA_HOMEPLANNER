import React from 'react'
import WithdrawalAccountSelector from './WithdrawalAccountSelector'
import MonthlyAmountInput from './MonthlyAmountInput'
import SavingsPeriodSelector from './SavingsPeriodSelector'
import PersonalInfoInput from './PersonalInfoInput'

const SavingsSignupForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  currentProduct 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">가입 정보 입력</h2>

      <div className="space-y-8">
        {/* 출금 계좌 선택 */}
        <WithdrawalAccountSelector
          selectedAccount={formData.withdrawalAccount}
          onAccountSelect={(accountId) => onInputChange('withdrawalAccount', accountId)}
        />

        {/* 월 납입금액 */}
        <MonthlyAmountInput
          monthlyAmount={formData.monthlyAmount}
          onAmountChange={(amount) => onInputChange('monthlyAmount', amount)}
          minAmount={currentProduct?.minAmount}
          maxAmount={currentProduct?.maxAmount}
        />

        {/* 저축 기간 */}
        <SavingsPeriodSelector
          selectedPeriod={formData.period}
          onPeriodChange={(period) => onInputChange('period', period)}
          periods={currentProduct?.periods || []}
        />

        {/* 개인정보 입력 */}
        <PersonalInfoInput
          formData={formData}
          onInputChange={onInputChange}
        />

        {/* 가입 버튼 */}
        <div className="pt-8 border-t">
          <button
            onClick={onSubmit}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg"
          >
            적금 가입 신청하기
          </button>
          <p className="text-sm text-gray-500 text-center mt-4">
            가입 신청 후 영업일 기준 1~2일 내 승인 처리됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SavingsSignupForm
