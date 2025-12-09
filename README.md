# ProofIn Backend

> **블록체인 기반 임대차 계약 검증 시스템 - 백엔드 API**

ProofIn은 리얼에셋(부동산) 임대차 계약의 진위 여부를 블록체인으로 검증하는 DApp입니다. 이 레포지토리는 스마트 컨트랙트와 React Native 앱을 연결하는 **Node.js 백엔드 API 서버**를 담고 있습니다.

### 핵심 목표
- **위변조 방지**: 임대차 계약 데이터를 블록체인에 기록하여 투명성 확보
- **검증 자동화**: 집주인 신원 검증 후 세입자에게 NFT 자동 발행
- **비용 최적화**: 서버리스 아키텍처 설계로 실서비스 운영 비용 최소화

### 주요 기능
1. **계약 요청 등록** - 세입자가 계약 정보를 블록체인에 등록
2. **집주인 검증** - 오프체인 신원 확인 후 온체인 검증 기록
3. **NFT 자동 발행** - 검증 완료 시 세입자에게 계약 증명 NFT 발급
4. **보증금 관리** - 스마트 컨트랙트 기반 보증금 예치/해제

### 기술적 특징
- **서버리스 아키텍처**: AWS Lambda 중심 설계로 EC2 대비 운영 비용 절감
- **무상태 API 설계**: Lambda 환경에 최적화된 stateless 구조
- **CloudWatch 모니터링**: 실행 로그 및 오류 추적 파이프라인 구성
- **확장 가능 구조**: Docker 기반 AI 모델 연동 준비

---

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
│   │   ├── auth.service.ts    # 지갑 인증
│   │   ├── contract.service.ts # 계약 관리
│   │   ├── nft.service.ts      # NFT 발행
│   │   ├── verifier.service.ts # 검증 + NFT 자동 발행
│   │   ├── vault.service.ts    # 보증금 관리
│   │   ├── profile.service.ts  # 사용자 프로필
│   │   └── notification.service.ts # 알림 시스템
│   ├── routes/                # API 라우트
│   │   ├── auth.routes.ts     # 인증 API
│   │   ├── profile.routes.ts  # 프로필 API
│   │   ├── notification.routes.ts # 알림 API
│   │   ├── contract.routes.ts # 계약 API
│   │   ├── nft.routes.ts      # NFT API
│   │   ├── verifier.routes.ts # 검증 API
│   │   ├── vault.routes.ts    # 보증금 API
│   │   └── health.routes.ts   # 헬스체크
│   ├── middleware/            # 미들웨어
│   │   ├── auth.middleware.ts # JWT 인증
│   │   ├── errorHandler.ts    # 에러 처리
│   │   └── notFound.ts        # 404 처리
│   └── types/                 # TypeScript 타입 정의
│       └── index.ts
├── scripts/                   # 유틸리티 스크립트
│   ├── test-api.js           # API 통합 테스트
│   ├── create-sample-deployment.js
│   └── update-env.js
├── docs/                      # 문서
│   ├── API_ENDPOINTS.md      # API 엔드포인트 목록
│   ├── SECURITY_FIXES.md     # 보안 수정 사항
│   └── TEST_COVERAGE.md      # 테스트 커버리지
├── .env.example               # 환경 변수 예제
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

> 💡 **전체 API 문서**: [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md) 참조

### Authentication (인증)
- `POST /api/auth/login` - 지갑 서명 기반 로그인
- `POST /api/auth/validate` - 세션 검증
- `POST /api/auth/logout` - 로그아웃

### Profile (프로필)
- `GET /api/profile/:role/:address` - 프로필 조회
- `POST /api/profile/:role/:address` - 프로필 생성
- `PUT /api/profile/:role/:address` - 프로필 수정

### Notifications (알림)
- `GET /api/notifications/:address` - 알림 목록 조회
- `PUT /api/notifications/:id/read` - 알림 읽음 처리

### Contracts (계약 관리)
- `POST /api/contracts` - 계약 생성 (Tenant만)
- `PUT /api/contracts/:contractId` - 계약 수정 (Tenant만)
- `GET /api/contracts` - 모든 계약 조회
- `GET /api/contracts/:contractId` - 특정 계약 조회
- `GET /api/contracts/tenant/:address` - 세입자별 계약 조회
- `GET /api/contracts/landlord/:address` - 집주인별 계약 조회

### Verifier (집주인 검증)
- `POST /api/verifier/verify` - 집주인 검증 + NFT 자동 발행
- `GET /api/verifier/status/:address` - 검증 상태 확인

### NFT (세입자 NFT)
- `GET /api/nft/owner/:address` - 소유자별 NFT 조회
- `GET /api/nft/:tokenId` - 특정 NFT 조회
- `POST /api/nft/mint` - NFT 발행 (내부용)

### Vault (보증금 관리)
- `POST /api/vault/deposit` - 보증금 예치
- `POST /api/vault/release/:contractId` - 보증금 해제
- `POST /api/vault/refund/:contractId` - 보증금 환불
- `GET /api/vault/:contractId` - 보증금 정보 조회

### Health Check
- `GET /api/health` - 서버 상태 및 컨트랙트 주소 확인

## 🔗 스마트 컨트랙트 연동

이 백엔드는 다음 4개의 스마트 컨트랙트와 연동됩니다:

### 1. ProofIn (메인 컨트랙트)
- **역할**: 계약 생성 및 전체 프로세스 오케스트레이션
- **주요 기능**: 
  - 계약 요청 등록
  - 대기 상태 계약 관리
  - 검증 완료 시 계약 상태 업데이트

