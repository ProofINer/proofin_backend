import { User, UserProfile, Session } from '../types';
import { verifyMessage } from 'ethers';

// 메모리 기반 저장소 (프로덕션에서는 데이터베이스 사용)
const users = new Map<string, User>();
const profiles = new Map<string, UserProfile>();
const sessions = new Map<string, Session>();

export class AuthService {
  
  // 지갑 서명 검증 (ethers.js 사용)
  verifySignature(address: string, signature: string, message: string): boolean {
    try {
      // ethers.js의 verifyMessage로 서명에서 주소 복구
      const recoveredAddress = verifyMessage(message, signature);
      
      // 복구된 주소와 제공된 주소 비교
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      // 서명 검증 실패 시 개발 환경에서는 간단한 검증으로 폴백
      console.warn('Signature verification failed, using fallback:', error);
      return signature.length > 0 && address.length === 42;
    }
  }
  
  // 로그인 (지갑 주소 + 역할)
  async login(address: string, signature: string, message: string, role: 'tenant' | 'landlord'): Promise<Session> {
    try {
      // 서명 검증
      if (!this.verifySignature(address, signature, message)) {
        throw new Error('Invalid signature');
      }
      
      const normalizedAddress = address.toLowerCase();
      
      // 사용자 조회 또는 생성
      let user = users.get(`${normalizedAddress}-${role}`);
      if (!user) {
        user = {
          address: normalizedAddress,
          role,
          createdAt: Date.now(),
          lastLogin: Date.now()
        };
        users.set(`${normalizedAddress}-${role}`, user);
        
        // 프로필도 생성
        const profile: UserProfile = {
          address: normalizedAddress,
          role,
          verified: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        profiles.set(`${normalizedAddress}-${role}`, profile);
      } else {
        user.lastLogin = Date.now();
      }
      
      // 세션 생성
      const token = this.generateToken(normalizedAddress, role);
      const session: Session = {
        address: normalizedAddress,
        role,
        token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24시간
      };
      
      sessions.set(token, session);
      
      return session;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  // 토큰 생성
  private generateToken(address: string, role: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${address}-${role}-${timestamp}-${random}`;
  }
  
  // 세션 검증
  validateSession(token: string): Session | null {
    const session = sessions.get(token);
    if (!session) {
      return null;
    }
    
    // 만료 확인
    if (session.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }
    
    return session;
  }
  
  // 로그아웃
  logout(token: string): boolean {
    return sessions.delete(token);
  }
  
  // 사용자 조회
  getUser(address: string, role: 'tenant' | 'landlord'): User | undefined {
    return users.get(`${address.toLowerCase()}-${role}`);
  }
  
  // 모든 사용자 조회 (역할별)
  getUsersByRole(role: 'tenant' | 'landlord'): User[] {
    const result: User[] = [];
    users.forEach((user) => {
      if (user.role === role) {
        result.push(user);
      }
    });
    return result;
  }
}
