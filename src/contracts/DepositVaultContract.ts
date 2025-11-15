import { ethers, Contract } from 'ethers';
import { getProvider, getWallet } from './provider';

// DepositVault ABI
const DEPOSIT_VAULT_ABI = [
  'function depositFunds(uint256 contractId) external payable',
  'function releaseFunds(uint256 contractId) external',
  'function refundDeposit(uint256 contractId) external',
  'function getDepositAmount(uint256 contractId) external view returns (uint256)',
  'function getDepositStatus(uint256 contractId) external view returns (uint8)',
  'event FundsDeposited(uint256 indexed contractId, address indexed depositor, uint256 amount)',
  'event FundsReleased(uint256 indexed contractId, address indexed recipient, uint256 amount)',
  'event FundsRefunded(uint256 indexed contractId, address indexed recipient, uint256 amount)'
];

export class DepositVaultContract {
  private contract: Contract;
  
  constructor() {
    const address = process.env.DEPOSIT_VAULT_ADDRESS;
    if (!address) {
      throw new Error('DEPOSIT_VAULT_ADDRESS is not defined');
    }
    
    const provider = getProvider();
    this.contract = new ethers.Contract(address, DEPOSIT_VAULT_ABI, provider);
  }
  
  // 보증금 입금
  async depositFunds(contractId: number, amount: string) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.depositFunds(contractId, {
      value: ethers.parseEther(amount)
    });
    
    const receipt = await tx.wait();
    return receipt;
  }
  
  // 보증금 인출 (집주인에게 지급)
  async releaseFunds(contractId: number) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.releaseFunds(contractId);
    const receipt = await tx.wait();
    
    return receipt;
  }
  
  // 보증금 환불 (세입자에게 반환)
  async refundDeposit(contractId: number) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.refundDeposit(contractId);
    const receipt = await tx.wait();
    
    return receipt;
  }
  
  // 보증금 금액 조회
  async getDepositAmount(contractId: number) {
    const amount = await this.contract.getDepositAmount(contractId);
    return ethers.formatEther(amount);
  }
  
  // 보증금 상태 조회
  async getDepositStatus(contractId: number) {
    const status = await this.contract.getDepositStatus(contractId);
    return Number(status);
  }
}
