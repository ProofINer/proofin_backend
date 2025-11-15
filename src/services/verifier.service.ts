import { LandlordVerifierContract } from '../contracts/LandlordVerifierContract';
import { TenantNFTContract } from '../contracts/TenantNFTContract';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class VerifierService {
  private verifierContract: LandlordVerifierContract;
  private nftContract: TenantNFTContract;
  
  constructor() {
    this.verifierContract = new LandlordVerifierContract();
    this.nftContract = new TenantNFTContract();
  }
  
  // 집주인 검증 (검증 후 NFT 자동 발행)
  async verifyLandlord(data: {
    landlord: string;
    propertyAddress: string;
    documentHash: string;
    tenantAddress?: string;
    contractId?: number;
    autoMintNFT?: boolean;
  }) {
    try {
      // 1. 집주인 검증
      const receipt = await this.verifierContract.verifyLandlord(
        data.landlord,
        data.propertyAddress,
        data.documentHash
      );
      
      // 2. 세입자에게 검증 완료 알림
      if (data.tenantAddress) {
        notificationService.notifyContractVerified(
          data.tenantAddress,
          data.contractId || 0
        );
      }
      
      // 3. NFT 자동 발행 (autoMintNFT가 true인 경우)
      let nftResult = null;
      if (data.autoMintNFT && data.tenantAddress && data.contractId !== undefined) {
        try {
          const tokenURI = `ipfs://contract-${data.contractId}`;
          const nftReceipt = await this.nftContract.mintNFT(
            data.tenantAddress,
            data.contractId,
            tokenURI
          );
          
          nftResult = {
            transactionHash: nftReceipt.hash,
            blockNumber: nftReceipt.blockNumber
          };
          
          // NFT 발행 알림
          notificationService.notifyNFTMinted(
            data.tenantAddress,
            1, // tokenId는 실제로는 receipt에서 추출해야 함
            data.contractId
          );
        } catch (nftError: any) {
          console.error('NFT minting failed:', nftError.message);
        }
      }
      
      return {
        success: true,
        verification: {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber
        },
        nft: nftResult
      };
    } catch (error: any) {
      throw new Error(`Failed to verify landlord: ${error.message}`);
    }
  }
  
  // 검증 여부 확인
  async checkVerificationStatus(landlord: string) {
    try {
      const isVerified = await this.verifierContract.isVerified(landlord);
      
      return {
        landlord,
        isVerified
      };
    } catch (error: any) {
      throw new Error(`Failed to check verification status: ${error.message}`);
    }
  }
  
  // 검증 상세 정보 조회
  async getVerificationDetails(landlord: string) {
    try {
      const details = await this.verifierContract.getVerificationDetails(landlord);
      
      return {
        landlord,
        ...details
      };
    } catch (error: any) {
      throw new Error(`Failed to get verification details: ${error.message}`);
    }
  }
}
