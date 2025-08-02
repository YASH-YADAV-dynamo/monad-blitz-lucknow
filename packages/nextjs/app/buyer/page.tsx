"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead, useSendTransaction, useTransaction } from "wagmi";
import { ArrowLeftIcon, CurrencyDollarIcon, UserGroupIcon, BanknotesIcon, ShoppingCartIcon, PlusIcon, CheckIcon, BellIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { notification } from "~~/utils/scaffold-eth";
import { NotificationManager } from "~~/utils/notificationUtils";
import { generateGroupHash } from "~~/utils/groupHashUtils";
import { useContractEvents } from "~~/hooks/useContractEvents";
import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";

interface Friend {
  address: string;
  name: string;
  share: number;
}

const BuyerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendAddress, setNewFriendAddress] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupHash, setGroupHash] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Initialize contract event listeners
  useContractEvents();

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
  const { writeContractAsync, isMining, data: writeData } = useScaffoldWriteContract("PaymentContract");

  // Send transaction hook
  const { sendTransaction, data: sendTransactionData } = useSendTransaction();

  // Wait for transaction
  const { isLoading: isTransactionLoading } = useTransaction({
    hash: sendTransactionData,
  });



  // Handle transaction success/error
  const handleTransactionSuccess = () => {
    notification.success("Payment completed successfully!");
    setPaymentCompleted(true);
    setIsLoading(false);
    setCurrentStep(3); // Move to add friends step
  };

  const handleTransactionError = () => {
    notification.error("Payment failed!");
    setIsLoading(false);
  };

  const handleProcessPayment = async () => {
    if (!paymentAmount || !recipientAddress || !contract) {
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
    if (!groupName || !writeContractAsync || !connectedAddress) {
      notification.error("Missing group name or contract not ready");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create the group
      const result = await writeContractAsync({
        functionName: "createGroup",
        args: [groupName],
      });
      console.log("Group created successfully", result);
      notification.success("Group created successfully!");
      
      // Calculate the group hash using the same method as the contract
      const groupHash = generateGroupHash(groupName, connectedAddress);
      console.log("Generated group hash:", groupHash);
      setGroupHash(groupHash);
      
      // Move to next step
      setCurrentStep(4);
      setIsLoading(false);
    } catch (error) {
      console.error("Group creation error:", error);
      notification.error("Group creation failed!");
      setIsLoading(false);
    }
  };

  const handleAddFriend = () => {
    if (!newFriendAddress || !newFriendName) {
      notification.error("Please enter friend's address and name");
      return;
    }

    const totalFriends = friends.length + 1;
    const sharePerPerson = parseFloat(paymentAmount) / totalFriends;

    const newFriend: Friend = {
      address: newFriendAddress,
      name: newFriendName,
      share: sharePerPerson,
    };

    setFriends([...friends, newFriend]);
    setNewFriendAddress("");
    setNewFriendName("");
    notification.success("Friend added to split!");
  };

  const handleRemoveFriend = (index: number) => {
    const updatedFriends = friends.filter((_, i) => i !== index);
    setFriends(updatedFriends);
    
    // Recalculate shares
    const totalPeople = updatedFriends.length + 1;
    const sharePerPerson = parseFloat(paymentAmount) / totalPeople;
    
    const updatedFriendsWithShares = updatedFriends.map(friend => ({
      ...friend,
      share: sharePerPerson,
    }));
    
    setFriends(updatedFriendsWithShares);
  };

  const handleSplitBill = async () => {
    console.log("Split bill called with:", { groupHash, friends: friends.length, splitAmount });
    if (!groupHash || friends.length === 0 || !splitAmount) {
      notification.error("Please create a group, add friends, and enter split amount");
      return;
    }

    try {
      setIsLoading(true);
      
      // Add each friend to the group
      // Note: Creator is automatically added when group is created
      for (const friend of friends) {
        await writeContractAsync({
          functionName: "addToGroup",
          args: [groupHash as `0x${string}`, friend.address],
        });
      }

      // Add funds to group
      await writeContractAsync({
        functionName: "addFundsToGroup",
        args: [groupHash as `0x${string}`],
        value: parseEther(splitAmount),
      });

      // Create split requests for each friend using contract events
      const splitAmountPerPerson = parseFloat(splitAmount) / (friends.length + 1);
      for (const friend of friends) {
        await writeContractAsync({
          functionName: "createSplitRequest",
          args: [
            groupHash as `0x${string}`, 
            friend.address, 
            parseEther(splitAmountPerPerson.toFixed(4)),
            `Split request from ${recipientName}`
          ],
        });
      }

      notification.success("Bill split successfully! Friends have been notified.");
      setCurrentStep(5); // Move to completion step
      setIsLoading(false);
    } catch (error) {
      console.error("Split bill error:", error);
      notification.error("Failed to split bill!");
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && paymentAmount && recipientAddress) {
      setCurrentStep(2);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if any write operation is pending
  const isAnyPending = isMining || isLoading || isTransactionLoading;



  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="px-5 w-full max-w-4xl mx-auto pt-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" passHref className="btn btn-ghost btn-sm text-white hover:bg-white/10">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center text-white">
              <ShoppingCartIcon className="h-8 w-8 mr-3" />
              Pay & Split
            </h1>
          </div>

          {/* Connected Address */}
          {connectedAddress && (
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-6 border border-white/20">
              <p className="font-medium mb-2 text-purple-200">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          )}

          {!connectedAddress && (
            <div className="bg-yellow-500/20 backdrop-blur-sm p-4 rounded-lg mb-6 border border-yellow-500/30">
              <p className="text-center text-yellow-200">Please connect your wallet to access payment features</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-300' : 'text-purple-200/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-white/20'}`}>
                  1
                </div>
                <span className="hidden sm:inline text-white">Enter Details</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-white/20'}`}></div>
              <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-300' : 'text-purple-200/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-white/20'}`}>
                  2
                </div>
                <span className="hidden sm:inline text-white">Pay</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-purple-600' : 'bg-white/20'}`}></div>
              <div className={`flex items-center ${currentStep >= 3 ? 'text-purple-300' : 'text-purple-200/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-white/20'}`}>
                  3
                </div>
                <span className="hidden sm:inline text-white">Split</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-purple-600' : 'bg-white/20'}`}></div>
              <div className={`flex items-center ${currentStep >= 4 ? 'text-purple-300' : 'text-purple-200/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 4 ? 'bg-purple-600 text-white' : 'bg-white/20'}`}>
                  4
                </div>
                <span className="hidden sm:inline text-white">Complete</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3">
                  1
                </div>
                <h2 className="text-xl font-bold text-white">Enter Payment Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-purple-200">Recipient Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter recipient name"
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-purple-300"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-purple-200">Recipient Wallet Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-purple-300"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-purple-200">Payment Amount (MON)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-purple-300"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    disabled={!connectedAddress || isAnyPending}
                  />
                </div>
                <button 
                  className="btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold w-full" 
                  disabled={!connectedAddress || isAnyPending || !paymentAmount || !recipientAddress || !recipientName}
                  onClick={handleNextStep}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center mr-3">
                  2
                </div>
                <h2 className="text-xl font-bold">Confirm Payment</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-base-200 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <span className="font-mono">{recipientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <Address address={recipientAddress} />
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold">{paymentAmount} MON</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-outline flex-1" 
                    onClick={handleBackStep}
                  >
                    Back
                  </button>
                  <button 
                    className="btn btn-primary flex-1" 
                    disabled={!connectedAddress || isAnyPending || !contract}
                    onClick={handleProcessPayment}
                  >
                    {isMining ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Pay Now"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-success text-success-content rounded-full flex items-center justify-center mr-3">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Payment Successful!</h2>
              </div>
              <div className="space-y-4">
                                 <div className="bg-success/10 p-4 rounded-lg border border-success">
                   <p className="text-success font-medium">
                     ✅ Payment of {paymentAmount} MON sent to {recipientName}
                   </p>
                 </div>
                 {groupHash && (
                   <div className="bg-warning/10 p-3 rounded-lg border border-warning">
                     <p className="text-warning font-medium">
                       Current Group Hash: {groupHash}
                     </p>
                   </div>
                 )}
                                 <div>
                   <label className="label">
                     <span className="label-text">Group Name for Split</span>
                   </label>
                   <input
                     type="text"
                     placeholder="e.g., Dinner Split, Movie Tickets"
                     className="input input-bordered w-full"
                     value={groupName}
                     onChange={(e) => setGroupName(e.target.value)}
                     disabled={!connectedAddress || isAnyPending}
                   />
                 </div>
                 <div>
                   <label className="label">
                     <span className="label-text">Total Split Amount (MON)</span>
                   </label>
                   <input
                     type="number"
                     placeholder="0.0"
                     className="input input-bordered w-full"
                     value={splitAmount}
                     onChange={(e) => setSplitAmount(e.target.value)}
                     disabled={!connectedAddress || isAnyPending}
                   />
                 </div>
                 <button 
                   className="btn btn-secondary w-full" 
                   disabled={!connectedAddress || isAnyPending || !groupName || !splitAmount || !writeContractAsync}
                   onClick={handleCreateGroup}
                 >
                   {isMining ? (
                     <span className="loading loading-spinner loading-sm"></span>
                   ) : (
                     "Create Split Group"
                   )}
                 </button>
              </div>
            </div>
          )}

                     {currentStep === 4 && (
             <div className="bg-base-100 p-6 rounded-lg border border-base-300">
               <div className="flex items-center mb-4">
                 <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center mr-3">
                   3
                 </div>
                 <h2 className="text-xl font-bold">Add Friends to Split</h2>
               </div>
               {groupHash && (
                 <div className="bg-info/10 p-3 rounded-lg border border-info mb-4">
                   <p className="text-info font-medium">
                     Group Hash: {groupHash}
                   </p>
                 </div>
               )}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Friend's Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter friend's name"
                      className="input input-bordered w-full"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      disabled={!connectedAddress || isAnyPending}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Friend's Wallet Address</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="input input-bordered w-full"
                      value={newFriendAddress}
                      onChange={(e) => setNewFriendAddress(e.target.value)}
                      disabled={!connectedAddress || isAnyPending}
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-outline w-full" 
                  disabled={!connectedAddress || isAnyPending || !newFriendAddress || !newFriendName}
                  onClick={handleAddFriend}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Friend
                </button>

                {friends.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold">Friends in Split ({friends.length + 1} people total)</h3>
                    <div className="space-y-2">
                      {friends.map((friend, index) => (
                        <div key={index} className="bg-base-200 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <Address address={friend.address} />
                            <p className="text-sm text-base-content/70">Share: {friend.share.toFixed(4)} MON</p>
                          </div>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleRemoveFriend(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                                         <div className="bg-info/10 p-3 rounded-lg border border-info">
                       <p className="text-info font-medium">
                         Total Split Amount: {splitAmount} MON | Per Person: {(parseFloat(splitAmount) / (friends.length + 1)).toFixed(4)} MON
                       </p>
                     </div>
                    <button 
                      className="btn btn-primary w-full" 
                      disabled={!connectedAddress || isAnyPending || friends.length === 0}
                      onClick={handleSplitBill}
                    >
                      {isMining ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>
                          <BellIcon className="w-4 h-4 mr-2" />
                          Split Bill & Notify Friends
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-success text-success-content rounded-full flex items-center justify-center mr-3">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Split Complete!</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-success/10 p-4 rounded-lg border border-success">
                  <p className="text-success font-medium">
                    ✅ Bill split successfully! All friends have been notified.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Split Summary</h3>
                                     <div className="bg-base-200 p-3 rounded-lg">
                     <p><strong>Original Payment:</strong> {paymentAmount} MON to {recipientName}</p>
                     <p><strong>Total Split Amount:</strong> {splitAmount} MON</p>
                     <p><strong>Split Amount:</strong> {(parseFloat(splitAmount) / (friends.length + 1)).toFixed(4)} MON per person</p>
                     <p><strong>Friends Notified:</strong> {friends.length}</p>
                   </div>
                </div>
                <button 
                  className="btn btn-primary w-full" 
                                     onClick={() => {
                     setCurrentStep(1);
                     setPaymentAmount("");
                     setSplitAmount("");
                     setRecipientAddress("");
                     setRecipientName("");
                     setGroupName("");
                     setFriends([]);
                     setPaymentCompleted(false);
                   }}
                >
                  Start New Split
                </button>
              </div>
            </div>
          )}

          
        </div>
      </div>
    </>
  );
};

export default BuyerPage;
