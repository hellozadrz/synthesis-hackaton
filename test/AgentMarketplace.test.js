const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentMarketplace", function () {
  let marketplace, usdc, weth, owner, agent1, agent2;

  beforeEach(async () => {
    [owner, agent1, agent2] = await ethers.getSigners();
    
    // Deploy mock tokens
    const ERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await ERC20.deploy("USDC", "USDC", 6);
    weth = await ERC20.deploy("WETH", "WETH", 18);
    
    // Deploy marketplace
    const Marketplace = await ethers.getContractFactory("AgentMarketplace");
    marketplace = await Marketplace.deploy();
    
    // Fund agents
    await usdc.mint(agent1.address, ethers.parseUnits("1000", 6));
    await weth.mint(agent2.address, ethers.parseEther("1"));
  });

  it("should create and match an offer atomically", async () => {
    const sellAmt = ethers.parseUnits("100", 6); // 100 USDC
    const buyAmt = ethers.parseEther("0.05");    // 0.05 WETH

    // Agent1 creates offer
    await usdc.connect(agent1).approve(marketplace.target, sellAmt);
    await marketplace.connect(agent1).createOffer(
      usdc.target, weth.target, sellAmt, buyAmt, 86400
    );

    // Agent2 matches
    await weth.connect(agent2).approve(marketplace.target, buyAmt);
    await marketplace.connect(agent2).matchOffer(1);

    // Check balances
    expect(await usdc.balanceOf(agent2.address)).to.equal(sellAmt);
    expect(await weth.balanceOf(agent1.address)).to.equal(buyAmt);
    
    // Check reputation
    expect(await marketplace.reputation(agent1.address)).to.equal(1n);
    expect(await marketplace.reputation(agent2.address)).to.equal(1n);
  });

  it("should allow cancelling an open offer", async () => {
    const sellAmt = ethers.parseUnits("100", 6);
    await usdc.connect(agent1).approve(marketplace.target, sellAmt);
    await marketplace.connect(agent1).createOffer(
      usdc.target, weth.target, sellAmt, ethers.parseEther("0.05"), 86400
    );
    
    const balBefore = await usdc.balanceOf(agent1.address);
    await marketplace.connect(agent1).cancelOffer(1);
    const balAfter = await usdc.balanceOf(agent1.address);
    
    expect(balAfter - balBefore).to.equal(sellAmt);
  });
});
