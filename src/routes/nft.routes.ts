import { Router, Request, Response, NextFunction } from 'express';
import { NFTService } from '../services/nft.service';

const router = Router();
const nftService = new NFTService();

// NFT 발행
router.post('/mint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant, contractId, tokenURI } = req.body;
    
    if (!tenant || !contractId || !tokenURI) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tenant, contractId, tokenURI'
      });
    }
    
    const result = await nftService.mintNFT({
      tenant,
      contractId: Number(contractId),
      tokenURI
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 소유자별 NFT 조회
router.get('/owner/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Owner address is required'
      });
    }
    
    const tokens = await nftService.getTokensByOwner(address);
    
    res.json({
      success: true,
      data: tokens,
      count: tokens.length
    });
  } catch (error) {
    next(error);
  }
});

// 특정 NFT 조회
router.get('/:tokenId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenId = Number(req.params.tokenId);
    
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID'
      });
    }
    
    const token = await nftService.getTokenDetails(tokenId);
    
    res.json({
      success: true,
      data: token
    });
  } catch (error) {
    next(error);
  }
});

export default router;
