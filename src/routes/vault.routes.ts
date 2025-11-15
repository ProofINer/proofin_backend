import { Router, Request, Response, NextFunction } from 'express';
import { VaultService } from '../services/vault.service';

const router = Router();
const vaultService = new VaultService();

// 보증금 입금
router.post('/deposit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId, amount } = req.body;
    
    if (!contractId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: contractId, amount'
      });
    }
    
    const result = await vaultService.depositFunds({
      contractId: Number(contractId),
      amount
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 보증금 인출 (집주인에게 지급)
router.post('/release/:contractId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.contractId);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID'
      });
    }
    
    const result = await vaultService.releaseFunds(contractId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 보증금 환불 (세입자에게 반환)
router.post('/refund/:contractId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.contractId);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID'
      });
    }
    
    const result = await vaultService.refundDeposit(contractId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 보증금 정보 조회
router.get('/:contractId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.contractId);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID'
      });
    }
    
    const depositInfo = await vaultService.getDepositInfo(contractId);
    
    res.json({
      success: true,
      data: depositInfo
    });
  } catch (error) {
    next(error);
  }
});

export default router;
