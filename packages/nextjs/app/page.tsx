"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const LandingPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Monad Payment Splitter</span>
          </h1>
          <p className="text-center text-lg mt-4">A decentralized payment splitting solution on Monad blockchain</p>

          {connectedAddress && (
            <div className="flex justify-center items-center space-x-2 flex-col mt-6">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          )}

          {!connectedAddress && (
            <div className="text-center mt-6">
              <p className="text-lg">Please connect your wallet to get started</p>
            </div>
          )}
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <Link
              href="/buyer"
              passHref
              className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:bg-base-200 transition-colors"
            >
              <ShoppingCartIcon className="h-8 w-8 fill-secondary" />
              <h3 className="text-xl font-bold mt-4 mb-2">Buyer</h3>
              <p>Send payments and manage your transactions. View payment history and track your spending.</p>
            </Link>

            <Link
              href="/contract"
              passHref
              className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:bg-base-200 transition-colors"
            >
              <UserIcon className="h-8 w-8 fill-secondary" />
              <h3 className="text-xl font-bold mt-4 mb-2">Contract</h3>
              <p>Interact with the smart contract directly. Debug, test, and manage contract functions.</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
