const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  const Marketplace = await hre.ethers.getContractFactory("AgentMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const addr = await marketplace.getAddress();
  console.log("✅ AgentMarketplace deployed to:", addr);

  const explorer = hre.network.name === "base"
    ? `https://basescan.org/address/${addr}`
    : `https://sepolia.basescan.org/address/${addr}`;
  console.log("Explorer:", explorer);

  const result = { address: addr, network: hre.network.name, deployer: deployer.address, timestamp: new Date().toISOString(), explorer };
  fs.writeFileSync("deployed.json", JSON.stringify(result, null, 2));
  console.log("Saved to deployed.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
