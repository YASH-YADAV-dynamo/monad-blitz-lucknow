"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useSendTransaction, useTransaction } from "wagmi";
import { ArrowLeftIcon, ClockIcon, CurrencyDollarIcon, ShoppingCartIcon, BanknotesIcon, UserGroupIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { notification } from "~~/utils/scaffold-eth";
import { useState } from "react";
import { parseEther, formatEther } from "viem";

const BuyerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupHash, setGroupHash] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Contract instance
  const { data: contract } = useScaffoldContract({
    contractName: "PaymentContract",
  });

  // Contract reads
  const { data: owner } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "owner",
  });

  // Contract balance
  const { data: contractBalance } = useBalance({
    address: contract?.address,
  });

  // Write contract hook
  const { writeContractAsync, isMining } = useScaffoldWriteContract("PaymentContract");

  // Send payment function
  const { sendTransaction, data: sendPaymentData } = useSendTransaction();

  // Wait for transaction
  const { isLoading: isTransactionLoading } = useTransaction({
    hash: sendPaymentData,
  });

  // Handle transaction success/error
  const handleTransactionSuccess = () => {
    notification.success("Transaction completed successfully!");
    setPaymentAmount("");
    setRecipientAddress("");
    setGroupName("");
    setFundAmount("");
    setMemberAddress("");
    setIsLoading(false);
  };

  const handleTransactionError = () => {
    notification.error("Transaction failed!");
    setIsLoading(false);
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || !recipientAddress || !writeContractAsync) {
      notification.error("Missing required fields or contract not ready");
      return;
    }
    
    try {
      setIsLoading(true);
      await writeContractAsync({
        functionName: "processPayment",
        args: [recipientAddress, parseEther(paymentAmount)],
        value: parseEther(paymentAmount),
      });
      handleTransactionSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      notification.error("Payment failed!");
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !writeContractAsync) {
      notification.error("Missing group name or contract not ready");
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await writeContractAsync({
        functionName: "createGroup",
        args: [groupName],
      });
      console.log("Group created:", result);
      notification.success("Group created successfully!");
      setGroupName("");
      setIsLoading(false);
    } catch (error) {
      console.error("Group creation error:", error);
      notification.error("Group creation failed!");
      setIsLoading(false);
    }
  };

  const handleAddToGroup = async () => {
    if (!groupHash || !memberAddress || !writeContractAsync) {
      notification.error("Missing required fields or contract not ready");
      return;
    }
    
    try {
      setIsLoading(true);
      await writeContractAsync({
        functionName: "addToGroup",
        args: [groupHash, memberAddress],
      });
      notification.success("Member added to group successfully!");
      setMemberAddress("");
      setIsLoading(false);
    } catch (error) {
      console.error("Add member error:", error);
      notification.error("Failed to add member to group!");
      setIsLoading(false);
    }
  };

  const handleAddFundsToGroup = async () => {
    if (!groupHash || !fundAmount || !writeContractAsync) {
      notification.error("Missing required fields or contract not ready");
      return;
    }
    
    try {
      setIsLoading(true);
      await writeContractAsync({
        functionName: "addFundsToGroup",
        args: [groupHash],
        value: parseEther(fundAmount),
      });
      notification.success("Funds added to group successfully!");
      setFundAmount("");
      setIsLoading(false);
    } catch (error) {
      console.error("Add funds error:", error);
      notification.error("Failed to add funds to group!");
      setIsLoading(false);
    }
  };

  // Check if any write operation is pending
  const isAnyPending = isMining || isLoading;

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-sm text-base-content/70">Contract Owner</p>
                  {owner ? (
                    <p className="font-mono text-sm">{owner}</p>
                  ) : (
                    <p className="text-sm text-base-content/50">Loading...</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-base-content/70">Your Address</p>
                  {connectedAddress ? (
                    <Address address={connectedAddress} />
                  ) : (
                    <p className="text-sm text-base-content/50">Not connected</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process Payment Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Process Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Recipient Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input input-bordered w-full"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
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
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  disabled={!connectedAddress || isAnyPending || !paymentAmount || !recipientAddress || !writeContractAsync}
                  onClick={handleProcessPayment}
                >
                  {isMining ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Process Payment"
                  )}
                </button>
                <p className="text-sm text-base-content/70">
                  Send a direct payment to any address through the contract.
                </p>
              </div>
            </div>

            {/* Group Management Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Group Management
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Group Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="My Group"
                    className="input input-bordered w-full"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <button 
                  className="btn btn-secondary w-full" 
                  disabled={!connectedAddress || isAnyPending || !groupName || !writeContractAsync}
                  onClick={handleCreateGroup}
                >
                  {isMining ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Group
                    </>
                  )}
                </button>
                <p className="text-sm text-base-content/70">
                  Create a new payment group for collaborative payments.
                </p>
              </div>
            </div>

            {/* Add Member to Group */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4">Add Member to Group</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Group Hash</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input input-bordered w-full"
                    value={groupHash}
                    onChange={(e) => setGroupHash(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Member Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input input-bordered w-full"
                    value={memberAddress}
                    onChange={(e) => setMemberAddress(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <button 
                  className="btn btn-outline w-full" 
                  disabled={!connectedAddress || isAnyPending || !groupHash || !memberAddress || !writeContractAsync}
                  onClick={handleAddToGroup}
                >
                  {isMining ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Member"
                  )}
                </button>
              </div>
            </div>

            {/* Add Funds to Group */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4">Add Funds to Group</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Group Hash</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input input-bordered w-full"
                    value={groupHash}
                    onChange={(e) => setGroupHash(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Amount (MON)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered w-full"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <button 
                  className="btn btn-accent w-full" 
                  disabled={!connectedAddress || isAnyPending || !groupHash || !fundAmount || !writeContractAsync}
                  onClick={handleAddFundsToGroup}
                >
                  {isMining ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Funds"
                  )}
                </button>
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
