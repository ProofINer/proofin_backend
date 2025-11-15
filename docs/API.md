# ProofIn Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format

모든 API 응답은 다음 형식을 따릅니다:

```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  count?: number;
}
```

---

## Endpoints

### 1. Health Check

서버 상태 확인

**Endpoint:** `GET /health`

**Response:**
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

## Contract Management

### 2. Create Contract

새로운 임대차 계약 생성

**Endpoint:** `POST /contracts`

**Request Body:**
```json
{
  "tenant": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "landlord": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "depositAmount": "1.0",
  "propertyAddress": "서울시 강남구 테헤란로 123",
  "startDate": 1705305600,
  "endDate": 1736841600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12345
  }
}
```

### 3. Get All Contracts

모든 계약 조회

**Endpoint:** `GET /contracts`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contractId": 0,
      "tenant": "0x...",
      "landlord": "0x...",
      "depositAmount": "1.0",
      "propertyAddress": "서울시 강남구 테헤란로 123",
      "startDate": 1705305600,
      "endDate": 1736841600,
      "status": 0,
      "createdAt": 1705305600
    }
  ],
  "count": 1
}
```

### 4. Get Contract by ID

특정 계약 상세 조회

**Endpoint:** `GET /contracts/:contractId`

**Parameters:**
- `contractId` (number): 계약 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": "0x...",
    "landlord": "0x...",
    "depositAmount": "1.0",
    "propertyAddress": "서울시 강남구 테헤란로 123",
    "startDate": 1705305600,
    "endDate": 1736841600,
    "status": 0,
    "createdAt": 1705305600
  }
}
```

### 5. Get Contracts by Tenant

세입자의 모든 계약 조회

**Endpoint:** `GET /contracts/tenant/:address`

**Parameters:**
- `address` (string): 세입자 지갑 주소

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 2
}
```

### 6. Get Contracts by Landlord

집주인의 모든 계약 조회

**Endpoint:** `GET /contracts/landlord/:address`

**Parameters:**
- `address` (string): 집주인 지갑 주소

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

---

## NFT Management

### 7. Mint NFT

세입자 NFT 발행

**Endpoint:** `POST /nft/mint`

**Request Body:**
```json
{
  "tenant": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "contractId": 0,
  "tokenURI": "ipfs://QmXxx..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12346
  }
}
```

### 8. Get NFTs by Owner

소유자의 모든 NFT 조회

**Endpoint:** `GET /nft/owner/:address`

**Parameters:**
- `address` (string): NFT 소유자 주소

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tokenId": 1,
      "tokenURI": "ipfs://QmXxx...",
      "contractId": 0,
      "owner": "0x..."
    }
  ],
  "count": 1
}
```

### 9. Get NFT by Token ID

특정 NFT 상세 조회

**Endpoint:** `GET /nft/:tokenId`

**Parameters:**
- `tokenId` (number): NFT 토큰 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": 1,
    "owner": "0x...",
    "tokenURI": "ipfs://QmXxx...",
    "contractId": 0
  }
}
```

---

## Landlord Verification

### 10. Verify Landlord

집주인 신원 검증

**Endpoint:** `POST /verifier/verify`

**Request Body:**
```json
{
  "landlord": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "propertyAddress": "서울시 강남구 테헤란로 123",
  "documentHash": "0x1234..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12347
  }
}
```

### 11. Check Verification Status

집주인 검증 상태 확인

**Endpoint:** `GET /verifier/status/:address`

**Parameters:**
- `address` (string): 집주인 주소

**Response:**
```json
{
  "success": true,
  "data": {
    "landlord": "0x...",
    "isVerified": true
  }
}
```

### 12. Get Verification Details

집주인 검증 상세 정보 조회

**Endpoint:** `GET /verifier/details/:address`

**Parameters:**
- `address` (string): 집주인 주소

**Response:**
```json
{
  "success": true,
  "data": {
    "landlord": "0x...",
    "isVerified": true,
    "propertyAddress": "서울시 강남구 테헤란로 123",
    "documentHash": "0x1234...",
    "verifiedAt": 1705305600
  }
}
```

---

## Deposit Vault

### 13. Deposit Funds

보증금 입금

**Endpoint:** `POST /vault/deposit`

**Request Body:**
```json
{
  "contractId": 0,
  "amount": "1.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12348
  }
}
```

### 14. Release Funds

보증금 인출 (집주인에게 지급)

**Endpoint:** `POST /vault/release/:contractId`

**Parameters:**
- `contractId` (number): 계약 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12349
  }
}
```

### 15. Refund Deposit

보증금 환불 (세입자에게 반환)

**Endpoint:** `POST /vault/refund/:contractId`

**Parameters:**
- `contractId` (number): 계약 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "blockNumber": 12350
  }
}
```

### 16. Get Deposit Info

보증금 정보 조회

**Endpoint:** `GET /vault/:contractId`

**Parameters:**
- `contractId` (number): 계약 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "contractId": 0,
    "amount": "1.0",
    "status": 1,
    "statusText": "DEPOSITED"
  }
}
```

**Deposit Status:**
- `0`: PENDING
- `1`: DEPOSITED
- `2`: RELEASED
- `3`: REFUNDED

---

## Error Responses

에러 발생 시 다음 형식으로 응답:

```json
{
  "success": false,
  "message": "Error message",
  "details": null
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

현재 rate limiting이 구현되어 있지 않습니다. 프로덕션 환경에서는 적절한 rate limiting을 추가하세요.

---

## Authentication

현재 인증이 구현되어 있지 않습니다. 프로덕션 환경에서는:
- API 키 인증
- JWT 토큰 인증
- OAuth 2.0
등을 고려하세요.

---

## CORS

CORS는 `.env` 파일의 `ALLOWED_ORIGINS`에서 설정할 수 있습니다:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

---

## Examples

### cURL 예제

```bash
# Health Check
curl http://localhost:3000/api/health

# 모든 계약 조회
curl http://localhost:3000/api/contracts

# 계약 생성
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

### JavaScript/TypeScript 예제

```typescript
// Fetch API
async function getAllContracts() {
  const response = await fetch('http://localhost:3000/api/contracts');
  const data = await response.json();
  return data.data;
}

// Axios
import axios from 'axios';

async function createContract(contractData) {
  const response = await axios.post(
    'http://localhost:3000/api/contracts',
    contractData
  );
  return response.data;
}
```

---

**Last Updated**: 2024-01-15
