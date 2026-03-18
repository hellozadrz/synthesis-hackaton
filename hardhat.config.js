require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");
const path = require("path");

// Load .env
try {
  fs.readFileSync(path.resolve(__dirname, "../trading/.env"), "utf8")
    .split("\n").forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
} catch(e) {}

module.exports = {
  solidity: "0.8.24",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.ETH_BOT_KEY],
      chainId: 84532,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.ETH_BOT_KEY],
      chainId: 8453,
    },
  },
};
