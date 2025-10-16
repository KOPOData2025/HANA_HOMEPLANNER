import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 적금 상품 상세 정보 조회 API 호출
 * @param {string} productId - 상품 ID (예: PROD009)
 * @returns {Promise<Object>} 적금 상품 상세 정보
 */
export const getSavingsProductDetail = async (productId) => {
  try {
    console.log('💰 적금 상품 상세 정보 조회 API 요청:', {
      url: `${API_BASE_URL}/api/financial-products/${productId}/detail`,
      productId: productId
    });

    const response = await apiClient.get(`${API_BASE_URL}/api/financial-products/${productId}/detail`);

    console.log('💰 적금 상품 상세 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('💰 적금 상품 상세 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💰 적금 상품 상세 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error(`❌ 적금 상품 상세 정보 조회 오류 (${productId}):`, error);
    throw error;
  }
};

/**
 * 대출 상품 상세 정보 조회 API 호출
 * @param {string} productId - 상품 ID (예: PROD015)
 * @returns {Promise<Object>} 대출 상품 상세 정보
 */
export const getLoanProductDetail = async (productId) => {
  try {
    console.log('🏦 대출 상품 상세 정보 조회 API 요청:', {
      url: `${API_BASE_URL}/api/financial-products/${productId}/detail`,
      productId: productId
    });

    const response = await apiClient.get(`${API_BASE_URL}/api/financial-products/${productId}/detail`);

    console.log('🏦 대출 상품 상세 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏦 대출 상품 상세 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🏦 대출 상품 상세 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error(`❌ 대출 상품 상세 정보 조회 오류 (${productId}):`, error);
    throw error;
  }
};

/**
 * 상품 타입에 따라 적절한 상세 조회 함수 호출
 * @param {string} productId - 상품 ID
 * @param {string} productType - 상품 타입 (SAVING, LOAN)
 * @returns {Promise<Object>} 상품 상세 정보
 */
export const getProductDetail = async (productId, productType) => {
  try {
    console.log('🔍 상품 상세 정보 조회 시작:', { productId, productType });
    
    if (productType === 'SAVING' || productType === 'savings' || productType === 'JOINT_SAVING') {
      return await getSavingsProductDetail(productId);
    } else if (productType === 'LOAN' || productType === 'loan' || productType === 'JOINT_LOAN') {
      return await getLoanProductDetail(productId);
    } else {
      throw new Error(`지원하지 않는 상품 타입입니다: ${productType}`);
    }
  } catch (error) {
    console.error(`❌ 상품 상세 정보 조회 오류 (${productId}, ${productType}):`, error);
    throw error;
  }
};

/**
 * 포트폴리오 플랜의 금융상품 상세정보를 병렬로 조회
 * @param {string} savingsId - 적금 상품 ID
 * @param {string} loanId - 대출 상품 ID
 * @returns {Promise<Object>} 금융상품 상세정보 객체
 */
export const getPortfolioProductDetails = async (savingsId, loanId) => {
  try {
    console.log('🔍 포트폴리오 금융상품 상세정보 조회 시작:', { savingsId, loanId });

    const promises = [];
    
    // 적금 상품 상세정보 조회
    if (savingsId) {
      promises.push(
        getSavingsProductDetail(savingsId)
          .then(response => ({ type: 'savings', data: response }))
          .catch(error => {
            console.error(`❌ 적금 상품 상세정보 조회 실패 (${savingsId}):`, error);
            return { type: 'savings', data: null, error: error.message };
          })
      );
    }

    // 대출 상품 상세정보 조회
    if (loanId) {
      promises.push(
        getLoanProductDetail(loanId)
          .then(response => ({ type: 'loan', data: response }))
          .catch(error => {
            console.error(`❌ 대출 상품 상세정보 조회 실패 (${loanId}):`, error);
            return { type: 'loan', data: null, error: error.message };
          })
      );
    }

    // 병렬로 조회
    const results = await Promise.all(promises);
    
    // 결과 정리
    const productDetails = {
      savings: null,
      loan: null,
      errors: []
    };

    results.forEach(result => {
      if (result.type === 'savings') {
        productDetails.savings = result.data;
        if (result.error) {
          productDetails.errors.push(`적금상품(${savingsId}): ${result.error}`);
        }
      } else if (result.type === 'loan') {
        productDetails.loan = result.data;
        if (result.error) {
          productDetails.errors.push(`대출상품(${loanId}): ${result.error}`);
        }
      }
    });

    console.log('✅ 포트폴리오 금융상품 상세정보 조회 완료:', productDetails);
    return productDetails;
  } catch (error) {
    console.error('❌ 포트폴리오 금융상품 상세정보 조회 오류:', error);
    throw error;
  }
};
