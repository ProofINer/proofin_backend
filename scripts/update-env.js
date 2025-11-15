#!/usr/bin/env node

/**
 * 스마트 컨트랙트 배포 후 .env 파일 업데이트 스크립트
 * 
 * 사용법:
 * node scripts/update-env.js <deployment.json 경로>
 */

const fs = require('fs');
const path = require('path');

function updateEnvFile(deploymentDataPath) {
  try {
    // deployment 정보 읽기
    const deploymentData = JSON.parse(fs.readFileSync(deploymentDataPath, 'utf8'));
    
    // .env 파일 경로
    const envPath = path.join(__dirname, '..', '.env');
    
    // .env 파일이 없으면 .env.example 복사
    if (!fs.existsSync(envPath)) {
      const envExamplePath = path.join(__dirname, '..', '.env.example');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env 파일이 .env.example에서 생성되었습니다.');
    }
    
    // .env 파일 읽기
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 컨트랙트 주소 업데이트
    const contracts = deploymentData.contracts;
    
    envContent = envContent.replace(
      /PROOFIN_ADDRESS=.*/,
      `PROOFIN_ADDRESS=${contracts.ProofIn}`
    );
    
    envContent = envContent.replace(
      /TENANT_NFT_ADDRESS=.*/,
      `TENANT_NFT_ADDRESS=${contracts.TenantNFT}`
    );
    
    envContent = envContent.replace(
      /LANDLORD_VERIFIER_ADDRESS=.*/,
      `LANDLORD_VERIFIER_ADDRESS=${contracts.LandlordVerifier}`
    );
    
    envContent = envContent.replace(
      /DEPOSIT_VAULT_ADDRESS=.*/,
      `DEPOSIT_VAULT_ADDRESS=${contracts.DepositVault}`
    );
    
    // 네트워크 정보 업데이트
    if (deploymentData.network) {
      envContent = envContent.replace(
        /NETWORK=.*/,
        `NETWORK=${deploymentData.network}`
      );
    }
    
    if (deploymentData.chainId) {
      envContent = envContent.replace(
        /CHAIN_ID=.*/,
        `CHAIN_ID=${deploymentData.chainId}`
      );
    }
    
    // .env 파일 쓰기
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n🎉 .env 파일이 업데이트되었습니다!');
    console.log('==================================');
    console.log(`네트워크: ${deploymentData.network}`);
    console.log(`체인 ID: ${deploymentData.chainId}`);
    console.log('----------------------------------');
    console.log(`ProofIn: ${contracts.ProofIn}`);
    console.log(`TenantNFT: ${contracts.TenantNFT}`);
    console.log(`LandlordVerifier: ${contracts.LandlordVerifier}`);
    console.log(`DepositVault: ${contracts.DepositVault}`);
    console.log('==================================\n');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  }
}

// 커맨드 라인 인자 확인
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('사용법: node scripts/update-env.js <deployment.json 경로>');
  console.log('예시: node scripts/update-env.js ./deployment-info.json');
  process.exit(1);
}

const deploymentPath = args[0];

if (!fs.existsSync(deploymentPath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${deploymentPath}`);
  process.exit(1);
}

updateEnvFile(deploymentPath);
