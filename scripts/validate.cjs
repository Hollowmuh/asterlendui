require("dotenv").config();
const { ethers } = require("hardhat");
const { zeroAddress } = require("viem");

async function main() {
    try {
        // Environment variable validation
        const requiredEnvVars = [
            'PRIVATE_KEY',
            'DAITOKEN_ADDRESS',
            'USDTTOKEN_ADDRESS',
            'NGNATOKEN_ADDRESS',
            'INFURA_API_KEY',
            'COLLATERAL_MANAGER_ADDRESS',
            'MARKETPLACE_ADDRESS'
        ];

        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }

        // Setup provider and wallet
        const provider = new ethers.InfuraProvider("sepolia", process.env.INFURA_API_KEY);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        // Contract initialization
        const managerABI = require("../artifacts/contracts/p2pCollateral.sol/CollateralManager.json").abi;
        const collateralManager = new ethers.Contract(
            process.env.COLLATERAL_MANAGER_ADDRESS,
            managerABI,
            wallet
        );
        const tx = await collateralManager.setMarketplace(process.env.MARKETPLACE_ADDRESS);
                
        const receipt = await tx.wait();
        console.log(
            `Successfully configured Marketplace ${receipt.hash}`
        );
    }
        catch (error) {
        console.error("Script failed:", error.message);
        process.exit(1);
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });