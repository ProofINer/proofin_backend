import { DepositVaultContract } from '../contracts/DepositVaultContract';

export class VaultService {
  private vaultContract: DepositVaultContract;
  
  constructor() {
    this.vaultContract = new DepositVaultContract();
  }
  
  // 보증금 입금
  async depositFunds(data: {
    contractId: number;
    amount: string;
  }) {
    try {
      const receipt = await this.vaultContract.depositFunds(
        data.contractId,
        data.amount
      );
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Failed to deposit funds: ${error.message}`);
    }
  }
  
  // 보증금 인출 (집주인에게 지급)
  async releaseFunds(contractId: number) {
    try {
      const receipt = await this.vaultContract.releaseFunds(contractId);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Failed to release funds: ${error.message}`);
    }
  }
  
  // 보증금 환불 (세입자에게 반환)
  async refundDeposit(contractId: number) {
    try {
      const receipt = await this.vaultContract.refundDeposit(contractId);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Failed to refund deposit: ${error.message}`);
    }
  }
  
  // 보증금 정보 조회
  async getDepositInfo(contractId: number) {
    try {
      const amount = await this.vaultContract.getDepositAmount(contractId);
      const status = await this.vaultContract.getDepositStatus(contractId);
      
      return {
        contractId,
        amount,
        status,
        statusText: this.getStatusText(status)
      };
    } catch (error: any) {
      throw new Error(`Failed to get deposit info: ${error.message}`);
    }
  }
  
  // 상태 텍스트 변환
  private getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'PENDING',
      1: 'DEPOSITED',
      2: 'RELEASED',
      3: 'REFUNDED'
    };
    
    return statusMap[status] || 'UNKNOWN';
  }
}
