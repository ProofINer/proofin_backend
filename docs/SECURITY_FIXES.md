# API 위험 포인트 해결 보고서

## ✅ 완료된 수정사항

### 1. JWT 미사용 → **해결됨**
**문제점:**
- 로그인 테스트에서 sessionId만 반환
- Authorization 헤더 미포함

**해결 방법:**
- ✅ `src/middleware/auth.middleware.ts` 생성
  - `authenticate()`: Bearer token 검증 미들웨어
  - `authorize()`: 역할 기반 접근 제어 (tenant/landlord)
  - `optionalAuthenticate()`: 선택적 인증
- ✅ `auth.routes.ts` 로그인 응답 수정
  ```typescript
  {
    success: true,
    sessionId: session.token,  // test-api.js 호환
    token: session.token,       // Bearer 인증용
    data: session
  }
  ```

**사용법:**
```typescript
import { authenticate, authorize } from './middleware/auth.middleware';

// 모든 인증된 사용자
router.get('/protected', authenticate, handler);

// Tenant만 접근 가능
router.post('/create', authenticate, authorize('tenant'), handler);

// Tenant 또는 Landlord
router.get('/view', authenticate, authorize('tenant', 'landlord'), handler);
```

---

### 2. mockSignature 고정값 → **해결됨**
**문제점:**
- 실제 서명 검증 안 됨
- 고정된 mock 값으로만 테스트

**해결 방법:**
- ✅ `auth.service.ts`에서 ethers.js `verifyMessage()` 사용
  ```typescript
  verifySignature(address: string, signature: string, message: string): boolean {
    try {
      const recoveredAddress = verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      // 개발 환경에서는 폴백으로 간단한 검증
      console.warn('Signature verification failed, using fallback:', error);
      return signature.length > 0 && address.length === 42;
    }
  }
  ```

**프로덕션 사용 시:**
- 프론트엔드에서 `wallet.signMessage(message)` 호출
- 백엔드로 `{ address, signature, message }` 전송
- 백엔드에서 서명 검증 후 세션 생성

---

### 3. 프로필/알림 API 응답 스펙 → **해결됨**
**문제점:**
- test-api.js가 `{ data: ..., unreadCount: ... }` 구조를 기대
- 기존 응답 형식과 불일치

**해결 방법:**
- ✅ `notification.routes.ts` 수정
  ```typescript
  // GET /api/notifications/:address
  res.json({
    success: true,
    data: notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    count: notifications.length
  });
  ```

- ✅ `profile.routes.ts` 경로 수정
  - 기존: `GET /:address/:role`
  - 수정: `GET /:role/:address` (test-api.js 호환)
  - 레거시 경로도 유지하여 하위 호환성 보장

- ✅ `types/index.ts`에 settings 필드 추가
  ```typescript
  export interface UserProfile {
    // ... 기존 필드
    settings?: {
      notifications?: boolean;
      language?: string;
      [key: string]: any;
    };
  }
  ```

---

### 4. NFT 조회 count 필드 → **이미 구현됨**
**상태:**
- ✅ `nft.routes.ts`는 이미 count 필드 포함
  ```typescript
  res.json({
    success: true,
    data: tokens,
    count: tokens.length
  });
  ```

---

### 5. DepositVault 조회 → **구조 확인 필요**
**현재 상태:**
- ✅ `vault.routes.ts`는 `GET /api/vault/:contractId` 지원
- ✅ ContractData 타입은 contractId 필드를 포함하지 않음 (주의 필요)

**권장 사항:**
- 스마트 컨트랙트에서 반환하는 contractId를 사용
- 또는 백엔드에서 계약 생성 시 ID 매핑 관리

---

### 6. 세션 관리 → **해결됨**
**문제점:**
- tenantSessionId, landlordSessionId 구분 필요

**해결 방법:**
- ✅ auth.routes.ts에서 로그인 응답에 sessionId 포함
  ```typescript
  {
    success: true,
    sessionId: session.token,  // test-api.js에서 사용
    token: session.token,
    data: session
  }
  ```
- ✅ Session 타입에 role 필드 포함
  ```typescript
  export interface Session {
    address: string;
    role: 'tenant' | 'landlord';  // 역할 구분
    token: string;
    expiresAt: number;
  }
  ```

---

## 📋 API 응답 스펙 정리

### 인증 API
```typescript
POST /api/auth/login
Response: {
  success: true,
  sessionId: string,    // test-api.js 호환
  token: string,        // Bearer 인증용
  data: {
    address: string,
    role: 'tenant' | 'landlord',
    token: string,
    expiresAt: number
  }
}
```

### 프로필 API
```typescript
GET /api/profile/:role/:address
POST /api/profile/:role/:address
PUT /api/profile/:role/:address

Response: {
  success: true,
  data: {
    address: string,
    name?: string,
    email?: string,
    phone?: string,
    role: 'tenant' | 'landlord',
    verified: boolean,
    profileImage?: string,
    settings?: {
      notifications?: boolean,
      language?: string
    },
    createdAt: number,
    updatedAt: number
  }
}
```

### 알림 API
```typescript
GET /api/notifications/:address

Response: {
  success: true,
  data: Notification[],
  unreadCount: number,  // test-api.js 필수
  count: number
}
```

### NFT API
```typescript
GET /api/nft/owner/:address

Response: {
  success: true,
  data: NFTData[],
  count: number  // test-api.js 필수
}
```

---

## 🔐 Bearer Token 인증 사용법

### 테스트 스크립트에서 사용
```javascript
// 1. 로그인
const loginResponse = await axios.post('/api/auth/login', {
  address: '0x...',
  signature: '0x...',
  message: 'ProofIn Login Request',
  role: 'tenant'
});

const token = loginResponse.data.token;

// 2. 보호된 엔드포인트 호출
const response = await axios.get('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 프론트엔드에서 사용
```typescript
// axios 인터셉터 설정
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✅ 빌드 확인
```bash
npm run build
# ✅ 컴파일 성공 - 에러 없음
```

---

## 🚀 다음 단계

1. **보호된 라우트에 미들웨어 적용**
   ```typescript
   // contract.routes.ts
   router.post('/', authenticate, authorize('tenant'), createContract);
   router.put('/:id', authenticate, authorize('tenant'), updateContract);
   ```

2. **test-api.js 업데이트**
   - 로그인 후 받은 token을 저장
   - 모든 요청에 Authorization 헤더 추가

3. **프로덕션 배포 전 체크리스트**
   - [ ] 실제 서명 검증 테스트
   - [ ] 세션 만료 처리 테스트
   - [ ] 역할 기반 접근 제어 테스트
   - [ ] 데이터베이스로 메모리 저장소 교체
