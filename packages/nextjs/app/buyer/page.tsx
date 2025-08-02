"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowLeftIcon, ClockIcon, CurrencyDollarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const BuyerPage: NextPage = () => {
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

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Send Payment Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Send Payment
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
                    disabled={!connectedAddress}
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
                    disabled={!connectedAddress}
                  />
                </div>
                <button className="btn btn-primary w-full" disabled={!connectedAddress}>
                  Send Payment
                </button>
              </div>
            </div>

            {/* Payment History Section */}
            <div className="bg-base-100 p-6 rounded-lg border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Payment History
              </h2>
              <div className="space-y-3">
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment to 0x1234...</span>
                    <span className="text-success">0.5 MON</span>
                  </div>
                  <p className="text-sm text-base-content/70">2 hours ago</p>
                </div>
                <div className="bg-base-200 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment to 0x5678...</span>
                    <span className="text-success">1.2 MON</span>
                  </div>
                  <p className="text-sm text-base-content/70">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="btn btn-outline" disabled={!connectedAddress}>
                View All Transactions
              </button>
              <button className="btn btn-outline" disabled={!connectedAddress}>
                Export Payment History
              </button>
              <button className="btn btn-outline" disabled={!connectedAddress}>
                Set Payment Limits
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyerPage;
