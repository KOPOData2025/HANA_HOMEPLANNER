import { apiClient } from '@/lib/apiClient';
import { API_BASE_URL } from '@/config/api';

/**
 * 공동 적금 상품 목록 조회 API 호출
 * @returns {Promise} API 응답
 */
export const getJointSavingsProducts = async () => {
  try {
    console.log('🔍 공동 적금 상품 목록 조회 API 요청:', {
      url: `${API_BASE_URL}/api/financial-products/type/JOINT_SAVING`
    });

    const response = await fetch(`${API_BASE_URL}/api/financial-products/type/JOINT_SAVING`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 공동 적금 상품 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 공동 적금 상품 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 공동 적금 상품 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 공동 적금 상품 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 공동 대출 상품 목록 조회 API 호출
 * @returns {Promise} API 응답
 */
export const getJointLoanProducts = async () => {
  try {
    console.log('🔍 공동 대출 상품 목록 조회 API 요청:', {
      url: `${API_BASE_URL}/api/financial-products/type/JOINT_LOAN`
    });

    const response = await fetch(`${API_BASE_URL}/api/financial-products/type/JOINT_LOAN`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 공동 대출 상품 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 공동 대출 상품 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 공동 대출 상품 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error('❌ 공동 대출 상품 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 적금 상품 목록 조회 API 호출 (일반 적금 + 공동 적금)
 * @returns {Promise} API 응답
 */
export const getSavingsProducts = async () => {
  try {
    console.log('🔍 적금 상품 목록 조회 시작 (일반 적금 + 공동 적금)');

    // 일반 적금과 공동 적금을 병렬로 조회
    const [regularSavingsResponse, jointSavingsResponse] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/financial-products/type/SAVING`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }),
      fetch(`${API_BASE_URL}/api/financial-products/type/JOINT_SAVING`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    ]);

    const allProducts = [];
    let hasError = false;
    let errorMessage = '';

    // 일반 적금 처리
    if (regularSavingsResponse.status === 'fulfilled') {
      const response = regularSavingsResponse.value;
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          allProducts.push(...data.data);
          console.log('✅ 일반 적금 상품 조회 성공:', data.data.length, '개');
        }
      } else {
        hasError = true;
        errorMessage += `일반 적금 조회 실패 (${response.status}); `;
      }
    } else {
      hasError = true;
      errorMessage += `일반 적금 조회 오류: ${regularSavingsResponse.reason?.message}; `;
    }

    // 공동 적금 처리
    if (jointSavingsResponse.status === 'fulfilled') {
      const response = jointSavingsResponse.value;
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          allProducts.push(...data.data);
          console.log('✅ 공동 적금 상품 조회 성공:', data.data.length, '개');
        }
      } else {
        hasError = true;
        errorMessage += `공동 적금 조회 실패 (${response.status}); `;
      }
    } else {
      hasError = true;
      errorMessage += `공동 적금 조회 오류: ${jointSavingsResponse.reason?.message}; `;
    }

    console.log('🔍 전체 적금 상품 조회 결과:', {
      총상품수: allProducts.length,
      일반적금: allProducts.filter(p => p.productType === 'SAVING').length,
      공동적금: allProducts.filter(p => p.productType === 'JOINT_SAVING').length
    });

    // 하나라도 성공했다면 성공으로 처리
    if (allProducts.length > 0) {
      return {
        success: true,
        data: allProducts,
        message: hasError ? `일부 상품 조회에 실패했습니다. (${errorMessage})` : '적금 상품 목록 조회 성공'
      };
    } else {
      throw new Error(errorMessage || '적금 상품을 조회할 수 없습니다.');
    }
  } catch (error) {
    console.error('❌ 적금 상품 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 대출 상품 목록 조회 API 호출 (일반 대출 + 공동 대출)
 * @returns {Promise} API 응답
 */
export const getLoanProducts = async () => {
  try {
    console.log('🔍 대출 상품 목록 조회 시작 (일반 대출 + 공동 대출)');

    // 일반 대출과 공동 대출을 병렬로 조회
    const [regularLoanResponse, jointLoanResponse] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/financial-products/type/LOAN`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }),
      fetch(`${API_BASE_URL}/api/financial-products/type/JOINT_LOAN`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
    ]);

    const allProducts = [];
    let hasError = false;
    let errorMessage = '';

    // 일반 대출 처리
    if (regularLoanResponse.status === 'fulfilled') {
      const response = regularLoanResponse.value;
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          allProducts.push(...data.data);
          console.log('✅ 일반 대출 상품 조회 성공:', data.data.length, '개');
        }
      } else {
        hasError = true;
        errorMessage += `일반 대출 조회 실패 (${response.status}); `;
      }
    } else {
      hasError = true;
      errorMessage += `일반 대출 조회 오류: ${regularLoanResponse.reason?.message}; `;
    }

    // 공동 대출 처리
    if (jointLoanResponse.status === 'fulfilled') {
      const response = jointLoanResponse.value;
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          allProducts.push(...data.data);
          console.log('✅ 공동 대출 상품 조회 성공:', data.data.length, '개');
        }
      } else {
        hasError = true;
        errorMessage += `공동 대출 조회 실패 (${response.status}); `;
      }
    } else {
      hasError = true;
      errorMessage += `공동 대출 조회 오류: ${jointLoanResponse.reason?.message}; `;
    }

    console.log('🔍 전체 대출 상품 조회 완료:', allProducts.length, '개');

    if (hasError && allProducts.length === 0) {
      throw new Error(`대출 상품 조회 실패: ${errorMessage}`);
    }

    return {
      success: true,
      data: allProducts,
      message: `대출 상품 ${allProducts.length}개 조회 완료`
    };
  } catch (error) {
    console.error('❌ 대출 상품 API 호출 오류:', error);
    throw error;
  }
};

