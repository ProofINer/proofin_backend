import { ProofInContract } from '../contracts/ProofInContract';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class ContractService {
  private proofInContract: ProofInContract;
  
  constructor() {
    this.proofInContract = new ProofInContract();
  }
  
  // 계약 생성 (tenant만 가능)
  async createContract(data: {
    tenant: string;
    landlord: string;
    depositAmount: string;
    propertyAddress: string;
    startDate: number;
    endDate: number;
  }) {
    try {
      const receipt = await this.proofInContract.createContract(
        data.tenant,
        data.landlord,
        data.depositAmount,
        data.propertyAddress,
        data.startDate,
        data.endDate
      );
      
      // 집주인에게 알림 전송
      notificationService.notifyContractCreated(
        data.landlord,
        0, // contractId는 실제로는 receipt에서 추출해야 함
        data.tenant
      );
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Failed to create contract: ${error.message}`);
    }
  }
  
  // 계약 상세 정보 조회
  async getContractDetails(contractId: number) {
    try {
      const details = await this.proofInContract.getContractDetails(contractId);
      return details;
    } catch (error: any) {
      throw new Error(`Failed to get contract details: ${error.message}`);
    }
  }
  
  // 모든 계약 조회
  async getAllContracts() {
    try {
      const contractIds = await this.proofInContract.getAllContracts();
      
      // 각 계약의 상세 정보를 가져옴
      const contracts = await Promise.all(
        contractIds.map(async (id: number) => {
          const details = await this.proofInContract.getContractDetails(id);
          return { contractId: id, ...details };
        })
      );
      
      return contracts;
    } catch (error: any) {
      throw new Error(`Failed to get all contracts: ${error.message}`);
    }
  }
  
  // 세입자별 계약 조회
  async getContractsByTenant(tenant: string) {
    try {
      const contractIds = await this.proofInContract.getContractsByTenant(tenant);
      
      const contracts = await Promise.all(
        contractIds.map(async (id: number) => {
          const details = await this.proofInContract.getContractDetails(id);
          return { contractId: id, ...details };
        })
      );
      
      return contracts;
    } catch (error: any) {
      throw new Error(`Failed to get contracts by tenant: ${error.message}`);
    }
  }
  
  // 집주인별 계약 조회
  async getContractsByLandlord(landlord: string) {
    try {
      const contractIds = await this.proofInContract.getContractsByLandlord(landlord);
      
      const contracts = await Promise.all(
        contractIds.map(async (id: number) => {
          const details = await this.proofInContract.getContractDetails(id);
          return { contractId: id, ...details };
        })
      );
      
      return contracts;
    } catch (error: any) {
      throw new Error(`Failed to get contracts by landlord: ${error.message}`);
    }
  }
}
