import { ethers } from 'ethers';
import P2PLendingMARKETPLACE from '@/artifacts/contracts/p2plendMarketplace.sol/P2PLendingMarketplace.json'

export function web3provider {
    const provider = new ethers.InfuraProvider(import.meta.env.VITE_API_KEY);
    const wallet = new ethers.Wallet(import.meta.env.VITE_PRIVATE_KEY, provider);

    const contractABI = P2PLendingMARKETPLACE.abi
    const contractAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS;

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

}