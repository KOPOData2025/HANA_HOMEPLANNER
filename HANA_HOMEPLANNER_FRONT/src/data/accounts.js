// 출금 계좌 목록 (예시)
export const accounts = [
  { 
    id: '1', 
    name: '하나은행 입출금통장', 
    number: '123-456789-01', 
    balance: '1,250,000원' 
  },
  { 
    id: '2', 
    name: '하나은행 자유적금', 
    number: '123-456789-02', 
    balance: '850,000원' 
  },
  { 
    id: '3', 
    name: '하나은행 정기예금', 
    number: '123-456789-03', 
    balance: '5,000,000원' 
  }
]

// 유틸리티 함수들
export const getAccountById = (id) => {
  return accounts.find(account => account.id === id)
}

export const getAccountsByType = (type) => {
  return accounts.filter(account => account.name.includes(type))
}

export const getTotalBalance = () => {
  return accounts.reduce((total, account) => {
    const balance = parseInt(account.balance.replace(/[^\d]/g, ''))
    return total + balance
  }, 0)
}
