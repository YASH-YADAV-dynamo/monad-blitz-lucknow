import { ethers } from "ethers";

async function main() {
  // Your private key from the config
  const privateKey = "5ce8ddf021851aa660d62f81dfbe5b05c96a7f62c5924426b420418c70b31f14";

  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey);
  console.log("👤 Account address:", wallet.address);

  // Connect to Monad Testnet
  const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz/");

  // Get balance
  const balance = await provider.getBalance(wallet.address);
  const balanceInEth = ethers.formatEther(balance);

  console.log("💰 Balance:", balanceInEth, "MON");

  if (balance === 0n) {
    console.log("❌ No balance found! You need MON tokens to deploy.");
    console.log("🔗 Get testnet MON from: https://testnet.monad.xyz/");
  } else {
    console.log("✅ You have sufficient balance to deploy!");
  }
}

main().catch(console.error);
