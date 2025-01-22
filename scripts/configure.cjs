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

        // Token configuration data
        const tokenConfigs = [
            {
                address: process.env.DAITOKEN_ADDRESS,
                name: 'DAI',
                priceFeed: '0x14866185B1962B63C3Ea9E03Bc1da838bab34C19',
                decimals: 18
            },
            {
                address: process.env.USDTTOKEN_ADDRESS,
                name: 'USDT',
                priceFeed: '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E',
                decimals: 18
            },
            {
                address: zeroAddress,
                name: 'ETH',
                priceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
                decimals: 18
            },
            {
                address: process.env.NGNATOKEN_ADDRESS,
                name: 'NGNA',
                priceFeed: '0xdaF4e3B98b0577B409c4ccBC3cc6ca1B7220c476',
                decimals: 18
            }
        ];

        console.log("Configuring tokens in CollateralManager...");

        // Configure each token
        for (const token of tokenConfigs) {
            try {
                console.log(`Configuring ${token.name}...`);
                const tx = await collateralManager.configureToken(
                    token.address,
                    token.priceFeed,
                    token.decimals
                );
                
                const receipt = await tx.wait();
                console.log(
                    `Successfully configured ${token.name}:`,
                    `\n  Token: ${token.address}`,
                    `\n  Price Feed: ${token.priceFeed}`,
                    `\n  Transaction: ${receipt.hash}`
                );
            } catch (error) {
                console.error(`Failed to configure ${token.name}:`, error.message);
                // Continue with other tokens even if one fails
            }
        }

        console.log("Token configuration completed!");

    } catch (error) {
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