import React from 'react'
import { CreditCard } from "lucide-react"
import { accounts } from '@/data/accounts'

const WithdrawalAccountSelector = ({ 
  selectedAccount, 
  onAccountSelect 
}) => {
  return (
    <div>
      <label className="block text-lg font-semibold text-gray-800 mb-4">
        <CreditCard className="w-5 h-5 inline mr-2" />
        출금 계좌 선택
      </label>
      <div className="grid gap-3">
        {accounts.map((account) => (
          <label key={account.id} className="cursor-pointer">
            <input
              type="radio"
              name="withdrawalAccount"
              value={account.id}
              checked={selectedAccount === account.id}
              onChange={() => onAccountSelect(account.id)}
              className="sr-only"
            />
            <div className={`p-4 border-2 rounded-xl transition-all ${
              selectedAccount === account.id 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-800">{account.name}</div>
                  <div className="text-sm text-gray-500">{account.number}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">잔액</div>
                  <div className="font-semibold text-gray-800">{account.balance}</div>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default WithdrawalAccountSelector
