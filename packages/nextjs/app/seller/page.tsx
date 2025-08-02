"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const SellerPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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

          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Total Revenue</p>
                  <p className="text-2xl font-bold text-success">12.5 MON</p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-success" />
              </div>
            </div>
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-warning">3.2 MON</p>
                </div>
                <ArrowDownTrayIcon className="h-8 w-8 text-warning" />
              </div>
            </div>
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Total Transactions</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <ChartBarIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

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
                    <span className="label-text">Available Balance</span>
                  </label>
                  <div className="input input-bordered w-full bg-base-200">3.2 MON</div>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Withdrawal Amount (MON)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="input input-bordered w-full"
                    disabled={!connectedAddress}
                  />
                </div>
                <button className="btn btn-primary w-full" disabled={!connectedAddress}>
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Recent Payments Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Recent Payments
              </h2>
              <div className="space-y-3">
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment from 0x1234...</span>
                    <span className="text-success">0.5 MON</span>
                  </div>
                  <p className="text-sm text-base-content/70">2 hours ago</p>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment from 0x5678...</span>
                    <span className="text-success">1.2 MON</span>
                  </div>
                  <p className="text-sm text-base-content/70">1 day ago</p>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment from 0x9abc...</span>
                    <span className="text-success">0.8 MON</span>
                  </div>
                  <p className="text-sm text-base-content/70">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Payment Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">12.5</p>
                <p className="text-sm text-base-content/70">Total MON Received</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-base-content/70">Total Payments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-info">0.52</p>
                <p className="text-sm text-base-content/70">Average Payment</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">3.2</p>
                <p className="text-sm text-base-content/70">Pending Withdrawal</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn btn-outline" disabled={!connectedAddress}>
                View All Payments
              </button>
              <button className="btn btn-outline" disabled={!connectedAddress}>
                Export Payment Report
              </button>
              <button className="btn btn-outline" disabled={!connectedAddress}>
                Set Payment Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerPage;
