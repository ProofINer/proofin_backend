import { ethers, Contract } from 'ethers';
import { getProvider, getWallet } from './provider';

// LandlordVerifier ABI
const LANDLORD_VERIFIER_ABI = [
  'function verifyLandlord(address landlord, string memory propertyAddress, string memory documentHash) external',
  'function isVerified(address landlord) external view returns (bool)',
  'function getVerificationDetails(address landlord) external view returns (tuple(bool isVerified, string propertyAddress, string documentHash, uint256 verifiedAt))',
  'event LandlordVerified(address indexed landlord, string propertyAddress, uint256 timestamp)'
];

export class LandlordVerifierContract {
  private contract: Contract;
  
  constructor() {
    const address = process.env.LANDLORD_VERIFIER_ADDRESS;
    if (!address) {
      throw new Error('LANDLORD_VERIFIER_ADDRESS is not defined');
    }
    
    const provider = getProvider();
    this.contract = new ethers.Contract(address, LANDLORD_VERIFIER_ABI, provider);
  }
  
  // 집주인 검증
  async verifyLandlord(
    landlord: string,
    propertyAddress: string,
    documentHash: string
  ) {
    const wallet = getWallet();
    if (!wallet) {
      throw new Error('Wallet not configured for signing transactions');
    }
    
    const contractWithSigner = this.contract.connect(wallet) as any;
    const tx = await contractWithSigner.verifyLandlord(
      landlord,
      propertyAddress,
      documentHash
    );
    
    const receipt = await tx.wait();
    return receipt;
  }
  
  // 검증 여부 확인
  async isVerified(landlord: string): Promise<boolean> {
    return await this.contract.isVerified(landlord);
  }
  
  // 검증 상세 정보 조회
  async getVerificationDetails(landlord: string) {
    const details = await this.contract.getVerificationDetails(landlord);
    return {
      isVerified: details.isVerified,
      propertyAddress: details.propertyAddress,
      documentHash: details.documentHash,
      verifiedAt: Number(details.verifiedAt)
    };
  }
}
