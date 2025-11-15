import { Router, Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';

const router = Router();
const profileService = new ProfileService();

// 프로필 조회 (test-api.js 호환: /:role/:address)
router.get('/:role/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, role } = req.params;
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const profile = profileService.getProfile(address, role as 'tenant' | 'landlord');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// 프로필 생성 (test-api.js 호환: POST /:role/:address)
router.post('/:role/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, role } = req.params;
    const { name, email, phone, profileImage, settings } = req.body;
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const profile = profileService.createProfile({
      address,
      role: role as 'tenant' | 'landlord',
      name,
      email,
      phone,
      profileImage,
      settings
    });
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// 프로필 생성 (레거시 경로: POST /)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, role, name, email, phone, profileImage } = req.body;
    
    if (!address || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address, role'
      });
    }
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const profile = profileService.createProfile({
      address,
      role,
      name,
      email,
      phone,
      profileImage
    });
    
    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// 프로필 업데이트 (test-api.js 호환: PUT /:role/:address)
router.put('/:role/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, role } = req.params;
    const { name, email, phone, profileImage, settings } = req.body;
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const profile = profileService.updateProfile(
      address,
      role as 'tenant' | 'landlord',
      { name, email, phone, profileImage, settings }
    );
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

// 역할별 프로필 목록 조회
router.get('/role/:role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.params;
    
    if (role !== 'tenant' && role !== 'landlord') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const profiles = profileService.getProfilesByRole(role as 'tenant' | 'landlord');
    
    res.json({
      success: true,
      data: profiles,
      count: profiles.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
