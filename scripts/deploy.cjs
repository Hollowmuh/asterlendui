require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    // Retrieve deployer's private key from .env
    const deployerPrivateKey = process.env.PRIVATE_KEY;
    if (!deployerPrivateKey) {
        throw new Error("Please set your PRIVATE_KEY in a .env file");
    }

    const alchemyApiKey = process.env.INFURA_API_KEY;
    if (!alchemyApiKey) {
        throw new Error("Please set your PROJECT_ID in a .env file");
    }

    // Configure provider and wallet
    const provider = new ethers.InfuraProvider("sepolia", alchemyApiKey);
    const wallet = new ethers.Wallet(deployerPrivateKey, provider);
    // const uniswapRouter = process.env.UNISWAP_ROUTER_ADDRESS;
    // const uniswapFactory = process.env.UNISWAP_FACTORY_ADDRESS;
    // const ngnaAddress = process.env.NGNATOKEN_ADDRESS;
    // const daiAddress = process.env.DAITOKEN_ADDRESS;
    const usdtAddress = process.env.USDTTOKEN_ADDRESS;

    // Get the contract factoryProjectId
    const collateral = await ethers.getContractFactory("CollateralManager", wallet);
    const Marketplace = await ethers.getContractFactory("P2PLendingMarketplace", wallet);

    console.log("Deploying collateral Manager contract...");

    // Deploy the contract
    const CollateralManager = await collateral.deploy();
    console.log("Collateral manager deployed")
    await CollateralManager.waitForDeployment();
    console.log("Collateral Manager deployed to: ",await CollateralManager.getAddress());
    const marketplace = await Marketplace.deploy(usdtAddress, CollateralManager.getAddress());
    console.log("Marketplace deployed")
    await marketplace.waitForDeployment();
    console.log("Marketplace deployed to: ",await marketplace.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
