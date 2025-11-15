# ProofIn Backend

ProofIn 백엔드 API - 블록체인 기반 임대차 계약 NFT 시스템

## 📋 프로젝트 구조

```
proofin_backend/
├── src/
│   ├── app.ts                 # Express 앱 설정
│   ├── index.ts               # 서버 진입점
│   ├── contracts/             # 스마트 컨트랙트 연동
│   │   ├── provider.ts        # 블록체인 프로바이더
│   │   ├── ProofInContract.ts # 메인 계약 컨트랙트
│   │   ├── TenantNFTContract.ts # 세입자 NFT 컨트랙트
│   │   ├── LandlordVerifierContract.ts # 집주인 검증 컨트랙트
│   │   └── DepositVaultContract.ts # 보증금 관리 컨트랙트
│   ├── services/              # 비즈니스 로직
│   │   ├── contract.service.ts
│   │   ├── nft.service.ts
│   │   ├── verifier.service.ts
│   │   └── vault.service.ts
│   ├── routes/                # API 라우트
│   │   ├── health.routes.ts
│   │   ├── contract.routes.ts
│   │   ├── nft.routes.ts
│   │   ├── verifier.routes.ts
│   │   └── vault.routes.ts
│   ├── middleware/            # 미들웨어
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   └── types/                 # TypeScript 타입 정의
│       └── index.ts
├── .env.example               # 환경 변수 예제
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성 후 설정:

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
# Environment
NODE_ENV=development
PORT=3000

# Blockchain Network
NETWORK=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CHAIN_ID=11155111

# Contract Addresses (배포 후 업데이트)
PROOFIN_ADDRESS=0x...
TENANT_NFT_ADDRESS=0x...
LANDLORD_VERIFIER_ADDRESS=0x...
DEPOSIT_VAULT_ADDRESS=0x...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 3. 서버 실행

개발 모드:
```bash
npm run dev
```

프로덕션 빌드:
```bash
npm run build
npm start
```

## 📡 API 엔드포인트

### Health Check
- `GET /api/health` - 서버 상태 확인

### 계약 관리 (Contracts)
- `POST /api/contracts` - 계약 생성
- `GET /api/contracts` - 모든 계약 조회
- `GET /api/contracts/:contractId` - 특정 계약 조회
- `GET /api/contracts/tenant/:address` - 세입자별 계약 조회
- `GET /api/contracts/landlord/:address` - 집주인별 계약 조회

### NFT 관리
- `POST /api/nft/mint` - NFT 발행
- `GET /api/nft/owner/:address` - 소유자별 NFT 조회
- `GET /api/nft/:tokenId` - 특정 NFT 조회

### 집주인 검증
- `POST /api/verifier/verify` - 집주인 검증
- `GET /api/verifier/status/:address` - 검증 상태 확인
- `GET /api/verifier/details/:address` - 검증 상세 정보 조회

### 보증금 관리
- `POST /api/vault/deposit` - 보증금 입금
- `POST /api/vault/release/:contractId` - 보증금 인출
- `POST /api/vault/refund/:contractId` - 보증금 환불
- `GET /api/vault/:contractId` - 보증금 정보 조회

## 🔗 스마트 컨트랙트 연동

이 백엔드는 다음 4개의 스마트 컨트랙트와 연동됩니다:

1. **ProofIn** - 메인 오케스트레이터
2. **TenantNFT** - 세입자 NFT 발행 및 관리
3. **LandlordVerifier** - 집주인 신원 검증
4. **DepositVault** - 보증금 예치 및 관리

## 🛠 기술 스택

- **Node.js** - 런타임
- **TypeScript** - 타입 안정성
- **Express** - 웹 프레임워크
- **ethers.js** - 블록체인 상호작용
- **dotenv** - 환경 변수 관리

## 📱 React Native 연동

React Native 앱에서 다음과 같이 API를 호출할 수 있습니다:

```typescript
// 계약 생성 예시
const createContract = async (contractData) => {
  const response = await fetch('http://localhost:3000/api/contracts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contractData)
  });
  return response.json();
};

// 세입자별 계약 조회
const getTenantContracts = async (address) => {
  const response = await fetch(`http://localhost:3000/api/contracts/tenant/${address}`);
  return response.json();
};
```
