#!/usr/bin/env node

/**
 * ProofIn 백엔드 API 통합 테스트 스크립트
 * 
 * 사용법:
 * node scripts/test-api.js
 */

const axios = require('axios');

// 환경 변수 로드
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 테스트 데이터
const TEST_DATA = {
  tenant: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  landlord: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  depositAmount: '1.0',
  propertyAddress: '서울시 강남구 테헤란로 123',
  startDate: Math.floor(Date.now() / 1000),
  endDate: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1년 후
  documentHash: '0x' + '1'.repeat(64),
  // 인증 테스트용 데이터
  signatureMessage: 'ProofIn Login Request',
  mockSignature: '0x' + '1'.repeat(130) // 실제로는 ethers로 서명해야 함
};

// 색상 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// API 테스트 함수들
async function testHealthCheck() {
  logSection('1. Health Check 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    logSuccess('Health check 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    logError(`Health check 실패: ${error.message}`);
    return false;
  }
}

async function testAuthLogin(role = 'tenant') {
  logSection(`2. 인증 로그인 테스트 (${role})`);
  try {
    const address = role === 'tenant' ? TEST_DATA.tenant : TEST_DATA.landlord;
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      address,
      signature: TEST_DATA.mockSignature,
      message: TEST_DATA.signatureMessage,
      role
    });
    logSuccess(`${role} 로그인 성공`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.sessionId;
  } catch (error) {
    logError(`로그인 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testAuthValidate(token) {
  logSection('2-1. 세션 검증 테스트');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/validate`, {
      token
    });
    logSuccess('세션 검증 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`세션 검증 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testAuthLogout(token) {
  logSection('2-2. 로그아웃 테스트');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {
      token
    });
    logSuccess('로그아웃 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    logError(`로그아웃 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return false;
  }
}

