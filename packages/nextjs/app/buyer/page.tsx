"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useContractWrite, useTransaction } from "wagmi";
import { ArrowLeftIcon, ClockIcon, CurrencyDollarIcon, ShoppingCartIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { notification } from "~~/utils/scaffold-eth";
import { useState } from "react";
import { parseEther, formatEther } from "viem";

const BuyerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Contract instance
  const { data: contract } = useScaffoldContract({
    contractName: "MonadPaymentSplitter",
  });

  // Contract reads
  const { data: totalShares } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "totalShares",
  });

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

  // Contract balance
  const { data: contractBalance } = useBalance({
    address: contract?.address,
  });

  // Send payment function
  const { writeContract, data: sendPaymentData } = useContractWrite();

  // Wait for transaction
  const { isLoading: isTransactionLoading } = useTransaction({
    hash: sendPaymentData,
  });

  // Handle transaction success/error
  const handleTransactionSuccess = () => {
    notification.success("Payment sent successfully!");
    setPaymentAmount("");
    setIsLoading(false);
  };

  const handleTransactionError = () => {
    notification.error("Payment failed!");
    setIsLoading(false);
  };

  const handleSendPayment = async () => {
    if (!paymentAmount || !contract) return;
    
    try {
      setIsLoading(true);
      await writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "receive",
        value: parseEther(paymentAmount),
      });
    } catch (error) {
      console.error("Payment error:", error);
      notification.error("Payment failed!");
      setIsLoading(false);
    }
  };

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
              <ShoppingCartIcon className="h-8 w-8 mr-3" />
              Buyer Dashboard
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
              <p className="text-center">Please connect your wallet to access buyer features</p>
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
                  <p className="text-sm text-base-content/70">Total Shares</p>
                  <p className="text-lg font-bold">{totalShares?.toString() || "0"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Payment Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Send Payment to Contract
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Payment Amount (MON)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered w-full"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={!connectedAddress || isLoading}
                  />
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  disabled={!connectedAddress || isLoading || !paymentAmount}
                  onClick={handleSendPayment}
                >
                  {isLoading || isTransactionLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Send Payment"
                  )}
                </button>
                <p className="text-sm text-base-content/70">
                  This will send MON tokens to the payment splitter contract. 
                  Payees can then withdraw their share of the payments.
                </p>
              </div>
            </div>

            {/* Contract Stats Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Contract Statistics
              </h2>
              <div className="space-y-3">
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Released</span>
                    <span className="text-success">
                      {totalReleased && typeof totalReleased === 'bigint' && totalReleased > 0n ? formatEther(totalReleased) : "0"} MON
                    </span>
                  </div>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Number of Payees</span>
                    <span className="text-info">{payeeCount?.toString() || "0"}</span>
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

export default BuyerPage;