### 2. TenantNFT (세입자 NFT)
- **역할**: 검증 완료된 계약에 대한 NFT 발행
- **주요 기능**:
  - 세입자에게 계약 증명 NFT 발급
  - NFT 메타데이터 관리 (tokenURI)
  - 소유권 조회

### 3. LandlordVerifier (집주인 검증)
- **역할**: 집주인 신원 및 부동산 소유권 검증
- **주요 기능**:
  - 집주인 검증 상태 기록
  - 부동산 주소별 검증 이력 관리
  - 검증 문서 해시 저장

### 4. DepositVault (보증금 관리)
- **역할**: 계약 보증금 예치 및 관리
- **주요 기능**:
  - 보증금 예치 (ETH)
  - 계약 완료 시 보증금 해제
  - 계약 취소 시 보증금 환불

### 계약 플로우
```
1. Tenant → ProofIn.createContract()        (계약 요청)
           ↓
2. Admin → LandlordVerifier.verifyLandlord() (집주인 검증)
           ↓
3. Backend → TenantNFT.mint()                (NFT 자동 발행)
           ↓
4. Tenant → DepositVault.deposit()           (보증금 예치)
           ↓
5. 계약 완료 → DepositVault.release()        (보증금 해제)
```

> 📄 **스마트 컨트랙트 레포지토리**: [별도 레포 링크 추가 예정]

## 🛠 기술 스택

### Backend
- **Node.js** - JavaScript 런타임
- **TypeScript** - 타입 안정성
- **Express** - RESTful API 프레임워크
- **ethers.js v6** - 블록체인 상호작용

### Blockchain
- **Ethereum Sepolia** - 테스트넷
- **Hardhat** - 스마트 컨트랙트 개발 환경
- **Solidity** - 스마트 컨트랙트 언어

### Infrastructure (설계)
- **AWS Lambda** - 서버리스 컴퓨팅
- **API Gateway** - API 엔드포인트 관리
- **DynamoDB** - NoSQL 데이터베이스
- **S3** - 문서 저장소
- **CloudWatch** - 로그 및 모니터링

### Development
- **dotenv** - 환경 변수 관리
- **ESLint** - 코드 품질 관리
- **Axios** - HTTP 클라이언트 (테스트용)

## 📱 React Native 연동

React Native 앱에서 다음과 같이 API를 호출할 수 있습니다:

### 인증 예시
```typescript
// 지갑 서명 기반 로그인
const login = async (address: string, signature: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address,
      signature,
      message: 'ProofIn Login Request',
      role: 'tenant' // or 'landlord'
    })
  });
  const data = await response.json();
  return data.token; // Bearer 토큰 저장
};
```

### 계약 생성 예시
```typescript
// Bearer 토큰과 함께 계약 생성
const createContract = async (contractData: any, token: string) => {
  const response = await fetch('http://localhost:3000/api/contracts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // JWT 인증
    },
    body: JSON.stringify(contractData)
  });
  return response.json();
};
```

### 계약 조회 예시
```typescript
// 세입자별 계약 조회
const getTenantContracts = async (address: string) => {
  const response = await fetch(
    `http://localhost:3000/api/contracts/tenant/${address}`
  );
  return response.json();
};
```

### 알림 조회 예시
```typescript
// 실시간 알림 폴링
const getNotifications = async (address: string) => {
  const response = await fetch(
    `http://localhost:3000/api/notifications/${address}`
  );
  const data = await response.json();
  return {
    notifications: data.data,
    unreadCount: data.unreadCount
  };
};
```

> 💡 **Tip**: React Native 앱에서는 `axios` 또는 `fetch`를 사용하여 API를 호출하고, AsyncStorage에 JWT 토큰을 저장하여 인증 상태를 유지하세요.

---

## 🧪 테스트

### API 통합 테스트
```bash
# 기본 테스트 (읽기 전용)
node scripts/test-api.js

# 트랜잭션 포함 전체 테스트
node scripts/test-api.js --with-transactions
```

### 테스트 커버리지
- **25개 API 엔드포인트** 100% 커버
- **22개 테스트 함수**로 전체 플로우 검증
- 상세 내용: [docs/TEST_COVERAGE.md](docs/TEST_COVERAGE.md)

---

## 🚀 배포 (예정)

### AWS Lambda 배포
```bash
# 1. 프로젝트 빌드
npm run build

# 2. Lambda 함수 패키징
zip -r function.zip dist/ node_modules/ package.json

# 3. AWS CLI로 배포
aws lambda update-function-code \
  --function-name proofin-api \
  --zip-file fileb://function.zip
```

### 환경 변수 설정 (Lambda)
- API Gateway 엔드포인트 설정
- DynamoDB 테이블 연결
- CloudWatch Logs 그룹 생성

---

## 📚 문서

- [API 엔드포인트 상세](docs/API_ENDPOINTS.md)
- [보안 수정 사항](docs/SECURITY_FIXES.md)
- [테스트 커버리지 보고서](docs/TEST_COVERAGE.md)

---

## 👥 기여

이 프로젝트는 RISE 창업 경진대회를 위해 개발되었습니다.

### 개발자
- **Backend API**: Node.js/Express, ethers.js 연동
- **Smart Contract**: Solidity, Hardhat
- **Infrastructure**: AWS Lambda, DynamoDB, S3 아키텍처 설계

---

## 📄 라이센스

MIT License

---

## 🔮 향후 계획

- [ ] AWS Lambda + API Gateway 배포
- [ ] DynamoDB 데이터베이스 연동 (메모리 → 영구 저장소)
- [ ] Docker 기반 AI 모델 연동 (위조 문서 탐지)
- [ ] CloudWatch 실시간 모니터링 대시보드
- [ ] IPFS 기반 문서 저장 시스템
- [ ] Mainnet 배포 준비