/**
 * 적금 상품의 상세 정보 조회
 * @param {string} productId - 상품 ID
 * @returns {Promise<Object>} 적금 상품 상세 정보
 */
export const getSavingsProductDetail = async (productId) => {
  try {
    console.log('🔍 적금 상품 상세 정보 조회 시작:', productId);
    
    const response = await fetch(`${API_BASE_URL}/api/financial-products/savings/${productId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 적금 상품 상세 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 적금 상품 상세 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 적금 상품 상세 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error(`❌ Error fetching savings product detail for ${productId}:`, error);
    throw error;
  }
};

/**
 * 대출 상품의 상세 정보 조회
 * @param {string} productId - 상품 ID
 * @returns {Promise<Object>} 대출 상품 상세 정보
 */
export const getLoanProductDetail = async (productId) => {
  try {
    console.log('🔍 대출 상품 상세 정보 조회 시작:', productId);
    
    const response = await fetch(`${API_BASE_URL}/api/financial-products/loans/${productId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 대출 상품 상세 API 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 대출 상품 상세 API 에러 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 대출 상품 상세 API 성공 응답:', data);
    
    return data;
  } catch (error) {
    console.error(`❌ Error fetching loan product detail for ${productId}:`, error);
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
    
    // URL 파라미터를 API 타입으로 변환
    let apiProductType = productType;
    if (productType === 'savings') {
      apiProductType = 'SAVING';
    } else if (productType === 'loans' || productType === 'loan') {
      apiProductType = 'LOAN';
    } else if (productType === 'joint-savings' || productType === 'joint-saving') {
      apiProductType = 'JOINT_SAVING';
    } else if (productType === 'joint-loans' || productType === 'joint-loan') {
      apiProductType = 'JOINT_LOAN';
    }
    
    // JOINT_SAVING 타입도 적금 상세 API를 사용
    if (apiProductType === 'SAVING' || apiProductType === 'JOINT_SAVING') {
      return await getSavingsProductDetail(productId);
    } else if (apiProductType === 'LOAN' || apiProductType === 'JOINT_LOAN') {
      return await getLoanProductDetail(productId);
    } else {
      throw new Error(`지원하지 않는 상품 타입입니다: ${productType} (변환된 타입: ${apiProductType})`);
    }
  } catch (error) {
    console.error(`❌ Error fetching product detail for ${productId}:`, error);
    throw error;
  }
};

/**
 * 타입별 상품 목록 조회 (공통 함수)
 * @param {string} productType - 상품 타입 (SAVING, LOAN)
 * @returns {Promise<Object>} 상품 목록
 */
export const getFinancialProductsByType = async (productType) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/api/financial-products/type/${productType}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${productType} products:`, error);
    throw error;
  }
};
