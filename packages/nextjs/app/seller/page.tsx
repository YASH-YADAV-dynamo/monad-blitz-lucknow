"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useContractWrite, useTransaction } from "wagmi";
import { CurrencyDollarIcon, ArrowLeftIcon, BanknotesIcon, ChartBarIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { notification } from "~~/utils/scaffold-eth";
import { useState } from "react";
import { formatEther } from "viem";

const SellerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Contract instance
  const { data: contract } = useScaffoldContract({
    contractName: "MonadPaymentSplitter",
  });

  // Contract reads
  const { data: totalReleased } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "totalReleased",
  });

  const { data: payeeCount } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "getPayeeCount",
  });

  // User-specific data
  const { data: userShares } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "shares",
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  const { data: userReleased } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "released",
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  const { data: pendingPayment } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "pendingPayment",
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  // Contract balance
  const { data: contractBalance } = useBalance({
    address: contract?.address,
  });

  // Withdraw function
  const { writeContract, data: withdrawData } = useContractWrite();

  // Wait for transaction
  const { isLoading: isTransactionLoading } = useTransaction({
    hash: withdrawData,
  });

  // Handle transaction success/error
  const handleTransactionSuccess = () => {
    notification.success("Funds withdrawn successfully!");
    setIsLoading(false);
  };

  const handleTransactionError = () => {
    notification.error("Withdrawal failed!");
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!connectedAddress || !contract) return;
    
    try {
      setIsLoading(true);
      await writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "release",
        args: [connectedAddress],
      });
    } catch (error) {
      console.error("Withdrawal error:", error);
      notification.error("Withdrawal failed!");
      setIsLoading(false);
    }
  };

  const isPayee = userShares && typeof userShares === 'bigint' && userShares > 0n;
  const canWithdraw = pendingPayment && typeof pendingPayment === 'bigint' && pendingPayment > 0n;

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" passHref className="btn btn-ghost btn-sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-3" />
              Seller Dashboard
            </h1>
          </div>

          {/* Connected Address */}
          {connectedAddress && (
            <div className="bg-base-200 p-4 rounded-lg mb-6">
              <p className="font-medium mb-2">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          )}

          {!connectedAddress && (
            <div className="bg-warning p-4 rounded-lg mb-6">
              <p className="text-center">Please connect your wallet to access seller features</p>
            </div>
          )}

          {/* Payee Status */}
          {connectedAddress && (
            <div className={`p-4 rounded-lg mb-6 ${isPayee ? 'bg-success/20' : 'bg-warning/20'}`}>
              <p className="font-medium">
                {isPayee ? "✅ You are a registered payee" : "⚠️ You are not a registered payee"}
              </p>
              {isPayee && userShares && typeof userShares === 'bigint' ? (
                <p className="text-sm mt-1">
                  Shares: {userShares.toString()} | 
                  Released: {userReleased && typeof userReleased === 'bigint' ? formatEther(userReleased) : "0"} MON
                </p>
              ) : null}
            </div>
          )}

          {/* Contract Information */}
          {contract && (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Contract Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-base-content/70">Contract Address</p>
                  <Address address={contract.address} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-base-content/70">Contract Balance</p>
                  <p className="text-lg font-bold">
                    {contractBalance ? formatEther(contractBalance.value) : "0"} MON
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-base-content/70">Total Payees</p>
                  <p className="text-lg font-bold">{payeeCount?.toString() || "0"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Withdraw Funds Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Withdraw Funds
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Pending Payment</span>
                  </label>
                  <div className="input input-bordered w-full bg-base-200">
                    {pendingPayment && typeof pendingPayment === 'bigint' ? formatEther(pendingPayment) : "0"} MON
                  </div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Your Shares</span>
                  </label>
                  <div className="input input-bordered w-full bg-base-200">
                    {userShares?.toString() || "0"}
                  </div>
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  disabled={!connectedAddress || isLoading || !isPayee || !canWithdraw}
                  onClick={handleWithdraw}
                >
                  {isLoading || isTransactionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Withdraw Funds"
                  )}
                </button>
                {!isPayee && (
                  <p className="text-sm text-warning">
                    You need to be a registered payee to withdraw funds.
                  </p>
                )}
                {isPayee && pendingPayment && typeof pendingPayment === 'bigint' && !canWithdraw ? (
                  <p className="text-sm text-base-content/70">
                    No pending payments available for withdrawal.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Payment Statistics Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Payment Statistics
              </h2>
              <div className="space-y-3">
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Released</span>
                    <span className="text-success">
                      {totalReleased && typeof totalReleased === 'bigint' ? formatEther(totalReleased) : "0"} MON
                    </span>
                  </div>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Your Released</span>
                    <span className="text-info">
                      {userReleased && typeof userReleased === 'bigint' ? formatEther(userReleased) : "0"} MON
                    </span>
                  </div>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Contract Balance</span>
                    <span className="text-warning">
                      {contractBalance ? formatEther(contractBalance.value) : "0"} MON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/contract" className="btn btn-outline">
                View Contract Details
              </Link>
              <Link href="/debug" className="btn btn-outline">
                Debug Contract
              </Link>
              <Link href="/blockexplorer" className="btn btn-outline">
                View Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerPage; 