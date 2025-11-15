import { ethers, Contract } from 'ethers';
import { getProvider, getWallet } from './provider';

// ProofIn ABI (메인 컨트랙트)
const PROOFIN_ABI = [
  'function initializeContracts(address _tenantNFT, address _verifier, address _vault) external',
  'function createContract(address tenant, address landlord, uint256 depositAmount, string memory propertyAddress, uint256 startDate, uint256 endDate) external returns (uint256)',
  'function getContractDetails(uint256 contractId) external view returns (tuple(address tenant, address landlord, uint256 depositAmount, string propertyAddress, uint256 startDate, uint256 endDate, uint8 status, uint256 createdAt))',
  'function getAllContracts() external view returns (uint256[])',
  'function getContractsByTenant(address tenant) external view returns (uint256[])',
  'function getContractsByLandlord(address landlord) external view returns (uint256[])',
  'event ContractCreated(uint256 indexed contractId, address indexed tenant, address indexed landlord, uint256 depositAmount)'
];

export class ProofInContract {
  private contract: Contract;
  
  constructor() {
    const address = process.env.PROOFIN_ADDRESS;
    if (!address) {
      throw new Error('PROOFIN_ADDRESS is not defined');
    }
    
    const provider = getProvider();
    this.contract = new ethers.Contract(address, PROOFIN_ABI, provider);
  }
  
  // 계약 생성
  async createContract(
    tenant: string,
    landlord: string,
    depositAmount: string,
    propertyAddress: string,
    startDate: number,
    endDate: number
  ) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.createContract(
      tenant,
      landlord,
      ethers.parseEther(depositAmount),
      propertyAddress,
      startDate,
      endDate
    );
    
    const receipt = await tx.wait();
    return receipt;
  }
  
  // 계약 상세 정보 조회
  async getContractDetails(contractId: number) {
    const details = await this.contract.getContractDetails(contractId);
    return {
      tenant: details.tenant,
      landlord: details.landlord,
      depositAmount: ethers.formatEther(details.depositAmount),
      propertyAddress: details.propertyAddress,
      startDate: Number(details.startDate),
      endDate: Number(details.endDate),
      status: Number(details.status),
      createdAt: Number(details.createdAt)
    };
  }
  
  // 모든 계약 ID 조회
  async getAllContracts() {
    const contracts = await this.contract.getAllContracts();
    return contracts.map((id: bigint) => Number(id));
  }
  
  // 세입자별 계약 조회
  async getContractsByTenant(tenant: string) {
    const contracts = await this.contract.getContractsByTenant(tenant);
    return contracts.map((id: bigint) => Number(id));
  }
  
  // 집주인별 계약 조회
  async getContractsByLandlord(landlord: string) {
    const contracts = await this.contract.getContractsByLandlord(landlord);
    return contracts.map((id: bigint) => Number(id));
  }
}
