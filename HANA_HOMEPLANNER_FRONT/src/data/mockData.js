// 청약 데이터 목업
export const mockSubscriptionData = {
  "강남구": [
    {
      id: 1,
      name: "래미안 강남 더 클래스",
      region: "서울",
      address: "서울특별시 강남구 도곡동 123-45",
      households: 856,
      applicationStart: "24/10/15",
      applicationEnd: "24/10/18",
      winnerAnnouncement: "24/10/25",
      contractStart: "24/11/05",
      website: "https://remiangangnam.com",
      moveInDate: "Dec-26",
      status: "완료",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2024000123"
    },
    {
      id: 2,
      name: "아크로 강남타워",
      region: "서울",
      address: "서울특별시 강남구 삼성동 567-89",
      households: 624,
      applicationStart: "24/09/20",
      applicationEnd: "24/09/23",
      winnerAnnouncement: "24/09/30",
      contractStart: "24/10/10",
      website: "https://acrogangnam.com",
      moveInDate: "Nov-26",
      status: "완료",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2024000124"
    }
  ],
  "서초구": [
    {
      id: 3,
      name: "힐스테이트 서초 센트럴",
      region: "서울",
      address: "서울특별시 서초구 반포동 234-56",
      households: 1028,
      applicationStart: "24/11/08",
      applicationEnd: "24/11/18",
      winnerAnnouncement: "24/11/27",
      contractStart: "24/12/08",
      website: "https://hillstateseocho.com",
      moveInDate: "Jan-28",
      status: "진행중",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2024000654"
    },
    {
      id: 4,
      name: "자이 서초 프리미엄",
      region: "서울",
      address: "서울특별시 서초구 서초동 345-67",
      households: 743,
      applicationStart: "24/10/05",
      applicationEnd: "24/10/08",
      winnerAnnouncement: "24/10/15",
      contractStart: "24/10/25",
      website: "https://xiseochopremium.com",
      moveInDate: "Dec-26",
      status: "완료",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2024000234"
    }
  ]
};

// 향후 청약 예정 데이터 목업
export const upcomingSubscriptionData = {
  searchPeriod: {
    start: "2025-06-30",
    end: "2025-08-05"
  },
  subscriptionPeriod: {
    start: "2025-08-05", 
    end: "2025-09-05"
  },
  apartments: [
    {
      id: 1,
      houseType: "민영",
      name: "김해 삼계 동일스위트",
      applicationPeriod: "2025-08-11 ~ 2025-08-13",
      region: "경남",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000266&pblancNo=2025000266"
    },
    {
      id: 2,
      houseType: "국민",
      name: "화성동탄2지구 C-14블록 6년 분양전환공공임대주택(본청약)",
      applicationPeriod: "2025-08-11 ~ 2025-08-19",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000350&pblancNo=2025000350"
    },
    {
      id: 3,
      houseType: "민영",
      name: "써밋 리미티드 남천",
      applicationPeriod: "2025-08-11 ~ 2025-08-13",
      region: "부산",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000311&pblancNo=2025000311"
    },
    {
      id: 4,
      houseType: "국민",
      name: "남양주진접2 지구 A-4블록 신혼희망타운(공공분양) 입주자모집(본청약)",
      applicationPeriod: "2025-08-11 ~ 2025-08-14",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025820011&pblancNo=2025820011"
    },
    {
      id: 5,
      houseType: "국민",
      name: "남양주진접2지구 A-1블록 공공분양주택 입주자모집(본청약)",
      applicationPeriod: "2025-08-11 ~ 2025-08-19",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000316&pblancNo=2025000316"
    },
    {
      id: 6,
      houseType: "국민",
      name: "구리갈매역세권 A-1블록 신혼희망타운(공공분양)(본청약)",
      applicationPeriod: "2025-08-11 ~ 2025-08-14",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025820012&pblancNo=2025820012"
    },
    {
      id: 7,
      houseType: "국민",
      name: "왕숙 푸르지오 더 퍼스트 2단지 공공분양주택(본청약)",
      applicationPeriod: "2025-08-08 ~ 2025-08-14",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000325&pblancNo=2025000325"
    },
    {
      id: 8,
      houseType: "국민",
      name: "왕숙 푸르지오 더 퍼스트 1단지 공공분양주택(본청약)",
      applicationPeriod: "2025-08-08 ~ 2025-08-14",
      region: "경기",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000324&pblancNo=2025000324"
    },
    {
      id: 9,
      houseType: "민영",
      name: "제기동역 아이파크",
      applicationPeriod: "2025-08-05 ~ 2025-08-07",
      region: "서울",
      url: "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do?houseManageNo=2025000270&pblancNo=2025000270"
    }
  ]
};

// 지역별 목업 데이터
export const mockAreaData = {
  "서울특별시": {
    "강남구": {
      "역삼동": {
        "84": {
          estimatedPrice: "8억 7,000만원",
          averageTradePrice: "11.2억원",
          averageLeasePrice: "8.5억원",
          priceChange: "+1.8%",
          leaseChange: "-0.5%",
          recentTransactions: [
            { address: "서울 강남구 역삼동 123-45", price: "12억 5,000만원" },
            { address: "서울 강남구 역삼동 234-56", price: "11억 8,000만원" },
            { address: "서울 강남구 역삼동 345-67", price: "10억 9,000만원" }
          ]
        },
        "60미만": {
          estimatedPrice: "6억 2,000만원",
          averageTradePrice: "8.1억원",
          averageLeasePrice: "6.2억원",
          priceChange: "+2.1%",
          leaseChange: "-0.3%",
          recentTransactions: [
            { address: "서울 강남구 역삼동 123-45", price: "8억 2,000만원" },
            { address: "서울 강남구 역삼동 234-56", price: "7억 9,000만원" },
            { address: "서울 강남구 역삼동 345-67", price: "8억 1,000만원" }
          ]
        }
      },
      "논현동": {
        "84": {
          estimatedPrice: "9억 2,000만원",
          averageTradePrice: "12.5억원",
          averageLeasePrice: "9.1억원",
          priceChange: "+2.3%",
          leaseChange: "-0.2%",
          recentTransactions: [
            { address: "서울 강남구 논현동 111-22", price: "13억 1,000만원" },
            { address: "서울 강남구 논현동 222-33", price: "12억 8,000만원" },
            { address: "서울 강남구 논현동 333-44", price: "12억 2,000만원" }
          ]
        }
      }
    },
    "서초구": {
      "반포동": {
        "84": {
          estimatedPrice: "10억 1,000만원",
          averageTradePrice: "13.8억원",
          averageLeasePrice: "10.2억원",
          priceChange: "+3.1%",
          leaseChange: "+0.5%",
          recentTransactions: [
            { address: "서울 서초구 반포동 456-78", price: "15억 8,000만원" },
            { address: "서울 서초구 반포동 567-89", price: "14억 2,000만원" },
            { address: "서울 서초구 반포동 678-90", price: "13억 5,000만원" }
          ]
        }
      }
    }
  }
};
