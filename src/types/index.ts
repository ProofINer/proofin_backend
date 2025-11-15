// Type definitions

// User and Authentication Types
export interface User {
  address: string;
  role: 'tenant' | 'landlord';
  createdAt: number;
  lastLogin: number;
}

export interface UserProfile {
  address: string;
  name?: string;
  email?: string;
  phone?: string;
  role: 'tenant' | 'landlord';
  verified: boolean;
  profileImage?: string;
  settings?: {
    notifications?: boolean;
    language?: string;
    [key: string]: any;
  };
  createdAt: number;
  updatedAt: number;
}

export interface AuthRequest {
  address: string;
  signature: string;
  message: string;
  role: 'tenant' | 'landlord';
}

export interface Session {
  address: string;
  role: 'tenant' | 'landlord';
  token: string;
  expiresAt: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'CONTRACT_CREATED' | 'CONTRACT_VERIFIED' | 'NFT_MINTED' | 'DEPOSIT_RECEIVED' | 'CONTRACT_COMPLETED';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

// Contract Types
export interface ContractData {
  tenant: string;
  landlord: string;
  depositAmount: string;
  propertyAddress: string;
  startDate: number;
  endDate: number;
  status: number;
  createdAt: number;
}

export interface NFTData {
  tokenId: number;
  owner: string;
  tokenURI: string;
  contractId: number;
}

export interface VerificationData {
  isVerified: boolean;
  propertyAddress: string;
  documentHash: string;
  verifiedAt: number;
}

export interface DepositData {
  contractId: number;
  amount: string;
  status: number;
  statusText: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface TransactionReceipt {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
}

// Contract Status Enum
export enum ContractStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

// Notification Type Enum
export enum NotificationType {
  CONTRACT_CREATED = 'CONTRACT_CREATED',
  CONTRACT_VERIFIED = 'CONTRACT_VERIFIED',
  NFT_MINTED = 'NFT_MINTED',
  DEPOSIT_RECEIVED = 'DEPOSIT_RECEIVED',
  CONTRACT_COMPLETED = 'CONTRACT_COMPLETED'
}

