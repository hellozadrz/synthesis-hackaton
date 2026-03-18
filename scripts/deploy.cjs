const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  const Marketplace = await hre.ethers.getContractFactory("AgentMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const addr = await marketplace.getAddress();
  console.log("AgentMarketplace deployed to:", addr);
  console.log("Verify: https://sepolia.basescan.org/address/" + addr);

  // Save address
  const fs = require("fs");
  fs.writeFileSync("deployed.json", JSON.stringify({ address: addr, network: hre.network.name, deployer: deployer.address, timestamp: new Date().toISOString() }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
