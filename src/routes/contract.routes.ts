import { Router, Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service';

const router = Router();
const contractService = new ContractService();

// 계약 생성 (tenant만 가능)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant, landlord, depositAmount, propertyAddress, startDate, endDate, role } = req.body;
    
    // 입력값 검증
    if (!tenant || !landlord || !depositAmount || !propertyAddress || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // tenant만 계약 생성 가능
    if (role && role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can create contracts'
      });
    }
    
    const result = await contractService.createContract({
      tenant,
      landlord,
      depositAmount,
      propertyAddress,
      startDate: Number(startDate),
      endDate: Number(endDate)
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// 계약 업데이트 (tenant만 가능)
router.put('/:contractId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId } = req.params;
    const { role, propertyAddress, startDate, endDate } = req.body;
    
    // tenant만 업데이트 가능
    if (role && role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Only tenants can update contracts'
      });
    }
    
    if (isNaN(Number(contractId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID'
      });
    }
    
    // 실제로는 스마트 컨트랙트에 업데이트 함수가 있어야 함
    // 현재는 조회 후 응답만 반환
    const contract = await contractService.getContractDetails(Number(contractId));
    
    res.json({
      success: true,
      data: contract,
      message: 'Contract update functionality requires smart contract support'
    });
  } catch (error) {
    next(error);
  }
});

// 모든 계약 조회
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contracts = await contractService.getAllContracts();
    
    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });
  } catch (error) {
    next(error);
  }
});

// 특정 계약 조회
router.get('/:contractId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.contractId);
    
    if (isNaN(contractId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contract ID'
      });
    }
    
    const contract = await contractService.getContractDetails(contractId);
    
    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    next(error);
  }
});

// 세입자별 계약 조회
router.get('/tenant/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Tenant address is required'
      });
    }
    
    const contracts = await contractService.getContractsByTenant(address);
    
    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });
  } catch (error) {
    next(error);
  }
});

// 집주인별 계약 조회
router.get('/landlord/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Landlord address is required'
      });
    }
    
    const contracts = await contractService.getContractsByLandlord(address);
    
    res.json({
      success: true,
      data: contracts,
      count: contracts.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
