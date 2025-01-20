const { ethers } = require('ethers');
require('dotenv').config();
import SERVICESUBSCRIPTIONSYSTEM from '../artifacts/contracts/subscription.sol/ServiceSubscriptionSystem.json'

const provider = new ethers.InfuraProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractABI = SERVICESUBSCRIPTIONSYSTEM.abi
const contractAddress = process.env.CONTRACT_ADDRESS;

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

module.exports = { provider, contract };
