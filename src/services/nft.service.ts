import { TenantNFTContract } from '../contracts/TenantNFTContract';

export class NFTService {
  private nftContract: TenantNFTContract;
  
  constructor() {
    this.nftContract = new TenantNFTContract();
  }
  
  // NFT 발행
  async mintNFT(data: {
    tenant: string;
    contractId: number;
    tokenURI: string;
  }) {
    try {
      const receipt = await this.nftContract.mintNFT(
        data.tenant,
        data.contractId,
        data.tokenURI
      );
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }
  
  // 소유자의 NFT 목록 조회
  async getTokensByOwner(owner: string) {
    try {
      const tokenIds = await this.nftContract.getTokensByOwner(owner);
      
      // 각 NFT의 메타데이터를 가져옴
      const tokens = await Promise.all(
        tokenIds.map(async (tokenId: number) => {
          const tokenURI = await this.nftContract.getTokenURI(tokenId);
          const contractId = await this.nftContract.getContractIdByToken(tokenId);
          
          return {
            tokenId,
            tokenURI,
            contractId,
            owner
          };
        })
      );
      
      return tokens;
    } catch (error: any) {
      throw new Error(`Failed to get tokens by owner: ${error.message}`);
    }
  }
  
  // NFT 상세 정보 조회
  async getTokenDetails(tokenId: number) {
    try {
      const owner = await this.nftContract.getOwnerOf(tokenId);
      const tokenURI = await this.nftContract.getTokenURI(tokenId);
      const contractId = await this.nftContract.getContractIdByToken(tokenId);
      
      return {
        tokenId,
        owner,
        tokenURI,
        contractId
      };
    } catch (error: any) {
      throw new Error(`Failed to get token details: ${error.message}`);
    }
  }
  
  // 계약 ID로 NFT 조회
  async getTokenByContractId(contractId: number) {
    try {
      // 모든 토큰을 조회하고 해당 계약 ID와 매칭되는 토큰 찾기
      // (실제 컨트랙트에 역방향 매핑이 있다면 더 효율적)
      return {
        contractId,
        message: 'Use getTokensByOwner to find tokens for specific contract'
      };
    } catch (error: any) {
      throw new Error(`Failed to get token by contract: ${error.message}`);
    }
  }
}