async function testGetProfile(role, address) {
  logSection(`3. 프로필 조회 테스트 (${role})`);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile/${role}/${address}`);
    logSuccess('프로필 조회 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`프로필 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testCreateProfile(role, address) {
  logSection(`4. 프로필 생성 테스트 (${role})`);
  try {
    const profileData = {
      name: role === 'tenant' ? '테스트 세입자' : '테스트 집주인',
      email: `${role}@test.com`,
      phone: '010-1234-5678',
      settings: {
        notifications: true,
        language: 'ko'
      }
    };
    const response = await axios.post(
      `${API_BASE_URL}/api/profile/${role}/${address}`,
      profileData
    );
    logSuccess('프로필 생성 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`프로필 생성 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testUpdateProfile(role, address) {
  logSection(`4-1. 프로필 수정 테스트 (${role})`);
  try {
    const updateData = {
      name: role === 'tenant' ? '수정된 세입자' : '수정된 집주인',
      phone: '010-9876-5432',
      settings: {
        notifications: false,
        language: 'en'
      }
    };
    const response = await axios.put(
      `${API_BASE_URL}/api/profile/${role}/${address}`,
      updateData
    );
    logSuccess('프로필 수정 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`프로필 수정 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testGetNotifications(address) {
  logSection('5. 알림 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/notifications/${address}`);
    logSuccess('알림 조회 성공');
    console.log(`총 알림 수: ${response.data.data.length}`);
    console.log(`읽지 않은 알림: ${response.data.unreadCount}`);
    if (response.data.data.length > 0) {
      console.log('첫 번째 알림:', JSON.stringify(response.data.data[0], null, 2));
    }
    return response.data.data;
  } catch (error) {
    logError(`알림 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return [];
  }
}

async function testMarkNotificationAsRead(notificationId) {
  logSection('5-1. 알림 읽음 처리 테스트');
  try {
    const response = await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`);
    logSuccess('알림 읽음 처리 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`알림 읽음 처리 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testMarkAllNotificationsAsRead(address) {
  logSection('5-2. 전체 알림 읽음 처리 테스트');
  try {
    const response = await axios.put(`${API_BASE_URL}/api/notifications/user/${address}/read-all`);
    logSuccess('전체 알림 읽음 처리 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    logError(`전체 알림 읽음 처리 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return false;
  }
}

async function testGetAllContracts() {
  logSection('6. 모든 계약 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contracts`);
    logSuccess('계약 조회 성공');
    console.log(`총 계약 수: ${response.data.count}`);
    if (response.data.count > 0) {
      console.log('첫 번째 계약:', JSON.stringify(response.data.data[0], null, 2));
    }
    return response.data.data;
  } catch (error) {
    logError(`계약 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return [];
  }
}

async function testGetSpecificContract(contractId) {
  logSection('6-1. 특정 계약 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contracts/${contractId}`);
    logSuccess(`계약 ${contractId} 조회 성공`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`특정 계약 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testGetContractsByTenant(address) {
  logSection('7. 세입자별 계약 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contracts/tenant/${address}`);
    logSuccess(`세입자 ${address}의 계약 조회 성공`);
    console.log(`계약 수: ${response.data.count}`);
    return response.data.data;
  } catch (error) {
    logError(`세입자 계약 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return [];
  }
}

async function testGetContractsByLandlord(address) {
  logSection('8. 집주인별 계약 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contracts/landlord/${address}`);
    logSuccess(`집주인 ${address}의 계약 조회 성공`);
    console.log(`계약 수: ${response.data.count}`);
    return response.data.data;
  } catch (error) {
    logError(`집주인 계약 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return [];
  }
}

async function testCheckVerificationStatus(address) {
  logSection('9. 집주인 검증 상태 확인 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/verifier/status/${address}`);
    logSuccess('검증 상태 확인 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`검증 상태 확인 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testGetNFTsByOwner(address) {
  logSection('10. NFT 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/nft/owner/${address}`);
    logSuccess(`소유자 ${address}의 NFT 조회 성공`);
    console.log(`NFT 수: ${response.data.count}`);
    if (response.data.count > 0) {
      console.log('첫 번째 NFT:', JSON.stringify(response.data.data[0], null, 2));
    }
    return response.data.data;
  } catch (error) {
    logError(`NFT 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return [];
  }
}

async function testGetSpecificNFT(tokenId) {
  logSection('10-1. 특정 NFT 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/nft/${tokenId}`);
    logSuccess(`NFT ${tokenId} 조회 성공`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`특정 NFT 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testGetDepositInfo(contractId) {
  logSection('11. 보증금 정보 조회 테스트');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/vault/${contractId}`);
    logSuccess(`계약 ${contractId}의 보증금 정보 조회 성공`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`보증금 정보 조회 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testDepositToVault(contractId, amount) {
  logSection('11-1. 보증금 예치 테스트');
  logInfo('⚠️  이 테스트는 실제 트랜잭션을 생성합니다.');
  
  if (!process.env.BACKEND_PRIVATE_KEY) {
    logError('BACKEND_PRIVATE_KEY가 설정되지 않았습니다. 테스트를 건너뜁니다.');
    return null;
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/vault/deposit`, {
      contractId,
      amount
    });
    logSuccess('보증금 예치 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`보증금 예치 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

// 트랜잭션 생성 테스트 (실제 서명 필요)
async function testCreateContract() {
  logSection('12. 계약 생성 테스트 (트랜잭션)');
  logInfo('⚠️  이 테스트는 실제 트랜잭션을 생성합니다.');
  logInfo('⚠️  BACKEND_PRIVATE_KEY가 설정되어 있어야 합니다.');
  
  if (!process.env.BACKEND_PRIVATE_KEY) {
    logError('BACKEND_PRIVATE_KEY가 설정되지 않았습니다. 테스트를 건너뜁니다.');
    return null;
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/contracts`, {
      ...TEST_DATA,
      role: 'tenant' // 역할 추가
    });
    logSuccess('계약 생성 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`계약 생성 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testUpdateContract(contractId) {
  logSection('12-1. 계약 수정 테스트 (트랜잭션)');
  logInfo('⚠️  이 테스트는 실제 트랜잭션을 생성합니다.');
  
  if (!process.env.BACKEND_PRIVATE_KEY) {
    logError('BACKEND_PRIVATE_KEY가 설정되지 않았습니다. 테스트를 건너뜁니다.');
    return null;
  }
  
  try {
    const response = await axios.put(`${API_BASE_URL}/api/contracts/${contractId}`, {
      propertyAddress: '서울시 강남구 테헤란로 456 (수정됨)',
      depositAmount: '2.0',
      role: 'tenant'
    });
    logSuccess('계약 수정 성공');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (error) {
    logError(`계약 수정 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

async function testVerifyLandlordWithAutoMint() {
  logSection('13. 집주인 검증 + NFT 자동 발행 테스트 (트랜잭션)');
  logInfo('⚠️  이 테스트는 실제 트랜잭션을 생성합니다.');
  
  if (!process.env.BACKEND_PRIVATE_KEY) {
    logError('BACKEND_PRIVATE_KEY가 설정되지 않았습니다. 테스트를 건너뜁니다.');
    return null;
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/verifier/verify`, {
      landlord: TEST_DATA.landlord,
      propertyAddress: TEST_DATA.propertyAddress,
      documentHash: TEST_DATA.documentHash,
      tenantAddress: TEST_DATA.tenant,
      contractId: 1,
      autoMintNFT: true // NFT 자동 발행 활성화
    });
    logSuccess('집주인 검증 및 NFT 자동 발행 성공');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 검증 결과
    if (response.data.success) {
      logInfo('검증 트랜잭션 해시: ' + response.data.verification?.transactionHash);
      if (response.data.nft) {
        logSuccess('NFT 자동 발행 완료!');
        logInfo('NFT 트랜잭션 해시: ' + response.data.nft.transactionHash);
      }
    }
    
    return response.data;
  } catch (error) {
    logError(`집주인 검증 실패: ${error.message}`);
    if (error.response) {
      console.log('응답 데이터:', error.response.data);
    }
    return null;
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('\n');
  log('🚀 ProofIn 백엔드 API 테스트 시작', 'cyan');
  log(`📍 API 서버: ${API_BASE_URL}`, 'blue');
  console.log('\n');
  
  let passedTests = 0;
  let totalTests = 0;
  let tenantSessionId = null;
  let landlordSessionId = null;
  let testNotificationId = null;
  let testContractId = null;
  
  // 1. Health Check
  totalTests++;
  if (await testHealthCheck()) passedTests++;
  await sleep(1000);
  
  // 2. 인증 테스트 - Tenant 로그인
  totalTests++;
  tenantSessionId = await testAuthLogin('tenant');
  if (tenantSessionId) passedTests++;
  await sleep(1000);
  
  // 2-1. 세션 검증 테스트
  if (tenantSessionId) {
    totalTests++;
    if (await testAuthValidate(tenantSessionId)) passedTests++;
    await sleep(1000);
  }
  
  // 3. Landlord 로그인
  totalTests++;
  landlordSessionId = await testAuthLogin('landlord');
  if (landlordSessionId) passedTests++;
  await sleep(1000);
  
  // 4. 프로필 생성 테스트
  totalTests++;
  if (await testCreateProfile('tenant', TEST_DATA.tenant)) passedTests++;
  await sleep(1000);
  
  totalTests++;
  if (await testCreateProfile('landlord', TEST_DATA.landlord)) passedTests++;
  await sleep(1000);
  
  // 4-1. 프로필 수정 테스트
  totalTests++;
  if (await testUpdateProfile('tenant', TEST_DATA.tenant)) passedTests++;
  await sleep(1000);
  
  // 5. 프로필 조회 테스트
  totalTests++;
  if (await testGetProfile('tenant', TEST_DATA.tenant)) passedTests++;
  await sleep(1000);
  
  totalTests++;
  if (await testGetProfile('landlord', TEST_DATA.landlord)) passedTests++;
  await sleep(1000);
  
  // 6. 알림 조회 테스트
  totalTests++;
  const tenantNotifications = await testGetNotifications(TEST_DATA.tenant);
  if (tenantNotifications !== null) {
    passedTests++;
    if (tenantNotifications.length > 0) {
      testNotificationId = tenantNotifications[0].id;
    }
  }
  await sleep(1000);
  
  // 6-1. 알림 읽음 처리 테스트 (알림이 있는 경우)
  if (testNotificationId) {
    totalTests++;
    if (await testMarkNotificationAsRead(testNotificationId)) passedTests++;
    await sleep(1000);
  }
  
  // 7. 모든 계약 조회
  totalTests++;
  const allContracts = await testGetAllContracts();
  if (allContracts !== null) {
    passedTests++;
    if (allContracts.length > 0) {
      testContractId = allContracts[0].contractId || 0;
    }
  }
  await sleep(1000);
  
  // 7-1. 특정 계약 조회 (계약이 있는 경우)
  if (testContractId) {
    totalTests++;
    if (await testGetSpecificContract(testContractId)) passedTests++;
    await sleep(1000);
  }
  
  // 8. 세입자별 계약 조회
  totalTests++;
  if (await testGetContractsByTenant(TEST_DATA.tenant)) passedTests++;
  await sleep(1000);
  
  // 9. 집주인별 계약 조회
  totalTests++;
  if (await testGetContractsByLandlord(TEST_DATA.landlord)) passedTests++;
  await sleep(1000);
  
  // 10. 검증 상태 확인
  totalTests++;
  if (await testCheckVerificationStatus(TEST_DATA.landlord)) passedTests++;
  await sleep(1000);
  
  // 11. NFT 조회
  totalTests++;
  const nfts = await testGetNFTsByOwner(TEST_DATA.tenant);
  if (nfts !== null) passedTests++;
  await sleep(1000);
  
  // 11-1. 특정 NFT 조회 (NFT가 있는 경우)
  if (nfts && nfts.length > 0) {
    totalTests++;
    if (await testGetSpecificNFT(1)) passedTests++;
    await sleep(1000);
  }
  
  // 12. 보증금 정보 조회 (계약이 있는 경우)
  if (testContractId) {
    totalTests++;
    if (await testGetDepositInfo(testContractId)) passedTests++;
    await sleep(1000);
  }
  
  // 트랜잭션 테스트 (선택사항)
  if (process.argv.includes('--with-transactions')) {
    logInfo('\n🔐 트랜잭션 테스트를 실행합니다...\n');
    
    // 13. 계약 생성
    totalTests++;
    const createdContract = await testCreateContract();
    if (createdContract) {
      passedTests++;
      testContractId = createdContract.contractId || 1;
    }
    await sleep(2000);
    
    // 13-1. 계약 수정 (계약 생성 성공 시)
    if (testContractId) {
      totalTests++;
      if (await testUpdateContract(testContractId)) passedTests++;
      await sleep(2000);
    }
    
    // 14. 보증금 예치 (계약이 있는 경우)
    if (testContractId) {
      totalTests++;
      if (await testDepositToVault(testContractId, TEST_DATA.depositAmount)) passedTests++;
      await sleep(2000);
    }
    
    // 15. 집주인 검증 + NFT 자동 발행
    totalTests++;
    if (await testVerifyLandlordWithAutoMint()) passedTests++;
    await sleep(2000);
    
    // 16. 생성된 계약 후 알림 재조회
    totalTests++;
    const updatedNotifications = await testGetNotifications(TEST_DATA.tenant);
    if (updatedNotifications && updatedNotifications.length > tenantNotifications.length) {
      logSuccess('새로운 알림이 생성되었습니다!');
      passedTests++;
    } else {
      logInfo('알림 업데이트 확인');
    }
    await sleep(1000);
    
    // 17. 전체 알림 읽음 처리 테스트
    totalTests++;
    if (await testMarkAllNotificationsAsRead(TEST_DATA.tenant)) passedTests++;
    await sleep(1000);
  }
  
  // 로그아웃 테스트 (세션이 있는 경우)
  if (tenantSessionId) {
    totalTests++;
    if (await testAuthLogout(tenantSessionId)) passedTests++;
    await sleep(1000);
  }
  
  // 결과 요약
  logSection('테스트 결과 요약');
  console.log(`총 테스트: ${totalTests}`);
  log(`✅ 성공: ${passedTests}`, 'green');
  log(`❌ 실패: ${totalTests - passedTests}`, 'red');
  console.log(`성공률: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  if (passedTests === totalTests) {
    log('\n🎉 모든 테스트가 성공했습니다!', 'green');
  } else {
    log('\n⚠️  일부 테스트가 실패했습니다.', 'yellow');
  }
  
  // 세션 정보
  if (tenantSessionId || landlordSessionId) {
    logSection('세션 정보');
    if (tenantSessionId) logInfo(`Tenant Session: ${tenantSessionId}`);
    if (landlordSessionId) logInfo(`Landlord Session: ${landlordSessionId}`);
  }
  
  console.log('\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 스크립트 실행
if (require.main === module) {
  log('\n📋 ProofIn API 테스트 스크립트', 'cyan');
  logInfo('💡 팁: 트랜잭션 테스트를 포함하려면 --with-transactions 플래그를 사용하세요.');
  logInfo('   예: node scripts/test-api.js --with-transactions');
  logInfo('\n📌 테스트 항목 (기본):');
  logInfo('   1. Health Check');
  logInfo('   2. Tenant 로그인');
  logInfo('   2-1. 세션 검증');
  logInfo('   3. Landlord 로그인');
  logInfo('   4. Tenant 프로필 생성');
  logInfo('   5. Landlord 프로필 생성');
  logInfo('   4-1. Tenant 프로필 수정');
  logInfo('   6. Tenant 프로필 조회');
  logInfo('   7. Landlord 프로필 조회');
  logInfo('   8. 알림 목록 조회');
  logInfo('   8-1. 알림 읽음 처리 (알림 있을 시)');
  logInfo('   9. 전체 계약 조회');
  logInfo('   9-1. 특정 계약 조회 (계약 있을 시)');
  logInfo('   10. 세입자별 계약 조회');
  logInfo('   11. 집주인별 계약 조회');
  logInfo('   12. 검증 상태 확인');
  logInfo('   13. NFT 보유 목록 조회');
  logInfo('   13-1. 특정 NFT 조회 (NFT 있을 시)');
  logInfo('   14. 보증금 정보 조회 (계약 있을 시)');
  logInfo('   15. 로그아웃');
  logInfo('\n📌 트랜잭션 테스트 (--with-transactions):');
  logInfo('   16. 계약 생성');
  logInfo('   16-1. 계약 수정');
  logInfo('   17. 보증금 예치');
  logInfo('   18. 집주인 검증 + NFT 자동 발행');
  logInfo('   19. 알림 업데이트 확인');
  logInfo('   20. 전체 알림 읽음 처리\n');
  
  runAllTests().catch(error => {
    logError(`테스트 실행 중 에러 발생: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests };
