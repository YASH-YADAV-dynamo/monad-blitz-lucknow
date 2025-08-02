import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" (MonadPaymentSplitter) using the deployer account and
 * constructor arguments set to example payees and shares
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Example payees and shares for the PaymentSplitter
  // You can modify these addresses and shares as needed
  const payees = [deployer]; // For testing, just use the deployer as the only payee
  const shares = [100]; // 100% share for the deployer

  await deploy("MonadPaymentSplitter", {
    from: deployer,
    // Contract constructor arguments for MonadPaymentSplitter
    args: [payees, shares],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const yourContract = await hre.ethers.getContract<Contract>("MonadPaymentSplitter", deployer);
  console.log("✅ MonadPaymentSplitter deployed successfully!");
  console.log("📋 Contract address:", await yourContract.getAddress());
  console.log("👤 Owner:", await yourContract.owner());
  console.log("💰 Total shares:", await yourContract.totalShares());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
