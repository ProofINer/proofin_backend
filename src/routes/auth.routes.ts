import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();
const authService = new AuthService();

// 로그인
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, signature, message, role } = req.body;
    
    if (!address || !signature || !message || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address, signature, message, role'
      });
    }
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be tenant or landlord'
      });
    }
    
    const session = await authService.login(address, signature, message, role);
    
    res.json({
      success: true,
      sessionId: session.token,  // test-api.js가 기대하는 필드
      token: session.token,       // Bearer 인증용
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// 세션 검증
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    const session = authService.validateSession(token);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
});

// 로그아웃
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    const success = authService.logout(token);
    
    res.json({
      success,
      message: success ? 'Logged out successfully' : 'Token not found'
    });
  } catch (error) {
    next(error);
  }
});

// 사용자 정보 조회
router.get('/user/:address/:role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, role } = req.params;
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = authService.getUser(address, role as 'tenant' | 'landlord');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
