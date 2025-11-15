import { ethers } from 'ethers';

export const getProvider = (): ethers.JsonRpcProvider => {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error('RPC_URL is not defined in environment variables');
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getWallet = (): ethers.Wallet | null => {
  const privateKey = process.env.BACKEND_PRIVATE_KEY;
  if (!privateKey) {
    console.warn('⚠️ BACKEND_PRIVATE_KEY is not set. Transaction signing will not be available.');
    return null;
  }
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};
