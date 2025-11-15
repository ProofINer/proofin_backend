#!/usr/bin/env node

/**
 * 배포 정보 JSON 샘플 생성 스크립트
 * 테스트용으로 사용
 */

const fs = require('fs');
const path = require('path');

const sampleDeployment = {
  network: "sepolia",
  chainId: 11155111,
  timestamp: new Date().toISOString(),
  deployer: "0x1234567890123456789012345678901234567890",
  contracts: {
    ProofIn: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    TenantNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    LandlordVerifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    DepositVault: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  }
};

const outputPath = path.join(__dirname, '..', 'deployment-sample.json');

fs.writeFileSync(outputPath, JSON.stringify(sampleDeployment, null, 2));

console.log('✅ 샘플 배포 정보가 생성되었습니다:', outputPath);
console.log('📝 이 파일을 참고하여 실제 배포 정보를 생성하세요.\n');
console.log(JSON.stringify(sampleDeployment, null, 2));
