"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { 
  ArrowLeftIcon, 
  UserIcon, 
  BellIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { notification } from "~~/utils/scaffold-eth";
import { NotificationManager, type Notification } from "~~/utils/notificationUtils";
import { useNotifications } from "~~/hooks/useNotifications";
import { useContractEvents } from "~~/hooks/useContractEvents";
import { useState } from "react";
import { parseEther, formatEther } from "viem";



interface PendingSplit {
  groupHash: string;
  groupName: string;
  totalAmount: string;
  myShare: string;
  participants: string[];
  createdBy: string;
  createdAt: number;
}

const ProfilePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { notifications, unreadCount, pendingCount, markAsRead, markAsCompleted, clearAll } = useNotifications();
  const [pendingSplits, setPendingSplits] = useState<PendingSplit[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'splits'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize contract event listeners
  useContractEvents();

  // Contract instance
  const { data: contract } = useScaffoldContract({
    contractName: "PaymentContract",
  });

  // User balance
  const { data: userBalance } = useBalance({
    address: connectedAddress,
  });

  // Write contract hook
  const { writeContractAsync, isMining } = useScaffoldWriteContract("PaymentContract");



  // Handle paying for a split
  const handlePaySplit = async (splitNotification: Notification) => {
    if (!writeContractAsync || !connectedAddress) {
      notification.error("Contract not ready or wallet not connected");
      return;
    }

    try {
      setIsLoading(true);
      
      // Add funds to the group
      await writeContractAsync({
        functionName: "addFundsToGroup",
        args: [splitNotification.groupHash as `0x${string}`],
        value: parseEther(splitNotification.amount),
      });

      notification.success("Payment sent successfully!");
      markAsCompleted(splitNotification.id);
      
      // Create a payment received notification for the original payer
      NotificationManager.createPaymentReceivedNotification(
        splitNotification.from,
        splitNotification.groupHash,
        splitNotification.amount,
        connectedAddress || ''
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      notification.error("Payment failed!");
      setIsLoading(false);
    }
  };



  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="px-5 w-full max-w-6xl mx-auto pt-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" passHref className="btn btn-ghost btn-sm text-white hover:bg-white/10">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center text-white">
              <UserIcon className="h-8 w-8 mr-3" />
              Profile & Notifications
            </h1>
          </div>

          {!connectedAddress && (
            <div className="bg-yellow-500/20 backdrop-blur-sm p-4 rounded-lg mb-6 border border-yellow-500/30">
              <p className="text-center text-yellow-200">Please connect your wallet to view your profile</p>
            </div>
          )}

          {connectedAddress && (
            <>
              {/* Tab Navigation */}
              <div className="tabs tabs-boxed mb-6 bg-white/10 backdrop-blur-sm border border-white/20">
                <button 
                  className={`tab ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-white/10'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </button>
                <button 
                  className={`tab ${activeTab === 'notifications' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-white/10'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge badge-primary badge-sm ml-2">{unreadCount}</span>
                  )}
                </button>
                <button 
                  className={`tab ${activeTab === 'splits' ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-white/10'}`}
                  onClick={() => setActiveTab('splits')}
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Pending Splits
                  {pendingCount > 0 && (
                    <span className="badge badge-warning badge-sm ml-2">{pendingCount}</span>
                  )}
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                      <UserIcon className="h-5 w-5 mr-2" />
                      User Profile
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium text-purple-200">Wallet Address</span>
                        </label>
                        <Address address={connectedAddress} />
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium text-purple-200">Balance</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="h-5 w-5 text-purple-200" />
                          <span className="font-mono text-white">
                            {userBalance ? formatEther(userBalance.value) : '0'} {userBalance?.symbol}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium text-purple-200">Notifications</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <BellIcon className="h-5 w-5 text-purple-200" />
                          <span className="text-white">{notifications.length} total, {unreadCount} unread</span>
                        </div>
                      </div>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium text-purple-200">Pending Splits</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-5 w-5 text-purple-200" />
                          <span className="text-white">{pendingCount} pending payments</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                    <h3 className="text-lg font-bold mb-4 text-white">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/buyer" className="btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold">
                        Create New Split
                      </Link>
                      <button 
                        className="btn bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20"
                        onClick={() => setActiveTab('notifications')}
                      >
                        View Notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Notifications</h2>
                                         <button 
                       className="btn btn-sm btn-outline"
                       onClick={clearAll}
                     >
                       Clear All
                     </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="bg-base-100 p-8 rounded-lg border border-base-300 text-center">
                      <BellIcon className="h-12 w-12 mx-auto mb-4 text-base-content/50" />
                      <p className="text-lg font-medium mb-2">No notifications yet</p>
                      <p className="text-base-content/70">You'll see notifications here when someone creates a split with you</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`bg-base-100 p-4 rounded-lg border ${
                            notif.isRead ? 'border-base-300' : 'border-primary'
                          } ${notif.isCompleted ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {notif.type === 'split_request' && (
                                  <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
                                )}
                                {notif.type === 'payment_received' && (
                                  <CheckCircleIcon className="h-5 w-5 text-success" />
                                )}
                                {notif.type === 'group_created' && (
                                  <UserGroupIcon className="h-5 w-5 text-info" />
                                )}
                                <h3 className="font-bold">{notif.title}</h3>
                                {!notif.isRead && (
                                  <span className="badge badge-primary badge-sm">New</span>
                                )}
                                {notif.isCompleted && (
                                  <span className="badge badge-success badge-sm">Completed</span>
                                )}
                              </div>
                              <p className="text-base-content/70 mb-2">{notif.message}</p>
                              <div className="flex items-center space-x-4 text-sm text-base-content/50">
                                <span>From: <Address address={notif.from} /></span>
                                <span>Amount: {notif.amount} MON</span>
                                <span>{new Date(notif.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                                             {!notif.isRead && (
                                 <button 
                                   className="btn btn-sm btn-outline"
                                   onClick={() => markAsRead(notif.id)}
                                 >
                                   Mark Read
                                 </button>
                               )}
                              {notif.type === 'split_request' && !notif.isCompleted && (
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handlePaySplit(notif)}
                                  disabled={isLoading || isMining}
                                >
                                  {isLoading || isMining ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                  ) : (
                                    `Pay ${notif.amount} MON`
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pending Splits Tab */}
              {activeTab === 'splits' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Pending Splits</h2>
                  
                  {pendingCount === 0 ? (
                    <div className="bg-base-100 p-8 rounded-lg border border-base-300 text-center">
                      <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-base-content/50" />
                      <p className="text-lg font-medium mb-2">No pending splits</p>
                      <p className="text-base-content/70">You're all caught up with your payments!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications
                        .filter(n => !n.isCompleted && n.type === 'split_request')
                        .map((notif) => (
                          <div key={notif.id} className="bg-base-100 p-4 rounded-lg border border-warning">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
                                  <h3 className="font-bold">Pending Payment</h3>
                                  <span className="badge badge-warning badge-sm">Action Required</span>
                                </div>
                                <p className="text-base-content/70 mb-2">{notif.message}</p>
                                <div className="flex items-center space-x-4 text-sm text-base-content/50">
                                  <span>Amount: <strong>{notif.amount} MON</strong></span>
                                  <span>From: <Address address={notif.from} /></span>
                                  <span>{new Date(notif.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                              <button 
                                className="btn btn-warning"
                                onClick={() => handlePaySplit(notif)}
                                disabled={isLoading || isMining}
                              >
                                {isLoading || isMining ? (
                                  <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                  `Pay ${notif.amount} MON`
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage; 