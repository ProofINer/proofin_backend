import { Router, Request, Response, NextFunction } from 'express';
import { VerifierService } from '../services/verifier.service';

const router = Router();
const verifierService = new VerifierService();

// 집주인 검증 (및 NFT 자동 발행)
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      landlord, 
      propertyAddress, 
      documentHash,
      tenantAddress,
      contractId,
      autoMintNFT = true // 기본값: 자동 발행
    } = req.body;
    
    if (!landlord || !propertyAddress || !documentHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: landlord, propertyAddress, documentHash'
      });
    }
    
    const result = await verifierService.verifyLandlord({
      landlord,
      propertyAddress,
      documentHash,
      tenantAddress,
      contractId,
      autoMintNFT
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 검증 상태 확인
router.get('/status/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Landlord address is required'
      });
    }
    
    const status = await verifierService.checkVerificationStatus(address);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

// 검증 상세 정보 조회
router.get('/details/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Landlord address is required'
      });
    }
    
    const details = await verifierService.getVerificationDetails(address);
    
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    next(error);
  }
});

export default router;
