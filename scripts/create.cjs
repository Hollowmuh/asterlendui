require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    try {
        // Validate environment variables
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

        // Get environment variables
        const {
            PRIVATE_KEY: deployerPrivateKey,
            DAITOKEN_ADDRESS: daiTokenAddress,
            USDTTOKEN_ADDRESS: usdtTokenAddress,
            NGNATOKEN_ADDRESS: ngnaTokenAddress,
            INFURA_API_KEY: infuraApiKey,
            COLLATERAL_MANAGER_ADDRESS: collateralManagerAddress,
            MARKETPLACE_ADDRESS: marketplaceAddress
        } = process.env;

        // Configure the provider using Infura
        const provider = new ethers.InfuraProvider("sepolia", infuraApiKey);
        const wallet = new ethers.Wallet(deployerPrivateKey, provider);

        // Get contract artifacts
        const marketplaceABI = require("../artifacts/contracts/p2plendMarketplace.sol/P2PLendingMarketplace.json").abi;
        const managerABI = require("../artifacts/contracts/p2pCollateral.sol/CollateralManager.json").abi;

        // Initialize contracts
        const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, wallet);
        const collateralManager = new ethers.Contract(collateralManagerAddress, managerABI, wallet);

        console.log("Setting token statuses in marketplace...");

        // Set token statuses with proper error handling
        const tokens = [
            { address: usdtTokenAddress, name: 'USDT' },
            { address: daiTokenAddress, name: 'DAI' },
            { address: ngnaTokenAddress, name: 'NGNA' }
        ];

        for (const token of tokens) {
            try {
                const tx = await marketplace.setTokenStatus(token.address, true);
                await tx.wait();
                console.log(`Successfully enabled ${token.name} token at address: ${token.address}`);
            } catch (error) {
                console.error(`Failed to enable ${token.name} token:`, error.message);
            }
        }

        console.log("Token setup completed successfully!");

    } catch (error) {
        console.error("Script failed:", error.message);
        process.exit(1);
    }
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });