"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, BanknotesIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth/useScaffoldContract";
import { formatEther } from "viem";

const ContractPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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

  const { data: owner } = useContractRead({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "owner",
  });

  // Contract balance
  const { data: contractBalance } = useBalance({
    address: contract?.address,
  });

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
              <BanknotesIcon className="h-8 w-8 mr-3" />
              MonadPaymentSplitter Contract
            </h1>
          </div>

          {/* Connected Address */}
          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {/* Contract Information */}
          {contract && (
            <div className="bg-base-100 p-6 rounded-lg border border-base-300 mb-8">
              <h2 className="text-xl font-bold mb-4">Deployed Contract Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium mb-2">Contract Address:</p>
                  <Address address={contract.address} />
                </div>
                <div>
                  <p className="font-medium mb-2">Contract Owner:</p>
                  <Address address={owner} />
                </div>
                <div>
                  <p className="font-medium mb-2">Contract Balance:</p>
                  <p className="text-lg font-bold">
                    {contractBalance ? formatEther(contractBalance.value) : "0"} MON
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Total Shares:</p>
                  <p className="text-lg font-bold">{totalShares?.toString() || "0"}</p>
                </div>
                <div>
                  <p className="font-medium mb-2">Total Released:</p>
                  <p className="text-lg font-bold">
                    {totalReleased ? formatEther(totalReleased) : "0"} MON
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Number of Payees:</p>
                  <p className="text-lg font-bold">{payeeCount?.toString() || "0"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
            <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <BugAntIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Tinker with your smart contract using the{" "}
                  <Link href="/debug" passHref className="link">
                    Debug Contracts
                  </Link>{" "}
                  tab.
                </p>
              </div>
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Explore your local transactions with the{" "}
                  <Link href="/blockexplorer" passHref className="link">
                    Block Explorer
                  </Link>{" "}
                  tab.
                </p>
              </div>
            </div>
          </div>

          {/* Contract Functions */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Contract Functions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-base-200 p-4 rounded">
                <h3 className="font-bold mb-2">View Functions</h3>
                <ul className="text-sm space-y-1">
                  <li>• <code>totalShares()</code> - Get total shares</li>
                  <li>• <code>totalReleased()</code> - Get total released amount</li>
                  <li>• <code>getPayeeCount()</code> - Get number of payees</li>
                  <li>• <code>shares(address)</code> - Get shares for address</li>
                  <li>• <code>released(address)</code> - Get released amount for address</li>
                  <li>• <code>pendingPayment(address)</code> - Get pending payment for address</li>
                </ul>
              </div>
              <div className="bg-base-200 p-4 rounded">
                <h3 className="font-bold mb-2">Write Functions</h3>
                <ul className="text-sm space-y-1">
                  <li>• <code>release(address)</code> - Withdraw funds for address</li>
                  <li>• <code>receive()</code> - Send payment to contract (payable)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-base-100 p-6 rounded-lg border border-base-300">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/buyer" className="btn btn-outline">
                Send Payment
              </Link>
              <Link href="/seller" className="btn btn-outline">
                Withdraw Funds
              </Link>
              <Link href="/debug" className="btn btn-outline">
                Debug Contract
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractPage;
