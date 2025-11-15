import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
        role: 'tenant' | 'landlord';
        token: string;
      };
    }
  }
}

// JWT 인증 미들웨어
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide Bearer token.'
      });
      return;
    }
    
    // Bearer 토큰 추출
    const token = authHeader.substring(7);
    
    // 세션 검증
    const session = authService.validateSession(token);
    
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }
    
    // 사용자 정보를 request에 추가
    req.user = {
      address: session.address,
      role: session.role,
      token: session.token
    };
    
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: `Authentication error: ${error.message}`
    });
  }
}

// 역할 기반 접근 제어 미들웨어
export function authorize(...allowedRoles: Array<'tenant' | 'landlord'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }
    
    next();
  };
}

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 진행)
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = authService.validateSession(token);
    
    if (session) {
      req.user = {
        address: session.address,
        role: session.role,
        token: session.token
      };
    }
  }
  
  next();
}
