import { ethers, Contract } from 'ethers';
import { getProvider, getWallet } from './provider';

// TenantNFT ABI
const TENANT_NFT_ABI = [
  'function mintNFT(address tenant, uint256 contractId, string memory tokenURI) external returns (uint256)',
  'function getTokensByOwner(address owner) external view returns (uint256[])',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function getContractIdByToken(uint256 tokenId) external view returns (uint256)',
  'event NFTMinted(uint256 indexed tokenId, address indexed tenant, uint256 indexed contractId)'
];

export class TenantNFTContract {
  private contract: Contract;
  
  constructor() {
    const address = process.env.TENANT_NFT_ADDRESS;
    if (!address) {
      throw new Error('TENANT_NFT_ADDRESS is not defined');
    }
    
    const provider = getProvider();
    this.contract = new ethers.Contract(address, TENANT_NFT_ABI, provider);
  }
  
  // NFT 발행
  async mintNFT(tenant: string, contractId: number, tokenURI: string) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.mintNFT(tenant, contractId, tokenURI);
    const receipt = await tx.wait();
    
    return receipt;
  }
  
  // 소유자의 NFT 목록 조회
  async getTokensByOwner(owner: string) {
    const tokens = await this.contract.getTokensByOwner(owner);
    return tokens.map((id: bigint) => Number(id));
  }
  
  // NFT 메타데이터 URI 조회
  async getTokenURI(tokenId: number) {
    return await this.contract.tokenURI(tokenId);
  }
  
  // NFT 소유자 조회
  async getOwnerOf(tokenId: number) {
    return await this.contract.ownerOf(tokenId);
  }
  
  // NFT에 연결된 계약 ID 조회
  async getContractIdByToken(tokenId: number) {
    const contractId = await this.contract.getContractIdByToken(tokenId);
    return Number(contractId);
  }
}
