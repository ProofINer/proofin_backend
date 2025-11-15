# 🚀 ProofIn 배포 및 테스트 가이드

이 문서는 스마트 컨트랙트 배포부터 백엔드 API 테스트까지 전체 프로세스를 안내합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [스마트 컨트랙트 배포](#스마트-컨트랙트-배포)
3. [백엔드 환경 설정](#백엔드-환경-설정)
4. [백엔드 서버 실행](#백엔드-서버-실행)
5. [API 테스트](#api-테스트)
6. [문제 해결](#문제-해결)

---

## 1. 사전 준비

### 필요한 것들

- Node.js (v18 이상)
- 배포된 스마트 컨트랙트 주소
- Infura 또는 다른 RPC 프로바이더 API 키
- (선택) 백엔드 트랜잭션 서명용 Private Key

### 의존성 설치

```bash
cd proofin_backend
npm install
```

---

## 2. 스마트 컨트랙트 배포

### 2.1 Hardhat 프로젝트에서 배포

스마트 컨트랙트 프로젝트 디렉토리에서:

```bash
# Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy.ts --network sepolia

# 로컬 네트워크에 배포 (테스트용)
npx hardhat run scripts/deploy.ts --network localhost
```

### 2.2 배포 정보 저장

배포 스크립트가 다음과 같은 JSON 형식으로 정보를 출력합니다:

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "deployer": "0x...",
  "contracts": {
    "ProofIn": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "TenantNFT": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "LandlordVerifier": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "DepositVault": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  }
}
```

이 정보를 `deployment-info.json` 파일로 저장하세요.

또는 샘플 파일을 생성하여 수정:

```bash
npm run create-sample
# deployment-sample.json 파일이 생성됩니다
```

---

## 3. 백엔드 환경 설정

### 3.1 자동 설정 (권장)

배포 정보 JSON 파일을 사용하여 자동으로 `.env` 파일을 업데이트:

```bash
npm run update-env deployment-info.json
```

### 3.2 수동 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 다음 항목들을 설정:

```env
# Environment
NODE_ENV=development
PORT=3000

# Blockchain Network
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CHAIN_ID=11155111

# Contract Addresses (배포된 주소로 업데이트)
PROOFIN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
TENANT_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
LANDLORD_VERIFIER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
DEPOSIT_VAULT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

# Private Key (선택사항 - 트랜잭션 서명이 필요한 경우)
BACKEND_PRIVATE_KEY=your_private_key_here

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 3.3 필수 설정 확인

- ✅ `RPC_URL`: Infura 또는 Alchemy 등의 RPC URL
- ✅ `PROOFIN_ADDRESS`: ProofIn 메인 컨트랙트 주소
- ✅ `TENANT_NFT_ADDRESS`: TenantNFT 컨트랙트 주소
- ✅ `LANDLORD_VERIFIER_ADDRESS`: LandlordVerifier 컨트랙트 주소
- ✅ `DEPOSIT_VAULT_ADDRESS`: DepositVault 컨트랙트 주소

---

## 4. 백엔드 서버 실행

### 4.1 개발 모드

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 4.2 프로덕션 모드

```bash
# 빌드
npm run build

# 실행
npm start
```

### 4.3 서버 확인

브라우저나 curl로 health check:

```bash
curl http://localhost:3000/api/health
```

정상 응답:
```json
{
  "success": true,
  "message": "ProofIn Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "network": "sepolia"
}
```

---

## 5. API 테스트

### 5.1 자동 테스트 실행

읽기 전용 API 테스트 (트랜잭션 없음):

```bash
npm test
```

또는

```bash
node scripts/test-api.js
```

### 5.2 트랜잭션 포함 전체 테스트

⚠️ **주의**: 실제 트랜잭션을 생성하므로 가스비가 소모됩니다.

```bash
npm run test:tx
```

또는

```bash
node scripts/test-api.js --with-transactions
```

### 5.3 테스트 항목

자동 테스트 스크립트는 다음 항목들을 테스트합니다:

1. ✅ Health Check
2. ✅ 모든 계약 조회
3. ✅ 세입자별 계약 조회
4. ✅ 집주인별 계약 조회
5. ✅ 집주인 검증 상태 확인
6. ✅ NFT 조회
7. ✅ 보증금 정보 조회
8. 🔐 계약 생성 (트랜잭션) - `--with-transactions` 플래그 필요
9. 🔐 집주인 검증 (트랜잭션) - `--with-transactions` 플래그 필요

### 5.4 수동 API 테스트

#### Health Check
```bash
curl http://localhost:3000/api/health
```

#### 모든 계약 조회
```bash
curl http://localhost:3000/api/contracts
```

#### 특정 계약 조회
```bash
curl http://localhost:3000/api/contracts/0
```

#### 세입자별 계약 조회
```bash
curl http://localhost:3000/api/contracts/tenant/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### 집주인별 계약 조회
```bash
curl http://localhost:3000/api/contracts/landlord/0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

#### 집주인 검증 상태 확인
```bash
curl http://localhost:3000/api/verifier/status/0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

#### NFT 조회
```bash
curl http://localhost:3000/api/nft/owner/0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### 보증금 정보 조회
```bash
curl http://localhost:3000/api/vault/0
```

#### 계약 생성 (POST)
```bash
curl -X POST http://localhost:3000/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "landlord": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "depositAmount": "1.0",
    "propertyAddress": "서울시 강남구 테헤란로 123",
    "startDate": 1705305600,
    "endDate": 1736841600
  }'
```

---

## 6. 문제 해결

### 6.1 "Cannot find module" 에러

```bash
npm install
npm run build
```

### 6.2 "RPC_URL is not defined" 에러

`.env` 파일에 `RPC_URL`이 설정되어 있는지 확인:

```bash
cat .env | grep RPC_URL
```

### 6.3 "Contract address is not defined" 에러

모든 컨트랙트 주소가 `.env`에 설정되어 있는지 확인:

```bash
npm run update-env deployment-info.json
```

### 6.4 "Connection refused" 에러

1. 백엔드 서버가 실행 중인지 확인
2. 포트 번호가 올바른지 확인 (기본: 3000)
3. 방화벽 설정 확인

### 6.5 트랜잭션 실패

1. `BACKEND_PRIVATE_KEY`가 설정되어 있는지 확인
2. 해당 계정에 충분한 ETH가 있는지 확인
3. RPC URL이 올바른지 확인
4. 네트워크가 일치하는지 확인 (Sepolia, Mainnet 등)

### 6.6 가스비 부족

테스트넷 faucet에서 ETH 받기:
- Sepolia: https://sepoliafaucet.com/
- Goerli: https://goerlifaucet.com/

---

## 7. 배포 체크리스트

배포 전 확인사항:

- [ ] 스마트 컨트랙트 배포 완료
- [ ] 배포 정보 JSON 저장
- [ ] `.env` 파일 설정 완료
- [ ] `npm install` 실행
- [ ] `npm run build` 성공
- [ ] 백엔드 서버 정상 실행
- [ ] Health check API 응답 확인
- [ ] 읽기 API 테스트 통과
- [ ] (선택) 트랜잭션 API 테스트 통과

---

## 8. React Native 앱 연동

백엔드 API가 정상 작동하면 React Native 앱에서 사용:

```typescript
// React Native에서 API 호출 예시
const API_BASE_URL = 'http://localhost:3000';  // 또는 실제 서버 URL

async function getTenantContracts(address: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/contracts/tenant/${address}`
  );
  const data = await response.json();
  return data.data;
}
```

---

## 📚 추가 리소스

- [ProofIn 백엔드 README](../README.md)
- [API 문서](./API.md)
- [스마트 컨트랙트 문서](../../contracts/README.md)

---

## 🆘 지원

문제가 발생하면:
1. 이 가이드의 문제 해결 섹션 확인
2. 로그 확인 (`npm run dev` 출력)
3. GitHub Issues에 문의

---

**마지막 업데이트**: 2024-01-15
