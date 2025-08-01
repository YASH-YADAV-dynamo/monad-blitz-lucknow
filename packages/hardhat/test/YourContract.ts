import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract (MonadPaymentSplitter)", function () {
  // We define a fixture to reuse the same setup in every test.
  let yourContract: YourContract;
  let owner: any;
  let payee1: any;
  let payee2: any;

  before(async () => {
    [owner, payee1, payee2] = await ethers.getSigners();

    // Create payees and shares arrays
    const payees = [payee1.address, payee2.address];
    const shares = [60, 40]; // 60% for payee1, 40% for payee2

    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(payees, shares)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should have the correct owner", async function () {
      expect(await yourContract.owner()).to.equal(owner.address);
    });

    it("Should have the correct total shares", async function () {
      expect(await yourContract.totalShares()).to.equal(100);
    });

    it("Should have the correct payees", async function () {
      expect(await yourContract.payee(0)).to.equal(payee1.address);
      expect(await yourContract.payee(1)).to.equal(payee2.address);
    });

    it("Should have the correct shares for each payee", async function () {
      expect(await yourContract.shares(payee1.address)).to.equal(60);
      expect(await yourContract.shares(payee2.address)).to.equal(40);
    });
  });

  describe("Payment Functionality", function () {
    it("Should accept payments and emit PaymentReceived event", async function () {
      const paymentAmount = ethers.parseEther("1.0");

      await expect(
        owner.sendTransaction({
          to: await yourContract.getAddress(),
          value: paymentAmount,
        }),
      )
        .to.emit(yourContract, "PaymentReceived")
        .withArgs(owner.address, paymentAmount);
    });

    it("Should allow payees to release their shares", async function () {
      // First send some ETH to the contract
      const paymentAmount = ethers.parseEther("1.0");
      await owner.sendTransaction({
        to: await yourContract.getAddress(),
        value: paymentAmount,
      });

      // Get initial balances
      const initialBalance1 = await ethers.provider.getBalance(payee1.address);
      const initialBalance2 = await ethers.provider.getBalance(payee2.address);

      // Release shares
      await yourContract.connect(payee1).release(payee1.address);
      await yourContract.connect(payee2).release(payee2.address);

      // Check that payees received their shares
      const finalBalance1 = await ethers.provider.getBalance(payee1.address);
      const finalBalance2 = await ethers.provider.getBalance(payee2.address);

      // payee1 should receive 60% of 1 ETH = 0.6 ETH
      expect(finalBalance1 - initialBalance1).to.equal(ethers.parseEther("0.6"));
      // payee2 should receive 40% of 1 ETH = 0.4 ETH
      expect(finalBalance2 - initialBalance2).to.equal(ethers.parseEther("0.4"));
    });
  });
});
