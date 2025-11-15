# 스마트 컨트랙트 프로젝트에서
npx hardhat run scripts/deploy.ts --network sepolia

# .env 자동 설정
npm run update-env deployment-info.json

# 개발 모드
npm run dev

# 프로덕션
npm run build
npm start

# 읽기 전용 API 테스트 (가스비 없음)
npm test

# 트랜잭션 포함 전체 테스트 (가스비 소모)
npm run test:tx
